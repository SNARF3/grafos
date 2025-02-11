import { useState } from "react";
import Nodo from "./Nodo";
import Swal from "sweetalert2"
const Pizarra = () => {
    const [nodos, setNodos] = useState([]);

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

    const DobleClickEjecutado = async (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const nombre = await solicitarNombre();
        if (!nombre) return; 
        console.log("nombre: ", nombre)
        setNodos([...nodos, { x, y, valor: nombre}]);
    };
    

    return (
        <div
            style={{ width: "100vw", height: "100vh", background: "#112230", position: "relative" }}
            onDoubleClick={DobleClickEjecutado}
        >
            {nodos.map((nodo) => (
                <Nodo key={nodo.valor} x={nodo.x} y={nodo.y} valor={nodo.valor}/>
            ))}
        </div>
    );
};


export default Pizarra;
