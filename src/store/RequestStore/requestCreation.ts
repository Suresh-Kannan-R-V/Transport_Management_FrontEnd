import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";
import * as XLSX from "xlsx";

export interface RouteStop {
  id: string;
  address: string;
  lat?: number;
  lon?: number;
}

interface Guest {
  name: string;
  phone: string;
  country_code: string;
}

interface RequestState {
  routeName: string;
  travelType: "One Way" | "Two Way" | "Multi Day";
  startDate: string;
  endDate: string;
  stops: RouteStop[];
  passengerCount: number;
  guests: Guest[];
  distance: string | null;
  duration: string | null;
  isBulkUpload: boolean;
  specialRequirements: string;
  luggageDetails: string;
  guestFile: File | null;
  reset: () => void;
  setRouteMetrics: (distance: number, duration: number) => void;
  setField: (field: string, value: unknown) => void;
  updateGuest: (index: number, field: keyof Guest, value: string) => void;
  addGuest: () => void;
  removeGuest: (index: number) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  reorderStops: (stops: RouteStop[]) => void;
  updateStop: (
    index: number,
    address: string,
    lat?: number,
    lon?: number,
  ) => void;

  submitRequest: () => Promise<{ success: boolean; message: string }>;
  sampleGuestBulkFile: () => void;
}

const initialState = {
  routeName: "",
  travelType: "One Way" as const,
  startDate: "",
  endDate: "",
  stops: [
    {
      id: "start",
      address: "Bannari Amman Institute of Technology",
      lat: 11.4965,
      lon: 77.2764,
    },
    {
      id: "end",
      address: "Bannari Amman Institute of Technology",
      lat: 11.4965,
      lon: 77.2764,
    },
  ],
  distance: "",
  duration: "",
  passengerCount: 1,
  guests: [{ name: "", phone: "", country_code: "+91" }],
  isBulkUpload: false,
  specialRequirements: "",
  luggageDetails: "",
};

export const useRequestCreationStore = create<RequestState>((set, get) => ({
  ...initialState,
  guestFile: null,

  setField: (field, value) =>
    set((state) => {
      if (field === "passengerCount") {
        const count = Math.max(1, parseInt(String(value)) || 0);
        let newGuests = [...state.guests];

        // Backend requires at least 1 guest if count=1, and at least 2 guests if count >= 2
        const autoNeeded = count === 1 ? 1 : 2;

        if (newGuests.length < autoNeeded) {
          for (let i = newGuests.length; i < autoNeeded; i++) {
            newGuests.push({ name: "", phone: "", country_code: "+91" });
          }
        } else if (newGuests.length > count) {
          // Keep the guest list size in sync with passenger count to avoid
          // "Guest count exceeds passenger count" error from backend
          newGuests = newGuests.slice(0, count);
        }

        return { ...state, passengerCount: count, guests: newGuests };
      }

      if (field === "isBulkUpload") {
        return {
          ...state,
          isBulkUpload: value as boolean,
          guestFile: null, // Clear file if switching to manual
          guests: [{ name: "", phone: "", country_code: "+91" }], // Reset guests if switching
        };
      }

      return { ...state, [field]: value };
    }),

  updateGuest: (index, field, value) =>
    set((state) => {
      const updated = [...state.guests];
      updated[index] = { ...updated[index], [field]: value };
      return { guests: updated };
    }),

  addGuest: () =>
    set((state) => ({
      guests: [...state.guests, { name: "", phone: "", country_code: "+91" }],
    })),

  removeGuest: (index) =>
    set((state) => ({
      guests: state.guests.filter((_, i) => i !== index),
    })),

  addStop: () =>
    set((state) => {
      const newStops = [...state.stops];
      newStops.splice(newStops.length - 1, 0, {
        id: `stop-${Math.random()}`,
        address: "",
      });
      return { stops: newStops };
    }),

  removeStop: (index) =>
    set((state) => ({
      stops: state.stops.filter((_, i) => i !== index),
    })),

  updateStop: (index, address, lat, lon) =>
    set((state) => {
      const newStops = [...state.stops];
      newStops[index] = {
        ...newStops[index],
        address,
        lat: lat ?? newStops[index].lat,
        lon: lon ?? newStops[index].lon,
      };
      return { stops: newStops };
    }),

  reorderStops: (stops) => set({ stops }),

  setRouteMetrics: (distance, duration) =>
    set({
      distance: (distance / 1000).toFixed(2), // Convert meters to km
      duration: (duration / 60).toFixed(2), // Convert seconds to mins
    }),

  submitRequest: async () => {
    const state = get();

    // 1. Validation Logic
    if (!state.routeName.trim())
      return { success: false, message: "Route Name is required." };
    if (!state.startDate)
      return { success: false, message: "Start Date is required." };

    const travel_info = {
      route_name: state.routeName,
      type: state.travelType,
      start_date: state.startDate,
      end_date: state.travelType === "Multi Day" ? state.endDate : null,
    };

    const route_details = {
      selected_locations: state.stops.map((s) => s.address),
      distance_km: parseFloat(state.distance || "0"),
      duration_mins: parseFloat(state.duration || "0"),
    };

    const vehicle_config = {
      passenger_count: state.passengerCount,
      vehicle_type: "Mini",
    };

    const additional_info = {
      special_requirements: state.specialRequirements,
      luggage_details: state.luggageDetails,
    };

    try {
      let body;
      const headers: Record<string, string> = {
        Authorization: `TMS ${localStorage.getItem("token") || ""}`,
      };

      if (state.isBulkUpload) {
        if (!state.guestFile)
          return {
            success: false,
            message: "Please upload a guest list file.",
          };

        const formData = new FormData();
        formData.append("file", state.guestFile);
        // As per your backend: req.file presence triggers JSON.parse() on these fields:
        formData.append("travel_info", JSON.stringify(travel_info));
        formData.append("route_details", JSON.stringify(route_details));
        formData.append("vehicle_config", JSON.stringify(vehicle_config));
        formData.append("additional_info", JSON.stringify(additional_info));

        body = formData;
        // Browser sets Content-Type to multipart/form-data automatically
      } else {
        // Manual validation
        const requiredCount = state.passengerCount === 1 ? 1 : 2;
        const validGuests = state.guests.filter(
          (g) => g.name.trim() !== "" && g.phone.trim() !== "",
        );

        if (validGuests.length < requiredCount) {
          return {
            success: false,
            message: `Details for at least ${requiredCount} guest(s) required.`,
          };
        }

        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          travel_info,
          route_details,
          vehicle_config,
          guests: validGuests,
          additional_info,
        });
      }

      const response = await fetch(
        `${FILE_BASE_URL}/request/create-transport-request`,
        {
          method: "POST",
          headers,
          body,
        },
      );

      const result = await response.json();

      if (response.ok) {
        get().reset(); // Clears everything including the file
        return {
          success: true,
          message: "Transport request created successfully",
        };
      }

      return {
        success: false,
        message: result.message || "Failed to create request.",
      };
    } catch (err) {
      console.error("Submission Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      return { success: false, message: `Network Error: ${errorMessage}` };
    }
  },

  reset: () => set({ ...initialState, guestFile: null }),

  sampleGuestBulkFile: () => {
    const data = [
      { name: "Full Name", country_code: "+91", phone: "9876543210" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GuestList");
    XLSX.writeFile(workbook, "guest_list_template.xlsx");
  },
}));
