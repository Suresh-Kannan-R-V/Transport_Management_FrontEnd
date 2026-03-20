import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base";

// Interfaces matching your API response
export interface MaintenanceRecord {
  id: number;
  service_title: string;
  maintenance_date: string;
  end_date: string | null;
  type: string;
  shop_name: string;
  current_km_before: number;
  cost: number;
  description: string;
  status: string;
}

export interface FuelRecord {
  id: number;
  date: string;
  liters: number;
  cost_per_liter: number;
  total_cost: number;
  km_reading: number;
  createdBy: number;
}

export interface AssignedRoute {
  schedule_id: number;
  route_name: string | null;
  start_time: string;
  end_time: string;
  driver_name: string | null;
}

export interface VehicleDashboardData {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  status: number | string;
  current_kilometer: number;
  mileage: number;
  insurance_date: string;
  pollution_date: string;
  rc_date: string;
  fc_date: string;
  next_service_date: string;
  service_summary: {
    total_service_count: number;
    total_spent_on_service: number;
  };
  maintenance_history: MaintenanceRecord[];
  fuel_history: FuelRecord[];
  assigned_routes: AssignedRoute[];
}

export interface Shop {
  id: number;
  name: string;
  owner_name: string;
  phone_number: string;
  address: string;
  status: number;
  service_types?: any[];
}

interface VehicleDashboardStore {
  vehicleData: VehicleDashboardData | null;
  loading: boolean;
  shops: Shop[];
  fetchingShops: boolean;
  fetchVehicleDashboard: (id: string | number) => Promise<void>;
  addMaintenance: (payload: any) => Promise<boolean>;
  fetchMatchingShops: (serviceTypeIds: string) => Promise<void>;
  addFuelLog: (payload: FormData) => Promise<boolean>;
  verifyFuelBill: (payload: FormData) => Promise<any>;
}

export const useVehicleDashboardStore = create<VehicleDashboardStore>(
  (set) => ({
    vehicleData: null,
    loading: false,
    shops: [],
    fetchingShops: false,

    fetchVehicleDashboard: async (id) => {
      set({ loading: true });
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${FILE_BASE_URL}/api/vehicles/vehicle-dashboard/${id}`,
          {
            headers: { Authorization: `TMS ${token}` },
          },
        );

        if (response.data.success) {
          set({ vehicleData: response.data.data, loading: false });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        set({ loading: false });
      }
    },
    addMaintenance: async (payload) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${FILE_BASE_URL}/api/vehicles/vehicle-maintenance`,
          payload,
          { headers: { Authorization: `TMS ${token}` } },
        );
        return response.data.success;
      } catch (error) {
        console.error("Maintenance logging failed:", error);
        return false;
      }
    },
    fetchMatchingShops: async (serviceTypeIds: string) => {
      if (!serviceTypeIds) {
        set({ shops: [] });
        return;
      }

      set({ fetchingShops: true });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${FILE_BASE_URL}/api/vehicles/shops?service_type_ids=${serviceTypeIds}`,
          { headers: { Authorization: `TMS ${token}` } },
        );

        if (res.data.success) {
          set({ shops: res.data.data, fetchingShops: false });
        }
      } catch (error) {
        console.error("Failed to fetch shops", error);
        set({ fetchingShops: false, shops: [] });
      }
    },

    addFuelLog: async (payload: FormData) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${FILE_BASE_URL}/api/vehicles/fuel-log`,
          payload,
          {
            headers: {
              Authorization: `TMS ${token}`,
            },
          },
        );
        return response.data.success;
      } catch (error) {
        console.error("Fuel log failed:", error);
        return false;
      }
    },

    verifyFuelBill: async (payload: FormData) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${FILE_BASE_URL}/api/vehicles/verify-fuel-bill`,
          payload,
          {
            headers: {
              Authorization: `TMS ${token}`,
            },
          },
        );
        return response.data;
      } catch (error) {
        console.error("Verification failed:", error);
        return null;
      }
    },
  }),
);
