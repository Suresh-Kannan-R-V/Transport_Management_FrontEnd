import { Navigate } from "react-router-dom";
import {
  AddUser,
  CreateLeave,
  Dashboard,
  DriverDashBoard,
  DriverManagement,
  MissionPage,
  NewRequest,
  NotFound,
  RequestPage,
  RoleManagement,
  ScheduleManagement,
  Setting,
  VehicleManagement,
  ViewRequest,
  WebQrLogin
} from "../screens";
import AssignmentPage from "../screens/pages/assignment";
import VehicleDashboard from "../screens/pages/vehicleManagement/VehicleDashBoard";
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
    element: <AssignmentPage />,
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
  ...["request/view-request/:id", "mission/view-request/:id"].map((path) => ({
    path,
    element: <ViewRequest />,
  })),
  {
    path: "schedule",
    element: <ScheduleManagement />,
  },
  {
    path: "schedule/create-leave",
    element: <CreateLeave />,
  },

  {
    path: "vehicle",
    element: <VehicleManagement />,
  },
  {
    path: "vehicle/vehicle-dashboard/:vehicle_id",
    element: <VehicleDashboard />,
  },
  {
    path: "vehicle/fuel",
    element: <VehicleManagement />,
  },
  {
    path: "vehicle/service",
    element: <VehicleManagement />,
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
    path: "settings/driver-management",
    element: <DriverManagement />,
  },
  {
    path: "settings/driver-management/:userId",
    element: <DriverDashBoard />,
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

