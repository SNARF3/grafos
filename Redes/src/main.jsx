import React from "react";
import ReactDOM from "react-dom/client";
import Pizarra from "./Pizarra.jsx";
import "./index.css"; // Si usas Tailwind o estilos globales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Pizarra/>
  </React.StrictMode>
);
