import { useState } from "react";

const Nodo = () => {
    const [nodos, setNodos] = useState([]);

    const handleDoubleClick = (event) => {
        const { clientX, clientY } = event;
        setNodos((prevNodos) => [...prevNodos, { x: clientX, y: clientY }]);
    };

    return (
        <div
        onDoubleClick={handleDoubleClick}
        className="relative w-screen h-screen bg-gray-100"
        >
        {nodos.map((nodo, index) => (
            <div
            key={index}
            className="absolute bg-blue-500 rounded-full"
            style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                position: "absolute",
                top: `${nodo.y - 15}px`,
                left: `${nodo.x - 15}px`,
            }}
            />
        ))}
        </div>
    );
};

export default Nodo;
