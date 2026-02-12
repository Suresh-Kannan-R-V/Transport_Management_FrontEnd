import { Navigate } from "react-router-dom";
import { Dashboard, NotFound, WebQrLogin } from "../screens";
import { Assignment } from "../screens/pages/Assignment";
import { Driver } from "../screens/pages/Driver";
import { Mission } from "../screens/pages/Missions";
import { RequestPage } from "../screens/pages/Request";
import { Schedule } from "../screens/pages/Schedule";
import { Setting } from "../screens/pages/Setting";
import { AddUser } from "../screens/pages/Setting/AddUser";
import { LogoutUsers } from "../screens/pages/Setting/LogOutUser";

const privateRoutes = [
  {
    index: true,
    element: <Navigate to="/auth/web-qr-login" />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "assignment",
    element: <Assignment />,
  },
  {
    path: "driver",
    element: <Driver />,
  },
  {
    path: "mission",
    element: <Mission />,
  },
  {
    path: "request",
    element: <RequestPage />,
  },
  {
    path: "schedule",
    element: <Schedule />,
  },
  {
    path: "settings",
    element: <Setting />,
  },
  {
    path: "settings/add-users",
    element: <AddUser />,
  },
  {
    path: "settings/logout-users",
    element: <LogoutUsers />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const publicRoutes = [
  {
    path: "web-qr-login",
    element: <WebQrLogin />,
  },
  // { path: "/forgot-password", element: <ForgotPassword /> },
  // { path: "/reset-password/:token", element: <ResetPassword /> },
];

export { privateRoutes, publicRoutes };

