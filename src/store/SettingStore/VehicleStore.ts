import { create } from "zustand";
import { FILE_BASE_URL, getAuthHeader } from "../../api/base";
import toast from "react-hot-toast";

export interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  status: "active" | "maintenance" | "assign";
  current_kilometer?: number;
  insurance_date?: string | null;
  pollution_date?: string | null;
  rc_date?: string | null;
  fc_date?: string | null;
  next_service_date?: string | null;
}

interface VehicleState {
  vehicles: Vehicle[];
  totalVehicles: number;
  currentPage: number;
  loading: boolean;
  // Actions
  fetchVehicles: (params?: string) => Promise<void>;
  addVehicle: (data: Omit<Vehicle, "id">) => Promise<void>;
  bulkUpload: (file: File) => Promise<void>;
  updateVehicle: (
    id: number,
    data: Partial<Omit<Vehicle, "id">>,
  ) => Promise<void>;
  deleteVehicle: (ids: number[]) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  totalVehicles: 0,
  currentPage: 1,
  loading: false,

  fetchVehicles: async (params = "") => {
    set({ loading: true });
    try {
      const res = await fetch(
        `${FILE_BASE_URL}/api/vehicles/get-all${params}`,
        {
          headers: { ...getAuthHeader() },
        },
      );

      const result = await res.json();

      if (result.success) {
        set({
          vehicles: result.data || [], // Correctly maps 'data' array
          totalVehicles: result.totalRecords || 0, // Correctly maps 'totalRecords'
          currentPage: result.currentPage || 1,
          loading: false,
        });
      } else {
        set({ vehicles: [], loading: false });
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      set({ vehicles: [], loading: false });
    }
  },

  /**
   * CREATE SINGLE VEHICLE
   */
  addVehicle: async (data) => {
    set({ loading: true });
    try {
      const res = await fetch(`${FILE_BASE_URL}/api/vehicles/create`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        get().fetchVehicles(`?page=1&limit=5`);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Add vehicle failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  bulkUpload: async (file: File) => {
    set({ loading: true });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${FILE_BASE_URL}/api/vehicles/create`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`${result.count} vehicles uploaded successfully!`);
        get().fetchVehicles(`?page=1&limit=5`);
      } else {
        toast.error(`Upload failed: ${result.message}`);
      }
    } catch (err) {
      console.error("Bulk upload failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateVehicle: async (id, data) => {
    try {
      const res = await fetch(`${FILE_BASE_URL}/api/vehicles/update`, {
        method: "PUT",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicles: [{ id, ...data }] }),
      });

      if (res.ok) get().fetchVehicles();
    } catch (err) {
      console.error("Update failed:", err);
    }
  },

  deleteVehicle: async (ids) => {
    try {
      const res = await fetch(
        `${FILE_BASE_URL}/api/vehicles/delete/${ids}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
        },
      );

      if (res.ok) {
        // Refresh the list after deletion
        get().fetchVehicles();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  },
}));
