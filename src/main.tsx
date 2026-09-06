import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/colors.css";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

