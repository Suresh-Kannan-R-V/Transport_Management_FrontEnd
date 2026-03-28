import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";

let searchTimeout: ReturnType<typeof setTimeout>;

interface RequestItem {
  id: number;
  routeName: string;
  createdBy: {
    user_id: number;
    name: string;
    faculty_id: string | null;
    roles: {
      id: number;
      role: string;
    };
  };
  status: string | null;
  travelType: "One Way" | "Two Way" | "Multi Day";
  start_datetime: string;
  end_datetime: string | null;
  passengerCount: number;
  approx_duration: number;
  startLocation: string;
  destinationLocation: string;
  intermediateStops: string[];
  vehicleAssigned: number | null;
  driverAssigned: number | null;
  drivers?: {
    driver_id: number;
    name: string;
    phone: string;
    status: number | null;
  }[];
}

interface RequestPageState {
  items: RequestItem[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  search: string;
  statusFilter: number | "";
  travelTypeFilter: string;
  fromDate?: string | null;
  sortBy: string;
  sortOrder: "ASC" | "DESC";

  setSort: (column: string, order?: "ASC" | "DESC") => void;
  setSearch: (val: string) => void;
  setFilters: (status?: string, type?: string, dateFilter?: boolean) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
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
  fromDate: null,
  sortBy: "created_at",
  sortOrder: "DESC",

  setFilters: (status, type, dateFilter) => {
    set({
      statusFilter: status ? Number(status) : "",
      travelTypeFilter: type ?? "",
      fromDate: dateFilter ? new Date().toISOString().split("T")[0] : null,
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

  resetFilters: () => {
    set({
      search: "",
      statusFilter: "",
      travelTypeFilter: "",
      fromDate: null,
      sortBy: "created_at",
      sortOrder: "DESC",
      currentPage: 1,
    });

    get().fetchRequests();
  },

  fetchRequests: async () => {
    if (get().loading) return;
    set({ loading: true });
    const {
      currentPage,
      search,
      statusFilter,
      travelTypeFilter,
      sortBy,
      sortOrder,
      fromDate,
    } = get();

    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", "10");
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    if (fromDate) params.append("from_date", fromDate);

    if (search && search.trim() !== "") params.append("search", search);

    if (travelTypeFilter && travelTypeFilter !== "")
      params.append("travel_type", travelTypeFilter);

    if (statusFilter !== "" && !isNaN(Number(statusFilter))) {
      params.append("status", String(statusFilter));
    }

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/api/routes/get-all?${params.toString()}`,
        {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        set({
          items: data.data || [],
          totalItems: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 1,
        });
      }
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
