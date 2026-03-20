import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base"; // Ensure this path is correct
import { toast } from "react-hot-toast";

interface Driver {
  id: number;
  user_id: number;
  name: string;
  user_name: string;
  email: string;
  phone: string;
  status: number;
  isLogin: boolean;
  push_notification_status: boolean;
  license_number: string;
  experience_years: number;
  license_expiry: string;
}

export interface DriverVehicleAssignment {
  schedule_id: number;
  status: number;
  start_datetime: string;
  end_datetime: string;
  vehicle: {
    id: number;
    vehicle_number: string;
    vehicle_type: string;
    capacity: number;
    current_km: number;
  };
  route: {
    id: number;
    route_name: string;
    start_datetime: string;
    end_datetime: string;
    status: number;
  };
}

export interface LeaveRecord {
  id: number;
  from_date: string;
  to_date: string;
  total_days: number;
  leave_type: number;
  reason: string;
  status: number;
  driver: { name: string; email: string };
  approver?: { name: string };
  created_at?: string;
  updated_at?: string;
}

interface DriverStore {
  drivers: Driver[];
  vehicleHistory: DriverVehicleAssignment[];
  leaveHistory: LeaveRecord[];
  totalDrivers: number;
  totalPages: number;
  loading: boolean;
  lastQuery: string;
  // Actions
  fetchDrivers: (queryParams?: string) => Promise<void>;
  fetchDriverVehicleHistory: (userId: number) => Promise<void>;
  fetchDriverLeaveHistory: (userId: number) => Promise<void>;
  deleteDriver: (ids: number) => Promise<void>;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  vehicleHistory: [],
  leaveHistory: [],
  totalDrivers: 0,
  totalPages: 0,
  loading: false,
  lastQuery: "",

  fetchDrivers: async (queryParams = "") => {
    if (get().loading) return;

    set({ loading: true, lastQuery: queryParams });
    try {
      const response = await axios.get(
        `${FILE_BASE_URL}/api/drivers/all-drivers${queryParams}`,
        {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.success) {
        set({
          drivers: response.data.data, // Array of drivers
          totalDrivers: response.data.total_records, // Handle pagination total
          loading: false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch drivers");
      set({ loading: false, drivers: [] });
    }
  },

  deleteDriver: async (ids: number) => {
    try {
      const response = await axios.delete(
        `${FILE_BASE_URL}/api/drivers/delete/${ids}`,
        {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Driver deleted successfully");
        get().fetchDrivers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete operation failed");
    }
  },
  fetchDriverVehicleHistory: async (userId: number) => {
    set({ loading: true });
    try {
      const res = await axios.get(
        `${FILE_BASE_URL}/api/drivers/drive-vehicles?user_id=${userId}`,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) set({ vehicleHistory: res.data.data });
    } catch (error) {
      toast.error("Failed to fetch vehicle history");
    } finally {
      set({ loading: false });
    }
  },

  fetchDriverLeaveHistory: async (userId: number) => {
    set({ loading: true });
    try {
      const res = await axios.get(
        `${FILE_BASE_URL}/api/leaves/get-all?user_id=${userId}`,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) set({ leaveHistory: res.data.data });
    } catch (error) {
      toast.error("Failed to fetch leave records");
    } finally {
      set({ loading: false });
    }
  },
}));
