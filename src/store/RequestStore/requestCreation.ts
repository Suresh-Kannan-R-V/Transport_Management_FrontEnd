import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";

const PHONE_PATTERNS: Record<string, RegExp> = {
  "+91": /^[6-9]\d{9}$/, // India: 10 digits starting with 6-9
  "+1": /^\d{10}$/, // USA/Canada
  "+44": /^7\d{9}$/, // UK Mobile
  // Default fallback for others: 7 to 15 digits
  default: /^\d{7,15}$/,
};
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
  reset: () => void;
  setRouteMetrics: (distance: number, duration: number) => void;
  setField: (field: string, value: any) => void;
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
}

const initialState = {
  routeName: "",
  travelType: "One Way" as const,
  startDate: "",
  endDate: "",
  stops: [
    {
      id: "start",
      address: "Bannari Amman Institute",
      lat: 11.4965,
      lon: 77.2764,
    },
    {
      id: "end",
      address: "Bannari Amman Institute",
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

  setField: (field, value) =>
    set((state) => {
      if (field === "passengerCount") {
        const count = Math.max(1, parseInt(value) || 0);
        let newGuests = [...state.guests];
        const autoNeeded = count === 1 ? 1 : 2;
        if (newGuests.length < autoNeeded) {
          for (let i = newGuests.length; i < autoNeeded; i++) {
            newGuests.push({ name: "", phone: "", country_code: "+91" });
          }
        } else if (newGuests.length > count) {
          newGuests = newGuests.slice(0, count);
        }
        return { ...state, passengerCount: count, guests: newGuests };
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

    if (!state.routeName.trim())
      return { success: false, message: "Route Name is required." };

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const start = new Date(state.startDate);
    if (!state.startDate || start < tomorrow) {
      return {
        success: false,
        message: "Start date must be from tomorrow onwards.",
      };
    }

    if (state.travelType === "Multi Day") {
      if (!state.endDate)
        return {
          success: false,
          message: "End date is required for Multi Day.",
        };
      if (new Date(state.endDate) <= start) {
        return {
          success: false,
          message: "End date must be after the start date.",
        };
      }
    }

    if (state.passengerCount < 1)
      return { success: false, message: "Passenger count cannot be 0." };

    const requiredGuestDetailsCount = state.passengerCount === 1 ? 1 : 2;
    const validGuests = state.guests.filter(
      (g) => g.name.trim() !== "" && g.phone.trim() !== "",
    );

    if (validGuests.length < requiredGuestDetailsCount) {
      return {
        success: false,
        message: `Please provide details for at least ${requiredGuestDetailsCount} guest(s).`,
      };
    }

    for (const guest of validGuests) {
      const pattern =
        PHONE_PATTERNS[guest.country_code] || PHONE_PATTERNS["default"];
      if (!pattern.test(guest.phone)) {
        return {
          success: false,
          message: `Invalid phone number for ${guest.name} (${guest.country_code}).`,
        };
      }
    }

    // --- 5. Final Payload & API Call ---
    const payload = {
      travel_info: {
        route_name: state.routeName,
        type: state.travelType,
        start_date: state.startDate,
        end_date: state.travelType === "Multi Day" ? state.endDate : null,
      },
      route_details: {
        selected_locations: state.stops.map((s) => s.address),
        distance_km: parseFloat(state.distance || "0"),
        duration_mins: parseFloat(state.duration || "0"),
      },
      vehicle_config: {
        passenger_count: state.passengerCount,
        vehicle_type: "Mini",
      },
      guests: validGuests, // Only send guests with data
      additional_info: {
        special_requirements: state.specialRequirements,
        luggage_details: state.luggageDetails,
      },
    };

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/request/create-transport-request`,
        {
          method: "POST",
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        get().reset();
        return { success: true, message: "Request Created Successfully!" };
      }
      const error = await response.json();
      return {
        success: false,
        message: error.message || "403: Forbidden (Check Permissions)",
      };
    } catch (err) {
      return { success: false, message: `Network Error Backend ${err}` };
    }
  },
  reset: () => set(initialState),
}));
