import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import styles in the correct order
import "./index.css";              // Base Tailwind + reset
import "./styles/animations.css";  // CSS animations
import "./styles/globals.css";     // Component styles + theme

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);