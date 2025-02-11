import React from "react";
import ReactDOM from "react-dom/client";
import Nodo from "./Nodo";
import "./index.css"; // Si usas Tailwind o estilos globales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Nodo />
  </React.StrictMode>
);
