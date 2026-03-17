import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base";

// Type definitions for the store
interface DriverInfo {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  license?: string;
  licenseExpiry?: string;
  bloodGroup?: string;
  totalKm?: number | string;
  totalRoutes?: number | string;
  totalLeaves?: number | string;
  expYears?: number | string;
  status?: number | string;
}

interface OngoingRoute {
  routeID?: number | string;
  routeName?: string;
  vehicleNumber?: string;
  travelType?: string;
  startLocation?: string;
  startDate?: string;
  endLocation?: string;
  endDate?: string;
  status?: string;
  duration?: string;
  creatorPhone?: string;
  guestCount?: string | number;
  intermediateStops?: number | string;
}

interface UpcomingRoute {
  id?: number | string;
  routeName?: string;
  travelType?: string;
  startLocation?: string;
  destinationLocation?: string;
  distance?: number | string;
  startDate?: string;
  endDate?: string;
}

interface WeeklyActivity {
  date: string;
  day: string;
  km: number;
  routes: string[];
}

interface DriverDashboardStore {
  driverInfo: DriverInfo | null;
  ongoingRoute: OngoingRoute | null;
  upcomingRoutes: UpcomingRoute[];
  weeklyActivity: WeeklyActivity[];
  loading: boolean;
  error: string | null;
  fetchDashboardData: (userId: number | string) => Promise<void>;
  fetchWeeklyActivity: (
    userId: number | string,
    weekStartDate: string,
  ) => Promise<void>; // New
}

export const useDriverDashboardStore = create<DriverDashboardStore>(
  (set, get) => ({
    driverInfo: null,
    ongoingRoute: null,
    upcomingRoutes: [],
    weeklyActivity: [],
    loading: false,
    error: null,

    fetchDashboardData: async (userId: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `TMS ${token}` };

        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff))
          .toISOString()
          .split("T")[0];

        const dashRes = await axios.get(
          `${FILE_BASE_URL}/api/drivers/driver-dashboard/${userId}`,
          { headers },
        );

        await get().fetchWeeklyActivity(userId, monday);

        set({
          driverInfo:
            dashRes?.data?.driverData || dashRes?.data?.driver || null,
          ongoingRoute:
            dashRes?.data?.ongoingTask || dashRes?.data?.ongoing_route || null,
          upcomingRoutes:
            dashRes?.data?.upcomingRoutes ||
            dashRes?.data?.upcoming_routes ||
            [],
          loading: false,
        });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    fetchWeeklyActivity: async (
      userId: number | string,
      weekStartDate: string,
    ) => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `TMS ${token}` };

        const res = await axios.get(
          `${FILE_BASE_URL}/api/drivers/driver-weekly-km/${userId}`,
          {
            headers,
            params: { week_start_date: weekStartDate },
          },
        );

        set({ weeklyActivity: res?.data?.weekData || [] });
      } catch (err) {
        console.error("Weekly KM Fetch Error:", err);
      }
    },
  }),
);
