import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ReactGA from "react-ga4";                              
import "./index.css";

// Automatically reload page if a new deployment changed chunk hashes (prevents white screen)
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

window.addEventListener('error', (event) => {
  if (
    event?.message &&
    (event.message.includes('Failed to fetch dynamically imported module') ||
     event.message.includes('error loading dynamically imported module'))
  ) {
    window.location.reload();
  }
});

// Initialize Google Analytics for Theaazhi.com
const GA_MEASUREMENT_ID = "G-48ZJ5R0ZQK";
ReactGA.initialize(GA_MEASUREMENT_ID);  

createRoot(document.getElementById("root")!).render(<App />);
