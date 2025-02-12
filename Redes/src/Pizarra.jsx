import { useState } from "react";
import Nodo from "./Nodo";
import Swal from "sweetalert2";

const Pizarra = () => {
    const [nodos, setNodos] = useState([]);
    const [selectedNodos, setSelectedNodos] = useState([]);
    const [lineas, setLineas] = useState([]);

    const solicitarNombre = async () => {
        const { value: nombre } = await Swal.fire({
            title: "Ingrese el nombre del nodo",
            input: "text",
            inputPlaceholder: "Ejemplo: Nodo A",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
        });

        return nombre || null; 
    };

    const solicitarValorLinea = async () => {
        const { value: valor } = await Swal.fire({
            title: "Ingrese el valor de la línea",
            input: "number",
            inputPlaceholder: "Ejemplo: 10",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
        });

        return valor || null;
    };

    const DobleClickEjecutado = async (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const nombre = await solicitarNombre();
        if (!nombre) return; 
        console.log("nombre: ", nombre);
        setNodos([...nodos, { x, y, valor: nombre }]);
    };

    const handleDrag = (x, y, valor) => {
        setNodos(nodos.map(nodo => nodo.valor === valor ? { ...nodo, x, y } : nodo));
        setLineas(lineas.map(linea => {
            if (linea.nodo1.valor === valor) {
                return { ...linea, nodo1: { ...linea.nodo1, x, y } };
            } else if (linea.nodo2.valor === valor) {
                return { ...linea, nodo2: { ...linea.nodo2, x, y } };
            }
            return linea;
        }));
    };

    const handleNodoRightClick = async (nodo, e) => {
        e.preventDefault();
        if (selectedNodos.length === 1 && selectedNodos[0].valor === nodo.valor) {
            setSelectedNodos([]);
        } else if (selectedNodos.length < 2) {
            setSelectedNodos([...selectedNodos, nodo]);
        }

        if (selectedNodos.length === 1) {
            const nodo1 = selectedNodos[0];
            const nodo2 = nodo;
            const valorLinea = await solicitarValorLinea();
            if (!valorLinea) return;
            setLineas([...lineas, { nodo1, nodo2, valor: valorLinea }]);
            setSelectedNodos([]);
        }
    };
    return (
        <div
            style={{ width: "100vw", height: "100vh", background: "#112230", position: "relative" }}
            onDoubleClick={DobleClickEjecutado}
        >
            {lineas.map((linea, index) => {
                const angle = Math.atan2(linea.nodo2.y - linea.nodo1.y, linea.nodo2.x - linea.nodo1.x);
                const radius = 20; // Assuming the radius of the sphere is 20
                const offset = 10; // Additional offset to shorten the lines
                const x1 = linea.nodo1.x + (radius + offset) * Math.cos(angle);
                const y1 = linea.nodo1.y + (radius + offset) * Math.sin(angle);
                const x2 = linea.nodo2.x - (radius + offset) * Math.cos(angle);
                const y2 = linea.nodo2.y - (radius + offset) * Math.sin(angle);

                return (
                    <svg key={index} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                        <defs>
                            <marker
                                id={`arrowhead-${index}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="0"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                            </marker>
                        </defs>
                        <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="white"
                            strokeWidth="2"
                            markerEnd={`url(#arrowhead-${index})`}
                        />
                        <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2}
                            fill="white"
                            fontSize="14px"
                            fontWeight="bold"
                        >
                            {linea.valor}
                        </text>
                    </svg>
                );
            })}
            {nodos.map((nodo) => (
                <Nodo
                    key={nodo.valor}
                    x={nodo.x}
                    y={nodo.y}
                    valor={nodo.valor}
                    onDrag={handleDrag}
                    onRightClick={(e) => handleNodoRightClick(nodo, e)}
                />
            ))}
        </div>
    );
};

export default Pizarra;