/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import { decodeToken } from "./utils/helper";
import { useUserStore } from "./store";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useUserStore((state) => state.logout);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   if (!token) return;

  //   if (location.pathname === "/web-qr-login") return;

  //   const decoded = decodeToken(token);

  //   if (!decoded?.exp || typeof decoded.exp !== "number") {
  //     logout();
  //     navigate("/web-qr-login", { replace: true });
  //     return;
  //   }

  //   const expiryTime = decoded.exp * 1000;
  //   const now = Date.now();
  //   const timeLeft = expiryTime - now;

  //   if (timeLeft <= 0) {
  //     logout();
  //     navigate("/web-qr-login", { replace: true });
  //     return;
  //   }

  //   const timeoutId = setTimeout(() => {
  //     logout();
  //     navigate("/web-qr-login", { replace: true });
  //   }, timeLeft);

  //   return () => clearTimeout(timeoutId);
  // }, [logout, navigate, location.pathname]);

  return <AppRoutes />;
}

export default App;
