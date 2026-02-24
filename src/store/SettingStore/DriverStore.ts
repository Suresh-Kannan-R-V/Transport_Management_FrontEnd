import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base"; // Ensure this path is correct
import { toast } from "react-hot-toast";

interface Driver {
  id: number;
  name: string;
  user_name: string;
  email: string;
  phone: string;
  status: "available" | "assigned";
  isLogin: boolean;
  push_notification_status: boolean;
  license_number: string;
  experience_years: number;
  license_expiry: string;
}

interface DriverStore {
  drivers: Driver[];
  totalDrivers: number;
  loading: boolean;

  // Actions
  fetchDrivers: (queryParams?: string) => Promise<void>;
  deleteDriver: (ids: number) => Promise<void>;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  totalDrivers: 0,
  loading: false,

  fetchDrivers: async (queryParams = "") => {
    set({ loading: true });
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
          totalDrivers: response.data.total || response.data.data.length, // Handle pagination total
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
}));
