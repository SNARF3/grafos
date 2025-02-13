import { useState } from "react";

// eslint-disable-next-line react/prop-types
const Nodo = ({ x, y, valor, onDrag, onRightClick }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            onDrag(e.clientX, e.clientY, valor);
        }
    };

    return (
        <svg
            width="50"
            height="50"
            style={{ position: "absolute", top: y - 25, left: x - 25, cursor: "pointer" }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onContextMenu={onRightClick}
        >
            <circle cx="25" cy="25" r="20" fill="blue" stroke="white" strokeWidth="2" />
            <text 
                x="25" 
                y="27" 
                textAnchor="middle" 
                fill="white" 
                fontSize="14px" 
                fontWeight="bold" 
                dominantBaseline="middle"
            >
                {valor}
            </text>
        </svg>
    );
};

export default Nodo;