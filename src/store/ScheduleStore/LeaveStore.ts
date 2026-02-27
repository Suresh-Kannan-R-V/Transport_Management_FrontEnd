import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base";

interface LeaveFilters {
  search?: string;
  status?: number | string;
  sortBy?: string;
  leave_type?: number | string;
  from_date?: string;
  to_date?: string;
}

export interface LeaveDriver {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface LeaveAssignment {
  schedule_id: string | number;
  route_name: string;
  vehicle?: {
    vehicle_number: string;
    vehicle_type: string;
  };
  start_datetime: string;
  end_datetime: string;
  route_status: number;
}

export interface Leave {
  id: number;
  driver?: LeaveDriver;
  driver_id?: number;
  driver_name?: string;
  status?: number;
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  leave_type?: number;
  reason?: string;
  created_at?: string;
  updated_at?: string;
  approver?: LeaveDriver;
  current_assignment?: LeaveAssignment;
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

export const useLeaveStore = create<LeaveStore>((set) => ({
  leaves: [],
  totalItems: 0,
  totalPages: 1,
  loading: false,

  fetchLeaves: async (page, limit, filters = {}) => {
    set({ loading: true });
    try {
      const token = localStorage.getItem("token");
      const { search, status, sortBy, leave_type, from_date, to_date } =
        filters;
      const response = await axios.get(`${FILE_BASE_URL}/api/leaves/get-all`, {
        params: {
          page,
          limit,
          search,
          status,
          sortBy,
          leave_type,
          from_date,
          to_date,
        },
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
