import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getPermissions } from "../api/auth";
import { usePermissionStore } from "../store/permissionStore";

const getTokenExpiry = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  const permissions = usePermissionStore((state) => state.permissions);
  const setPermissions = usePermissionStore((state) => state.setPermissions);

  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        if (permissions.length === 0) {
          const paths = await getPermissions();
          setPermissions(paths);
        }
      } catch (err) {
        console.error("Permission fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (!token) return;

    const expiryTime = getTokenExpiry(token);

    if (!expiryTime || Date.now() >= expiryTime) {
      localStorage.removeItem("token");
      setIsTokenExpired(true);
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/auth/web-qr-login" replace />;
  }

  if (isTokenExpired) {
    return <Navigate to="/auth/web-qr-login" replace />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 size-64 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 size-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700" />

        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping delay-300" />

            <div className="size-28 p-5 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-100">
              <img
                src="/TripZo.png"
                alt="TripZo Logo"
                className="size-full object-cover"
              />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
              Trip<span className="text-indigo-600">Zo</span>
            </h1>
            <div className="flex items-center justify-center gap-1 mt-3">
              <span className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 bg-indigo-600 rounded-full animate-bounce" />
            </div>
            <p className="text-slate-500 text-xs font-bold capitalize tracking-[0.2em] mt-4">
              Fetching your Data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname;

  const isAllowed = permissions.some((p: string) => {
    const regex = new RegExp("^" + p.replace(/:\w+/g, "[^/]+") + "$");
    return regex.test(currentPath);
  });

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };

