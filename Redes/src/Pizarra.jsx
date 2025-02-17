import React, { useState, useRef } from "react";
import { Stage, Layer, Circle, Text, Arrow } from "react-konva";
import Swal from "sweetalert2";

const App = () => {
  const [nodes, setNodes] = useState([]); // Almacena los nodos
  const [edges, setEdges] = useState([]); // Almacena las aristas
  const [selectedNode, setSelectedNode] = useState(null); // Nodo seleccionado para crear arista
  const [draggingEdge, setDraggingEdge] = useState(null); // Flecha que se está arrastrando
  const [draggingEnd, setDraggingEnd] = useState(null); // Indica si se arrastra la cabeza (to) o la cola (from)
  const stageRef = useRef(null); // Referencia al stage de Konva

  //Crear la Función para Exportar la Matriz en JSON
  const exportMatrixToJson = () => {
    const { matrix, rowSums, colSums } = generateAdjacencyMatrix();
  
    const jsonData = {
      nodes: nodes.map((node) => node.name), // Nombres de los nodos
      matrix: matrix, // Matriz de adyacencia
      rowSums: rowSums, // Sumas de las filas
      colSums: colSums, // Sumas de las columnas
    };
  
    // Convertir el objeto a JSON
    const jsonString = JSON.stringify(jsonData, null, 2);
  
    // Crear un archivo JSON y descargarlo
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "matriz_adyacencia.json";
    link.click();
    URL.revokeObjectURL(url);
  };

//importar el JSON.
  const importGraphFromJson = (event) => {
    const file = event.target.files[0]; // Obtener el archivo seleccionado
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result); // Convertir el archivo a objeto JSON
        rebuildGraphFromJson(jsonData); // Reconstruir el grafo
      };
      reader.readAsText(file); // Leer el archivo como texto
    }
  };
  
  const rebuildGraphFromJson = (jsonData) => {
    // Reconstruir los nodos
    const newNodes = jsonData.nodes.map((name, index) => ({
      id: `node-${index + 1}`,
      x: 100 + index * 100, // Posición inicial (puedes ajustarla)
      y: 100,
      name: name,
    }));
  
    // Reconstruir las aristas
    const newEdges = [];
    jsonData.matrix.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== 0) {
          newEdges.push({
            id: `edge-${newEdges.length + 1}`,
            from: newNodes[i].id,
            to: newNodes[j].id,
            weight: cell,
          });
        }
      });
    });
  
    // Actualizar el estado con los nuevos nodos y aristas
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Función para agregar un nodo
  const handleAddNode = (e) => {
    if (e.evt.button === 0 && e.evt.detail === 2) { // Doble click izquierdo
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();

      Swal.fire({
        title: 'Nombre del nodo',
        input: 'text',
        inputPlaceholder: 'Ingrese el nombre del nodo',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        preConfirm: (name) => {
          if (name) {
            setNodes([
              ...nodes,
              {
                id: `node-${nodes.length + 1}`,
                x: pointerPosition.x,
                y: pointerPosition.y,
                name: name,
              },
            ]);
          } else {
            Swal.showValidationMessage('Por favor ingresa un nombre válido');
          }
        }
      });
    }
  };

  // Función para iniciar la creación de una arista
  const handleStartEdge = (nodeId) => {
    if (selectedNode === null) {
      // Si no hay un nodo seleccionado, seleccionar este nodo
      setSelectedNode(nodeId);
    } else if (selectedNode === nodeId) {
      // Si se hace clic en el mismo nodo, deseleccionar
      setSelectedNode(null);
    } else {
      // Si hay un nodo seleccionado y se hace clic en otro nodo, crear la arista
      Swal.fire({
        title: 'Peso de la arista',
        input: 'number',
        inputPlaceholder: 'Ingrese el peso de la arista',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        preConfirm: (weight) => {
          if (weight) {
            const newEdge = {
              id: `edge-${edges.length + 1}`,
              from: selectedNode,
              to: nodeId,
              weight: parseInt(weight),
            };
            setEdges([...edges, newEdge]);
            setSelectedNode(null); // Resetear el nodo seleccionado
          } else {
            Swal.showValidationMessage('Por favor ingresa un valor válido');
          }
        }
      });
    }
  };

  // Función para iniciar el arrastre de una flecha
  const handleDragStart = (edgeId, end) => {
    setDraggingEdge(edgeId);
    setDraggingEnd(end); // 'from' o 'to'
  };

  // Función para finalizar el arrastre de una flecha
  const handleDragEnd = (e) => {
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

  const handleDragMoveNode = (e, nodeId) => {
    const { x, y } = e.target.position();  // Obtiene la nueva posición del nodo
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, x, y } : node  // Actualiza la posición solo del nodo que se está moviendo
    );
    setNodes(updatedNodes);  // Actualiza el estado con la nueva posición del nodo
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
  
    // Calcular la suma de las filas
    const rowSums = matrix.map((row) => row.reduce((sum, cell) => sum + cell, 0));
  
    // Calcular la suma de las columnas
    const colSums = Array(nodes.length).fill(0);
    matrix.forEach((row) => {
      row.forEach((cell, j) => {
        colSums[j] += cell;
      });
    });
  
    return { matrix, rowSums, colSums };
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
                  radius={30}
                  fill="lightblue"
                  stroke="black"
                  strokeWidth={2}
                  draggable
                  onDragMove={(e) => handleDragMoveNode(e, node.id)}
                  onContextMenu={(e) => {
                    e.evt.preventDefault(); // Evitar el menú contextual predeterminado
                    handleStartEdge(node.id);
                  }}
                />
                <Text
                  x={node.x - 6}
                  y={node.y - 6}
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
  
              // Calcular los puntos de la flecha de forma dinámica
              const fromX = fromNode.x + Math.cos(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 31;
              const fromY = fromNode.y + Math.sin(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 31;
              const toX = toNode.x - Math.cos(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 31;
              const toY = toNode.y - Math.sin(Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)) * 31;
  
              return (
                <React.Fragment key={edge.id}>
                  <Arrow
                    points={[fromX, fromY, toX, toY]}
                    pointerLength={10}
                    pointerWidth={10}
                    fill="black"
                    stroke="black"
                    strokeWidth={2}
                    onMouseDown={(e) => {
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
                    x={toX - Math.cos(Math.atan2(toY - fromY, toX - fromX)) * 35}
                    y={5 + (toY - Math.sin(Math.atan2(toY - fromY, toX - fromX)) * 35)}
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
              <th>Suma</th> {/* Columna para la suma de las filas */}
            </tr>
          </thead>
          <tbody>
            {generateAdjacencyMatrix().matrix.map((row, i) => (
              <tr key={i}>
                <td>{nodes[i].name}</td>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
                <td>{generateAdjacencyMatrix().rowSums[i]}</td> {/* Suma de la fila */}
              </tr>
            ))}
            <tr>
              <td>Suma</td> {/* Fila para la suma de las columnas */}
              {generateAdjacencyMatrix().colSums.map((sum, j) => (
                <td key={j}>{sum}</td>
              ))}
              <td>
                {generateAdjacencyMatrix().rowSums.reduce((total, sum) => total + sum, 0)} {/* Suma total */}
              </td>
            </tr>
          </tbody>
        </table>
  
        {/* Botón para exportar la matriz en JSON */}
        <button
          onClick={exportMatrixToJson}
          style={{ marginTop: 20, padding: 10, fontSize: 16 }}
        >
          Imprimir Matriz (JSON)
        </button>
  
        {/* Botón para importar la matriz desde JSON */}
        <div style={{ marginTop: 20 }}>
          <input
            type="file"
            accept=".json"
            onChange={importGraphFromJson}
            style={{ display: "none" }}
            id="import-json"
          />
          <label htmlFor="import-json" style={{ padding: 10, fontSize: 16, cursor: "pointer", border: "1px solid #000" }}>
            Importar Matriz (JSON)
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;