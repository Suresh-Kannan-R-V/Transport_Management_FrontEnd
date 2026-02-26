import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";
import { ROUTE_STATUS } from "../../utils/helper";

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
  status: number;
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
  statusFilter: number | "";
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
      statusFilter: status ? Number(status) : "",
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

    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", "10");
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    if (search && search.trim() !== "") {
      params.append("search", search);
    }
    if (travelTypeFilter && travelTypeFilter !== "") {
      params.append("travel_type", travelTypeFilter);
    }

    if (statusFilter !== "" && !isNaN(Number(statusFilter))) {
      params.append("status", statusFilter.toString());
    } else if (statusFilter === "") {
      [ROUTE_STATUS.PENDING, ROUTE_STATUS.CANCELLED].forEach((s) =>
        params.append("status", s.toString()),
      );
    }

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/request/get-all?${params.toString()}`,
        {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        set({
          items: data.items || [],
          totalItems: data.totalItems || 0,
          totalPages: data.totalPages || 1,
        });
      }
    } catch (error) {
      console.error("Frontend Fetch Error:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
