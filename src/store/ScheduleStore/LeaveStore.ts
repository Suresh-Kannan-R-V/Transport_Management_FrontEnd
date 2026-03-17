/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base";
import { useUserStore } from "../useUserStore";

interface LeaveFilters {
  search?: string;
  status?: number | string;
  sortBy?: string;
  leave_type?: number | string;
  from_date?: string;
  to_date?: string;
  user_id?: number;
}
export interface LeaveDriver {
  id: number;
  name: string;
  email: string;
}

export interface LeaveVehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
}

export interface LeaveRouteAssignment {
  schedule_id: number;
  route_id: number;
  driver_id: number;
  start_datetime: string;
  end_datetime: string;
  route_name: string;
  route_status: number;
  travel_type: string;
  approx_distance_km: number;
  vehicle: LeaveVehicle;
}

export interface Leave {
  id: number;
  user_id: number;
  from_date: string;
  to_date: string;
  total_days: number;
  leave_type: number;
  reason: string;
  status: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  driver: LeaveDriver;
  approver: LeaveDriver | null;
  driver_details: {
    id: number;
    license_number: string;
    total_kilometer_drived: number;
    total_routes: number;
    status: number;
  };
  routes_during_leave: LeaveRouteAssignment[];
}

interface LeaveStore {
  leaves: Leave[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
  fetchLeaves: (
    page: number,
    limit: number,
    filters?: LeaveFilters,
  ) => Promise<void>;
  updateLeaveStatus: (id: number, status: number) => Promise<boolean>;
}

export const useLeaveStore = create<LeaveStore>((set, get) => ({
  leaves: [],
  totalItems: 0,
  totalPages: 1,
  loading: false,

  fetchLeaves: async (page, limit, filters = {}) => {
    const roleName = useUserStore.getState().roleName;
    const user_id = useUserStore.getState().user?.id;

    if (get().loading) return;
    set({ loading: true });

    try {
      const token = localStorage.getItem("token");

      // 2. Build the params object
      const paramsObj: any = {
        page,
        limit,
        search: filters.search,
        status: filters.status,
        sortBy: filters.sortBy,
        leave_type: filters.leave_type,
        from_date: filters.from_date,
        to_date: filters.to_date,
      };

      if (roleName === "Driver" && user_id) {
        paramsObj.user_id = user_id;
      }

      const cleanParams = Object.fromEntries(
        Object.entries(paramsObj).filter(
          ([_, v]) => v !== undefined && v !== null && v !== "",
        ),
      );

      const response = await axios.get(`${FILE_BASE_URL}/api/leaves/get-all`, {
        params: cleanParams,
        headers: { Authorization: `TMS ${token}` },
      });

      if (response.data.success) {
        set({
          leaves: response.data.data,
          totalItems: response.data.total_records,
          totalPages: response.data.total_pages,
        });
      }
    } catch (error) {
      console.error("Fetch leaves failed", error);
    } finally {
      set({ loading: false });
    }
  },

  updateLeaveStatus: async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${FILE_BASE_URL}/api/leaves/status/${id}`,
        { status },
        { headers: { Authorization: `TMS ${token}` } },
      );

      return response.data.success;
    } catch {
      return false;
    }
  },
}));
