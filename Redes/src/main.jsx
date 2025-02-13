import React from "react";
import ReactDOM from "react-dom/client";
import Pizarra from "./Pizarra.jsx";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import "./index.css"; // Si usas Tailwind o estilos globales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Header/>
    <Pizarra/>
    <Footer/>
  </React.StrictMode>
  
);
