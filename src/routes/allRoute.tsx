import { Navigate } from "react-router-dom";
import { Dashboard, Login, NotFound } from "../screens";

const privateRoutes = [
  {
    index: true,
    element: <Navigate to="/auth/login" />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const publicRoutes = [
  {
    path: "login",
    element: <Login />,
  },
  // { path: "/forgot-password", element: <ForgotPassword /> },
  // { path: "/reset-password/:token", element: <ResetPassword /> },
];

export { privateRoutes, publicRoutes };