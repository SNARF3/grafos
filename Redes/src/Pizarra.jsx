import React, { useState, useRef } from "react";
import { Stage, Layer, Circle, Text, Arrow } from "react-konva";

const App = () => {
  const [nodes, setNodes] = useState([]); // Almacena los nodos
  const [edges, setEdges] = useState([]); // Almacena las aristas
  const [tempEdge, setTempEdge] = useState(null); // Arista temporal al crear
  const [selectedNode, setSelectedNode] = useState(null); // Nodo seleccionado para crear arista
  const [nodeName, setNodeName] = useState(""); // Nombre del nodo
  const [edgeWeight, setEdgeWeight] = useState(""); // Peso de la arista
  const [showNameInput, setShowNameInput] = useState(false); // Mostrar input de nombre
  const [showWeightInput, setShowWeightInput] = useState(false); // Mostrar input de peso
  const [draggingEdge, setDraggingEdge] = useState(null); // Flecha que se está arrastrando
  const [draggingEnd, setDraggingEnd] = useState(null); // Indica si se arrastra la cabeza (to) o la cola (from)
  const stageRef = useRef(null); // Referencia al stage de Konva

  // Función para agregar un nodo
    const handleAddNode = (e) => {
        if (e.evt.button === 0 && e.evt.detail === 2) { // Doble click izquierdo
        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();
        setShowNameInput(true);
        setNodes([
            ...nodes,
            {
            id: `node-${nodes.length + 1}`,
            x: pointerPosition.x,
            y: pointerPosition.y,
            name: "",
            },
        ]);
        }
    };

    // Función para confirmar el nombre del nodo
    const confirmNodeName = () => {
        if (nodeName.trim()) {
        const updatedNodes = nodes.map((node, index) =>
            index === nodes.length - 1 ? { ...node, name: nodeName } : node
        );
        setNodes(updatedNodes);
        setNodeName("");
        setShowNameInput(false);
        }
    };

    // Función para iniciar la creación de una arista
    const handleStartEdge = (nodeId) => {
        if (selectedNode === null) {
        setSelectedNode(nodeId);
        } else {
        setShowWeightInput(true);
        setTempEdge({ from: selectedNode, to: nodeId });
        }
    };

    // Función para confirmar el peso de la arista
    const confirmEdgeWeight = () => {
        if (edgeWeight.trim()) {
        const newEdge = {
            id: `edge-${edges.length + 1}`,
            from: tempEdge.from,
            to: tempEdge.to,
            weight: parseInt(edgeWeight),
        };
        setEdges([...edges, newEdge]);
        setEdgeWeight("");
        setShowWeightInput(false);
        setTempEdge(null);
        setSelectedNode(null);
        }
    };

    // Función para iniciar el arrastre de una flecha
    const handleDragStart = (edgeId, end) => {
        setDraggingEdge(edgeId);
        setDraggingEnd(end); // 'from' o 'to'
    };

    // Función para finalizar el arrastre de una flecha
    const handleDragEnd = (e) => {
        console.log(e)
        if (draggingEdge) {
        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        // Encontrar el nodo más cercano al punto donde se soltó la flecha
        const closestNode = nodes.reduce((closest, node) => {
            const distance = Math.sqrt(
            Math.pow(node.x - pointerPosition.x, 2) +
            Math.pow(node.y - pointerPosition.y, 2)
            );
            if (distance < 30 && distance < closest.distance) {
            return { node, distance };
            }
            return closest;
        }, { node: null, distance: Infinity });

        if (closestNode.node) {
            // Actualizar la arista con el nuevo nodo
            const updatedEdges = edges.map((edge) =>
            edge.id === draggingEdge
                ? {
                    ...edge,
                    [draggingEnd]: closestNode.node.id,
                }
                : edge
            );
            setEdges(updatedEdges);
        }

        setDraggingEdge(null);
        setDraggingEnd(null);
        }
    };

    // Generar matriz de adyacencia
    const generateAdjacencyMatrix = () => {
        const matrix = Array(nodes.length)
        .fill()
        .map(() => Array(nodes.length).fill(0));

        edges.forEach((edge) => {
        const fromIndex = nodes.findIndex((node) => node.id === edge.from);
        const toIndex = nodes.findIndex((node) => node.id === edge.to);
        matrix[fromIndex][toIndex] = edge.weight;
        });

        return matrix;
    };

    return (
        <div style={{ display: "flex" }}>
        <div>
            <Stage
            width={window.innerWidth * 0.7}
            height={window.innerHeight}
            onMouseDown={handleAddNode}
            onMouseUp={handleDragEnd}
            ref={stageRef}
            >
            <Layer>
                {/* Dibujar nodos */}
                {nodes.map((node) => (
                <React.Fragment key={node.id}>
                    <Circle
                    x={node.x}
                    y={node.y}
                    radius={20}
                    fill="lightblue"
                    stroke="black"
                    strokeWidth={2}
                    onContextMenu={(e) => {
                        e.evt.preventDefault();
                        handleStartEdge(node.id);
                    }}
                    />
                    <Text
                    x={node.x - 10}
                    y={node.y - 10}
                    text={node.name}
                    fontSize={16}
                    fill="black"
                    />
                </React.Fragment>
                ))}

                {/* Dibujar aristas */}
                {edges.map((edge) => {
                const fromNode = nodes.find((node) => node.id === edge.from);
                const toNode = nodes.find((node) => node.id === edge.to);
                return (
                    <React.Fragment key={edge.id}>
                    <Arrow
                        points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                        pointerLength={10}
                        pointerWidth={10}
                        fill="black"
                        stroke="black"
                        strokeWidth={2}
                        onMouseDown={(e) => {
                            console.log(e)
                            const stage = stageRef.current;
                            const pointerPosition = stage.getPointerPosition();
                            const distanceToStart = Math.sqrt(
                                Math.pow(pointerPosition.x - fromNode.x, 2) +
                                Math.pow(pointerPosition.y - fromNode.y, 2)
                            );
                            const distanceToEnd = Math.sqrt(
                                Math.pow(pointerPosition.x - toNode.x, 2) +
                                Math.pow(pointerPosition.y - toNode.y, 2)
                            );
                            if (distanceToStart < distanceToEnd) {
                                handleDragStart(edge.id, "from"); // Arrastrar la cola
                            } else {
                                handleDragStart(edge.id, "to"); // Arrastrar la cabeza
                            }
                        }}
                    />
                    <Text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2}
                        text={edge.weight.toString()}
                        fontSize={16}
                        fill="red"
                    />
                    </React.Fragment>
                );
                })}
            </Layer>
            </Stage>
        </div>

        {/* Inputs para nombre y peso */}
        {showNameInput && (
            <div style={{ position: "absolute", top: 20, left: 20 }}>
            <input
                type="text"
                placeholder="Nombre del nodo"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
            />
            <button onClick={confirmNodeName}>Confirmar</button>
            </div>
        )}

        {showWeightInput && (
            <div style={{ position: "absolute", top: 20, left: 20 }}>
            <input
                type="number"
                placeholder="Peso de la arista"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(e.target.value)}
            />
            <button onClick={confirmEdgeWeight}>Confirmar</button>
            </div>
        )}

        {/* Mostrar matriz de adyacencia */}
        <div style={{ marginLeft: 20 }}>
            <h2>Matriz de Adyacencia</h2>
            <table border="1">
            <thead>
                <tr>
                <th></th>
                {nodes.map((node) => (
                    <th key={node.id}>{node.name}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {generateAdjacencyMatrix().map((row, i) => (
                <tr key={i}>
                    <td>{nodes[i].name}</td>
                    {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
};

export default App;