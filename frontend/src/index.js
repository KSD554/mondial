import React from "react";
import ReactDOM from "react-dom/client"; // Utilisation de la nouvelle API React 18
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./redux/store";

const root = ReactDOM.createRoot(document.getElementById("root")); // Création de la racine
root.render(
  <React.StrictMode>
    <Provider store={Store}>
      <App />
    </Provider>
  </React.StrictMode> // Ajout de StrictMode pour vérifier les problèmes potentiels
);

reportWebVitals(); // Facultatif pour surveiller les performances
