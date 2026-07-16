class Entity {
    constructor(x, y) {
        this.x = x;     // координата по горизонтали
        this.y = y;     // координата по вертикали
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Grass extends Entity {
    static energy;      // энергия (у всех одинаковая)

    constructor(x, y, energy) {
        super(x, y);

        Grass.energy = energy;
    }
}

class Herbivore extends Entity {
    static reproduction;// расход на размножение
    static waste;       // расход энергии в секунду

    static speed;       // скорость передвижения
    static radius;      // радиус видимости

    constructor(x, y, energy) {
        super(x, y);

        this.energy = energy; // энергия
    }

    move(dx, dy, mx, my) {
        this.x += dx * this.constructor.speed;
        this.y += dy * this.constructor.speed;

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;

        if (this.x > mx) this.x = mx;
        if (this.y > my) this.y = my;
    }

    eat(energy) {
        this.energy += energy;
    }

    waste() {
        const lost = Math.min(this.energy, this.constructor.waste);

        this.energy -= lost;

        return lost;
    }
}

class Predator extends Herbivore {
    constructor(x, y, energy) {
        super(x, y, energy);
    }
}

class World {
    constructor(width, height,
        hNumber, hEnergy, hWaste, hReproduction, hSpeed, hRadius,
        pNumber, pEnergy, pWaste, pReproduction, pSpeed, pRadius,
        gNumber, gEnergy) {

        this.width = width;     // ширина мира
        this.height = height;   // высота мира

        this.energy = 0;        // свободная энергия

        this.herbivores = [];   // травоядные
        this.predators = [];    // хищники
        this.grass = [];        // трава

        Herbivore.reproduction = hReproduction;
        Herbivore.waste = hWaste;
        Herbivore.speed = hSpeed;
        Herbivore.radius = hRadius;

        Predator.reproduction = pReproduction;
        Predator.waste = pWaste;
        Predator.speed = pSpeed;
        Predator.radius = pRadius;

        Grass.energy = gEnergy;

        function setMas(Class, creatures, number, energy) {
            for (let i = 0; i < number; i++) {
                creatures.push(new Class(
                    Math.random() * width, Math.random() * height, energy
                ));
            }
        }

        setMas(Herbivore, this.herbivores, hNumber, hEnergy);
        setMas(Predator, this.predators, pNumber, pEnergy);
        setMas(Grass, this.grass, gNumber, gEnergy);
    }

    // удаление мёртвых существ
    removeDead(creatures) {
        for (let i = creatures.length - 1; i >= 0; i--) {
            if (creatures[i].energy <= 0) {
                creatures.splice(i, 1);
            }
        }
    }

    // рост травы
    growGrass() {
        while (this.energy >= Grass.energy) {
            this.grass.push(new Grass(
                Math.random() * this.width,
                Math.random() * this.height,
                Grass.energy
            ));

            this.energy -= Grass.energy;
        }
    }

    // потеря энергии
    wasteEnergy(creatures) {
        for (const animal of creatures) {
            this.energy += animal.waste();
        }
    }

    // размножение
    reproduction(Class, creatures) {
        const newborns = [];

        for (const animal of creatures) {
            if (animal.energy >= Class.reproduction) {
                animal.energy /= 2;

                const newb = new Class(
                    animal.x,
                    animal.y,
                    animal.energy,
                )

                let x = Math.random() * 2 - 1;
                let y = (1 - x ** 2) ** (1 / 2);

                if (Math.floor(Math.random() * 2) == 0) {
                    y = -y;
                }

                newb.move(x * 3, y * 3, this.width, this.height);

                newborns.push(newb);
            }
        }

        creatures.push(...newborns);
    }

    // найти ближайшего
    findNearest(creature, targets, radius) {
        let nearest = null;
        let distance = Infinity;

        for (const target of targets) {
            const x = target.x - creature.x;
            const y = target.y - creature.y;
            const r = Math.hypot(x, y);

            if (r <= radius && r < distance) {
                distance = r;
                nearest = target;
            }
        }

        return { nearest, distance };
    }

    // двигаться и есть
    moveAndEat(eClass, eat, fClass, food) {
        for (const e of eat) {
            let result;

            while (true) {
                result = this.findNearest(e, food, eClass.radius);

                // поедание ближайшего (distance < 1*speed)
                if (result.distance <= eClass.speed) {
                    if (fClass == Grass) {
                        e.eat(Grass.energy);
                    }
                    else if (fClass == Herbivore) {
                        e.eat(result.nearest.energy);
                    }

                    food.splice(food.indexOf(result.nearest), 1);

                    continue;
                }
                // движение к ближайшему (distance < radius)
                else if (result.nearest != null) {
                    let x = result.nearest.x - e.x;
                    let y = result.nearest.y - e.y;
                    let r = Math.hypot(x, y);

                    x = x / r + (Math.random() - 0.5);
                    y = y / r + (Math.random() - 0.5);

                    r = Math.hypot(x, y);

                    e.move(x / r, y / r, this.width, this.height);
                    break;
                }
                // рандомное движение (distance > radius)
                else {
                    let x = Math.random() * 2 - 1;
                    let y = (1 - x ** 2) ** (1 / 2);

                    if (Math.floor(Math.random() * 2) == 0) {
                        y = -y;
                    }

                    e.move(x, y, this.width, this.height);
                    break;
                }
            }
        }
    }

    // шаг симуляции
    step() {
        this.moveAndEat(Herbivore, this.herbivores, Grass, this.grass);
        this.moveAndEat(Predator, this.predators, Herbivore, this.herbivores);

        this.wasteEnergy(this.herbivores);
        this.wasteEnergy(this.predators);

        this.removeDead(this.herbivores);
        this.removeDead(this.predators);

        this.reproduction(Herbivore, this.herbivores);
        this.reproduction(Predator, this.predators);

        this.growGrass();
    }
}