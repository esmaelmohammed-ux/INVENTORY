import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// This is the entry point of the React application. It imports necessary modules and styles, and renders the main `App` component inside a `StrictMode` wrapper for highlighting potential issues in the application. The `createRoot` function from React DOM is used to create a root for rendering the app, targeting the HTML element with the ID of 'root'.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
// Note: The `StrictMode` component is a development tool that helps identify potential problems in the application. It does not affect the production build and is only active during development.
