import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";

let searchTimeout: ReturnType<typeof setTimeout>;

interface RequestItem {
  id: number;
  routeName: string;
  createdBy: {
    name: string;
    faculty_id: string | null;
    roles: {
      id: number;
      role: string;
    };
  };
  status:
    | "Pending"
    | "Approved"
    | "Vehicle Assigned"
    | "Faculty Confirmed"
    | "Driver Assigned"
    | "Completed"
    | "Rejected"
    | "Cancelled";
  travelType: "One Way" | "Two Way" | "Multi Day";
  start_datetime: string;
  end_datetime: string | null;
  passengerCount: number;
  approx_duration: number;
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
  sortBy: string;
  sortOrder: "ASC" | "DESC";

  setSort: (column: string, order?: "ASC" | "DESC") => void;
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
  sortBy: "created_at",
  sortOrder: "DESC",

  setFilters: (status, type) => {
    set({
      statusFilter: status ?? "",
      travelTypeFilter: type ?? "",
      currentPage: 1,
    });

    get().fetchRequests();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchRequests();
  },

  setSearch: (search) => {
    set({ search, currentPage: 1 });

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      get().fetchRequests();
    }, 500);
  },

  setSort: (column, order) => {
    const newOrder =
      order ??
      (get().sortBy === column && get().sortOrder === "DESC" ? "ASC" : "DESC");

    set({ sortBy: column, sortOrder: newOrder, currentPage: 1 });
    get().fetchRequests();
  },

  fetchRequests: async () => {
    set({ loading: true });
    const {
      currentPage,
      search,
      statusFilter,
      travelTypeFilter,
      sortBy,
      sortOrder,
    } = get();

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "8",
      sortBy,
      sortOrder,
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(travelTypeFilter && { travel_type: travelTypeFilter }),
    });

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/request/get-all?${params}`,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
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
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
