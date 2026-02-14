import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const getTokenExpiry = (token: string) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000; // convert to ms
    } catch {
        return null;
    }
};

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/auth/web-qr-login" replace />;
    }

    const expiryTime = getTokenExpiry(token);

    if (!expiryTime || Date.now() >= expiryTime) {
        localStorage.removeItem("token");
        return <Navigate to="/auth/web-qr-login" replace />;
    }

    useEffect(() => {
        const timeout = expiryTime - Date.now();

        const timer = setTimeout(() => {
            localStorage.removeItem("token");
            window.location.replace("/auth/web-qr-login");
        }, timeout);

        return () => clearTimeout(timer);
    }, [expiryTime]);

    // ✅ Valid token → allow
    return <Outlet />;
};

const PublicRoute = () => {
    const token = localStorage.getItem("token");

    // 🚫 Already logged in → dashboard
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export { ProtectedRoute, PublicRoute };

