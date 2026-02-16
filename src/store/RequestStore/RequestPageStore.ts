import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";

interface RequestItem {
  id: number;
  routeName: string;
  createdBy: { name: string; faculty_id: string | null };
  status: "pending" | "confirmed" | "assign";
  travelType: "One Way" | "Two Way" | "Multi Day";
  start_datetime: string;
  end_datetime: string | null;
  passengerCount: number;
  startLocation: string;
  destinationLocation: string;
  intermediateStops: string[];
  vehicleAssigned: string | null;
}

interface RequestPageState {
  items: RequestItem[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  search: string;
  statusFilter: string;
  travelTypeFilter: string;

  // Actions
  setSearch: (val: string) => void;
  setFilters: (status?: string, type?: string) => void;
  setPage: (page: number) => void;
  fetchRequests: () => Promise<void>;
}

export const useRequestPageStore = create<RequestPageState>((set, get) => ({
  items: [],
  loading: false,
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  search: "",
  statusFilter: "",
  travelTypeFilter: "",

  setSearch: (search) => {
    set({ search, currentPage: 1 });
    get().fetchRequests();
  },

  setFilters: (status, type) => {
    set({
      statusFilter: status ?? get().statusFilter,
      travelTypeFilter: type ?? get().travelTypeFilter,
      currentPage: 1,
    });
    get().fetchRequests();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchRequests();
  },

  fetchRequests: async () => {
    set({ loading: true });
    const { currentPage, search, statusFilter, travelTypeFilter } = get();

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "6", // Show 6 cards per page for grid balance
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(travelTypeFilter && { travel_type: travelTypeFilter }),
    });

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/request/get-all?${params}`,
        {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        set({
          items: data.items,
          totalItems: data.totalItems,
          totalPages: data.totalPages,
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
