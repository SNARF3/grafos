import React, { useState, useRef } from "react";
import { Stage, Layer, Circle, Text, Arrow } from "react-konva";

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tempEdge, setTempEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeName, setNodeName] = useState("");
  const [edgeWeight, setEdgeWeight] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const stageRef = useRef(null);

  const handleAddNode = (e) => {
    if (e.evt.button === 0 && e.evt.detail === 2) {
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

  const handleStartEdge = (nodeId, e) => {
    if (e.evt.button === 0) {
      setTempEdge({ from: nodeId, to: null });
    }
  };

  const handleEndEdge = (nodeId) => {
    if (tempEdge && tempEdge.from !== nodeId) {
      setShowWeightInput(true);
      setTempEdge({ ...tempEdge, to: nodeId });
    }
  };

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
    }
  };

  // Crear una matriz de adyacencia para representar el grafo
  const createAdjacencyMatrix = () => {
    const matrix = Array(nodes.length).fill().map(() => Array(nodes.length).fill(0));
    edges.forEach((edge) => {
      const fromIndex = nodes.findIndex((node) => node.id === edge.from);
      const toIndex = nodes.findIndex((node) => node.id === edge.to);
      if (fromIndex >= 0 && toIndex >= 0) {
        matrix[fromIndex][toIndex] = edge.weight;
      }
    });
    return matrix;
  };

  return (
    <div style={{ display: "flex" }}>
      <Stage
        width={window.innerWidth * 0.7}
        height={window.innerHeight}
        onMouseDown={handleAddNode}
        ref={stageRef}
      >
        <Layer>
          {nodes.map((node) => (
            <React.Fragment key={node.id}>
              <Circle
                x={node.x}
                y={node.y}
                radius={20}
                fill="lightblue"
                stroke="black"
                strokeWidth={2}
                onMouseDown={(e) => handleStartEdge(node.id, e)}
                onMouseUp={() => handleEndEdge(node.id)}
              />
              <Text
                x={node.x - 10}
                y={node.y - 30}
                text={node.name || `Node ${nodes.indexOf(node) + 1}`}
                fontSize={16}
                fill="black"
              />
            </React.Fragment>
          ))}
          {edges.map((edge) => {
            const fromNode = nodes.find((node) => node.id === edge.from);
            const toNode = nodes.find((node) => node.id === edge.to);
            
            // Calcular los puntos de la flecha de forma dinámica
            const fromX = fromNode.x + Math.cos(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 20;
            const fromY = fromNode.y + Math.sin(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 20;
            const toX = toNode.x - Math.cos(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 20;
            const toY = toNode.y - Math.sin(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 20;

            return (
              <React.Fragment key={edge.id}>
                <Arrow
                  points={[fromX, fromY, toX, toY]}
                  pointerLength={10}
                  pointerWidth={10}
                  fill="black"
                  stroke="black"
                  strokeWidth={2}
                />
                <Text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2}
                  text={edge.weight.toString()}
                  fontSize={16}
                  fill="red"
                />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>

      <div style={{ padding: "20px", marginLeft: "20px" }}>
        <h3>Adjacency Matrix:</h3>
        <table border="1">
          <thead>
            <tr>
              {nodes.map((node, index) => (
                <th key={node.id}>{node.name || `Node ${index + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {createAdjacencyMatrix().map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default App;