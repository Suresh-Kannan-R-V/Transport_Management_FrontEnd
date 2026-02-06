import { useRoutes } from "react-router-dom";
import { Layout as AuthLayout } from "../layout/auth";
import Layout from "../layout/pages";
import { privateRoutes, publicRoutes } from "./allRoute";
// import { ProtectedRoute, PublicRoute } from "./middleware";

export const AppRoutes = () => {
  return useRoutes([
    {
      // element: <PublicRoute />, // ✅ middleware wrapper
      children: [
        {
          path: "/auth",
          element: <AuthLayout />,
          children: publicRoutes,
        },
      ],
    },
    {
      // element: <ProtectedRoute />, // ✅ middleware wrapper
      children: [
        {
          path: "/",
          element: <Layout />,
          children: privateRoutes,
        },
      ],
    },
  ]);
};
