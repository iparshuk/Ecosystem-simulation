function App() {
    const timer = React.useRef(null);
    const [running, setRunning] = React.useState(false);
    const [zoom, setZoom] = React.useState(1);
    const [history, setHistory] = React.useState([]);

    // шаг симуляции
    function step() {
        world.step();

        setWorld(
            Object.assign(
                Object.create(Object.getPrototypeOf(world)),
                world
            )
        );

        setHistory(prev => {
            const next = [
                ...prev,
                {
                    herbivores: world.herbivores.length,
                    predators: world.predators.length,
                    grass: world.grass.length
                }
            ];

            if (next.length > 200)
                next.shift();

            return next;
        });
    }

    // ход симуляции
    function toggleSimulation() {
        if (running) {
            clearInterval(timer.current);
            timer.current = null;
            setRunning(false);
        } else {
            timer.current = setInterval(() => {
                step();
            }, 1000 / params.fps);

            setRunning(true);
        }
    }

    // обработка полей ввода
    function change(e) {
        setParams({
            ...params,
            [e.target.name]: Number(e.target.value)
        });
    }

    // создание нового мира
    function recreateWorld() {
        if (running) {
            clearInterval(timer.current);
            timer.current = null;
            setRunning(false);
        }

        setWorld(new World(
            params.width,
            params.height,

            params.hNumber,
            params.hEnergy,
            params.hWaste,
            params.hReproduction,
            params.hSpeed,
            params.hRadius,

            params.pNumber,
            params.pEnergy,
            params.pWaste,
            params.pReproduction,
            params.pSpeed,
            params.pRadius,

            params.gNumber,
            params.gEnergy
        ));

        setHistory([]);
    }

    // создание начального мира
    const [params, setParams] = React.useState({
        width: 800,
        height: 500,
        fps: 10,

        hNumber: 100,
        hEnergy: 100,
        hWaste: 1,
        hReproduction: 150,
        hSpeed: 4,
        hRadius: 50,

        pNumber: 10,
        pEnergy: 150,
        pWaste: 2,
        pReproduction: 300,
        pSpeed: 4,
        pRadius: 100,

        gNumber: 400,
        gEnergy: 20,
    });

    // объект мира
    const [world, setWorld] = React.useState(
        new World(
            params.width,
            params.height,

            params.hNumber,
            params.hEnergy,
            params.hWaste,
            params.hReproduction,
            params.hSpeed,
            params.hRadius,

            params.pNumber,
            params.pEnergy,
            params.pWaste,
            params.pReproduction,
            params.pSpeed,
            params.pRadius,

            params.gNumber,
            params.gEnergy
        )
    );
    
    // изменение fps в реальном времени
    React.useEffect(() => {
        if (running) {
            clearInterval(timer.current);

            timer.current = setInterval(() => {
                step();
            }, 1000 / params.fps);
        }

        return () => clearInterval(timer.current);
    }, [params.fps]);

    return (
        <div className="layout">

            <div className="menu">
                
                <h3>Популяции</h3>

                <svg width="240" height="120" className="graph">
                    {["grass", "herbivores", "predators"].map((key, index) => {
                        const colors = ["green", "blue", "red"];
                        const GRASS_SCALE = 4;
                        const max = Math.max(
                            1,
                            ...history.flatMap(h => [
                                h.grass / GRASS_SCALE,
                                h.herbivores,
                                h.predators
                            ])
                        );

                        const points = history.map((h, i) => {
                            const x = i / Math.max(1, history.length - 1) * 240;
                            const value = (key === "grass") ? (h.grass / GRASS_SCALE) : (h[key]);

                            const y = 120 - value / max * 110;

                            return `${x},${y}`;
                        }).join(" ");

                        return (
                            <polyline
                                key={key}
                                fill="none"
                                stroke={colors[index]}
                                strokeWidth="2"
                                points={points}
                            />
                        );
                    })}
                </svg>

                <h3>FPS</h3>
                <input type="number" name="fps" min="1" value={params.fps} onChange={change} />

                <button onClick={toggleSimulation}>
                    {running ? "Остановить" : "Запустить"}
                </button>

                <button onClick={step}>
                    Шаг
                </button>

                <button onClick={recreateWorld}>
                    Создать мир
                </button>

                <h2>Параметры</h2>

                <h3>Мир</h3>

                <label>Ширина</label>
                <input type="number" name="width" value={params.width} onChange={change} />

                <label>Высота</label>
                <input type="number" name="height" value={params.height} onChange={change} />

                <h3>Травоядные</h3>

                <label>Количество</label>
                <input type="number" name="hNumber" value={params.hNumber} onChange={change} />

                <label>Энергия</label>
                <input type="number" name="hEnergy" value={params.hEnergy} onChange={change} />

                <label>Расход</label>
                <input type="number" name="hWaste" value={params.hWaste} onChange={change} />

                <label>Размножение</label>
                <input type="number" name="hReproduction" value={params.hReproduction} onChange={change} />

                <label>Скорость</label>
                <input type="number" name="hSpeed" value={params.hSpeed} onChange={change} />

                <label>Радиус</label>
                <input type="number" name="hRadius" value={params.hRadius} onChange={change} />

                <h3>Хищники</h3>

                <label>Количество</label>
                <input type="number" name="pNumber" value={params.pNumber} onChange={change} />

                <label>Энергия</label>
                <input type="number" name="pEnergy" value={params.pEnergy} onChange={change} />

                <label>Расход</label>
                <input type="number" name="pWaste" value={params.pWaste} onChange={change} />

                <label>Размножение</label>
                <input type="number" name="pReproduction" value={params.pReproduction} onChange={change} />

                <label>Скорость</label>
                <input type="number" name="pSpeed" value={params.pSpeed} onChange={change} />

                <label>Радиус</label>
                <input type="number" name="pRadius" value={params.pRadius} onChange={change} />

                <h3>Трава</h3>

                <label>Количество</label>
                <input type="number" name="gNumber" value={params.gNumber} onChange={change} />

                <label>Энергия</label>
                <input type="number" name="gEnergy" value={params.gEnergy} onChange={change} />

            </div>

            <div
                className="world-wrapper"
                onWheel={(e) => {
                    e.preventDefault();

                    const rect = e.currentTarget.getBoundingClientRect();

                    const mouseX = e.clientX - rect.left + e.currentTarget.scrollLeft;
                    const mouseY = e.clientY - rect.top + e.currentTarget.scrollTop;

                    const oldZoom = zoom;
                    const newZoom = Math.min(
                        5,
                        Math.max(0.2, oldZoom * (e.deltaY < 0 ? 1.1 : 0.9))
                    );

                    const scale = newZoom / oldZoom;

                    requestAnimationFrame(() => {
                        e.currentTarget.scrollLeft = mouseX * scale - (e.clientX - rect.left);
                        e.currentTarget.scrollTop = mouseY * scale - (e.clientY - rect.top);
                    });

                    setZoom(newZoom);
                }}
            >

                <div
                    className="world"
                    style={{
                        width: world.width,
                        height: world.height,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left"
                    }}
                >

                    {world.grass.map((g, i) => (
                        <div
                            key={"g" + i}
                            className="grass"
                            style={{ left: g.x, top: g.y }}
                        />
                    ))}

                    {world.herbivores.map((h, i) => (
                        <div
                            key={"h" + i}
                            className="herbivore"
                            style={{ left: h.x, top: h.y }}
                        >
                            {Math.round(h.energy)}
                        </div>
                    ))}

                    {world.predators.map((p, i) => (
                        <div
                            key={"p" + i}
                            className="predator"
                            style={{ left: p.x, top: p.y }}
                        >
                            {Math.round(p.energy)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);