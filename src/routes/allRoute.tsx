import { Navigate } from "react-router-dom";
import { Dashboard, NotFound, WebQrLogin } from "../screens";
import { Assignment } from "../screens/pages/assignment";
import { Driver } from "../screens/pages/driver";
import { Mission } from "../screens/pages/missions";
import { RequestPage } from "../screens/pages/request";
import { Schedule } from "../screens/pages/schedule";
import { LeaveApprovePage } from "../screens/pages/request/leaveApprove";
import { NewRequest } from "../screens/pages/request/newRequest";
import { Setting } from "../screens/pages/setting";
import { AddUser } from "../screens/pages/setting/addUser";
import { LogoutUsers } from "../screens/pages/setting/logOutUser";

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
    path: "request/new-request",
    element: <NewRequest />,
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
