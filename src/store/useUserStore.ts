import { create } from "zustand";
import { FILE_BASE_URL } from "../api/base";
import { privateGet } from "../utils/helper";
import toast from "react-hot-toast";

export interface User {
  id: number;
  role_id: number;
  name: string;
  user_name: string;
  email: string;
  password: string;
  phone: string;
  isLogin: boolean;
  created_at: string;
  Role: {
    id: number;
    name: string;
  };
}

export interface FuelBunk {
  id: number;
  name: string;
  owner_name: string;
  phone_number: string;
  address: string;
  status: number;
}

export interface ServiceType {
  id: number;
  name: string;
  status: number;
}

interface UserState {
  user: User | null;
  roleName: string | null;
  loading: boolean;

  fuelBunks: FuelBunk[];
  serviceTypes: ServiceType[];

  fetchProfile: () => Promise<void>;
  fetchMasterData: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  roleName: null,
  loading: false,
  fuelBunks: [],
  serviceTypes: [],

  fetchProfile: async () => {
    const token = localStorage.getItem("token");
    const id = privateGet("id");

    if (!token || !id) return;

    set({ loading: true });

    try {
      const response = await fetch(`${FILE_BASE_URL}/auth/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `TMS ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        set({
          user: result.data,
          roleName: result.data.Role.name,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Fetch profile failed:", error);
      toast.error("Fetch profile failed:");
      set({ loading: false });
    }
  },

  fetchMasterData: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [fuelRes, serviceRes] = await Promise.all([
        fetch(`${FILE_BASE_URL}/api/vehicles/fuel-bunk`, {
          headers: { Authorization: `TMS ${token}` },
        }),
        fetch(`${FILE_BASE_URL}/api/vehicles/service-types`, {
          headers: { Authorization: `TMS ${token}` },
        }),
      ]);

      const fuelData = await fuelRes.json();
      const serviceData = await serviceRes.json();

      set({
        fuelBunks: fuelData.success ? fuelData.data : [],
        serviceTypes: serviceData.success ? serviceData.data : [],
      });
    } catch (error) {
      console.error("Master data fetch failed:", error);
      toast.error("Master data fetch failed:");
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, roleName: null, fuelBunks: [], serviceTypes: [] });
  },
}));
