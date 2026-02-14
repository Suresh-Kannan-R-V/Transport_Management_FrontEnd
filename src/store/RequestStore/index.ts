import { create } from "zustand";

export interface RouteStop {
  id: string;
  address: string;
  lat?: number;
  lon?: number;
}

interface RequestState {
  [x: string]: any;
  travelType: string;
  stops: RouteStop[];
  passengerCount: number;
  guestNames: { name: string; phone: string }[];
  isBulkUpload: boolean;
  // Actions
  setField: (field: string, value: any) => void;
  updateGuest: (index: number, field: 'name' | 'phone', value: string) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  travelType: "One Way",
  stops: [
    { id: "start", address: "Bannari Amman Institute", lat: 11.4965, lon: 77.2764 },
    { id: "end", address: "Bannari Amman Institute", lat: 11.4965, lon: 77.2764 },
  ],
  passengerCount: 1,
  guestNames: [{ name: "", phone: "" }],
  isBulkUpload: false,

  setField: (field, value) => set((state) => {
    if (field === "passengerCount") {
      const count = parseInt(value) || 1;
      const isBulk = count >= 5;
      const names = isBulk ? [] : Array(count).fill(null).map((_, i) => state.guestNames[i] || { name: "", phone: "" });
      return { ...state, passengerCount: count, isBulkUpload: isBulk, guestNames: names };
    }
    return { ...state, [field]: value };
  }),

  updateGuest: (index, field, value) => set((state) => {
    const updated = [...state.guestNames];
    updated[index] = { ...updated[index], [field]: value };
    return { guestNames: updated };
  }),

  addStop: () => set((state) => {
    const newStops = [...state.stops];
    newStops.splice(newStops.length - 1, 0, { id: Math.random().toString(), address: "" });
    return { stops: newStops };
  }),

  removeStop: (index) => set((state) => ({
    stops: state.stops.filter((_, i) => i !== index)
  })),
}));