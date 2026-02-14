import { GoogleOAuthProvider } from "@react-oauth/google";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GOOGLE_CLIENT_ID } from "./api/base.ts";
import App from "./App.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <BrowserRouter>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </BrowserRouter>
    // </React.StrictMode>
);
