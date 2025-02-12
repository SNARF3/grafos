import React from "react";
import PropTypes from "prop-types";

const Arista = ({ x1, y1, x2, y2, valor }) => {
    const calculateArrowPoints = (x1, y1, x2, y2) => {
        const headLength = 10; // length of head in pixels
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowX1 = x2 - headLength * Math.cos(angle - Math.PI / 6);
        const arrowY1 = y2 - headLength * Math.sin(angle - Math.PI / 6);
        const arrowX2 = x2 - headLength * Math.cos(angle + Math.PI / 6);
        const arrowY2 = y2 - headLength * Math.sin(angle + Math.PI / 6);
        return `${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`;
    };

    return (
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="white"
                strokeWidth="2"
            />
            <polygon
                points={calculateArrowPoints(x1, y1, x2, y2)}
                fill="white"
            />
            <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2}
                fill="white"
                fontSize="14px"
                fontWeight="bold"
            >
                {valor}
            </text>
        </svg>
    );
};

Arista.propTypes = {
    x1: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
    valor: PropTypes.number.isRequired,
};

export default Arista;