import { createRoot } from "react-dom/client";
import App from "./App.tsx";
//import ReactGA from "react-ga4";                              
import "./index.css";

// Initialize Google Analytics for Theaazhi.com
//const GA_MEASUREMENT_ID = "G-PT7Q73Y0X2";                     // ← REPLACE WITH YOUR ID
//ReactGA.initialize(GA_MEASUREMENT_ID);  
import ReactGA from "react-ga4";                              
import "./index.css";

// Initialize Google Analytics for Theaazhi.com
const GA_MEASUREMENT_ID = "G-JN42Y5THBE";                     // ← REPLACE WITH YOUR ID
ReactGA.initialize(GA_MEASUREMENT_ID);  

createRoot(document.getElementById("root")!).render(<App />);
