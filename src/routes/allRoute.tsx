import { Navigate } from "react-router-dom";
import {
  AddUser,
  Assignment,
  Dashboard,
  Driver,
  DriverManagement,
  LeaveApprovePage,
  MissionPage,
  NewRequest,
  NotFound,
  RequestPage,
  RoleManagement,
  Schedule,
  Setting,
  VehicleManagement,
  ViewRequest,
  WebQrLogin,
} from "../screens";
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
    element: <MissionPage />,
  },
  {
    path: "request",
    element: <RequestPage />,
  },
  {
    path: "request/new-request",
    element: <NewRequest />,
  },
  {
    path: "view-request/:id",
    element: <ViewRequest />,
  },
  {
    path: "request/leave-approve",
    element: <LeaveApprovePage />,
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
    path: "settings/vehicle-management",
    element: <VehicleManagement />,
  },
  {
    path: "settings/driver-management",
    element: <DriverManagement />,
  },
  {
    path: "settings/session-management",
    element: <RoleManagement />,
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
