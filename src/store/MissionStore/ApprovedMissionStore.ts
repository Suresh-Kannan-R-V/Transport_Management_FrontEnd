import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";
import { privateGet, ROUTE_STATUS } from "../../utils/helper";

let searchTimeout: ReturnType<typeof setTimeout>;

interface MissionItem {
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
  driverAssigned: number | null;
  drivers: {
    driver_id: number;
    name: string;
    phone: string;
    status: number | null;
  }[];
}

interface ApproveMissionState {
  items: MissionItem[];
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
  fetchMission: () => Promise<void>;
}

export const useApproveMissionStore = create<ApproveMissionState>(
  (set, get) => ({
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

      get().fetchMission();
    },

    setPage: (page) => {
      set({ currentPage: page });
      get().fetchMission();
    },

    setSearch: (search) => {
      set({ search, currentPage: 1 });

      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        get().fetchMission();
      }, 500);
    },

    setSort: (column, order) => {
      const newOrder =
        order ??
        (get().sortBy === column && get().sortOrder === "DESC"
          ? "ASC"
          : "DESC");

      set({ sortBy: column, sortOrder: newOrder, currentPage: 1 });
      get().fetchMission();
    },

    fetchMission: async () => {
      const id = privateGet("id");
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

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy: sortBy || "id",
        sortOrder: sortOrder || "desc",
      });

      if (fromDate) {
        params.append("from_date", fromDate);
      }

      if (id) {
        params.append("user_id", String(id));
      }

      if (search) params.append("search", search);

      if (travelTypeFilter) {
        params.append("travel_type", travelTypeFilter);
      }

      const allowedStatuses = [
        ROUTE_STATUS.PENDING,
        ROUTE_STATUS.VEHICLE_ASSIGNED,
        ROUTE_STATUS.VEHICLE_REASSIGNED,
        ROUTE_STATUS.VEHICLE_APPROVED,
        ROUTE_STATUS.CANCELLED,
      ];

      if (
        statusFilter !== "" &&
        statusFilter !== null &&
        !isNaN(Number(statusFilter))
      ) {
        const selectedStatus = Number(statusFilter);

        if (allowedStatuses.includes(selectedStatus)) {
          params.append("status", String(selectedStatus));
        }
      } else {
        allowedStatuses.forEach((status) => {
          params.append("status", String(status));
        });
      }

      try {
        const response = await fetch(
          `${FILE_BASE_URL}/request/get-all?${params.toString()}`,
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
        console.error("Fetch Error:", error);
        set({ items: [] });
      } finally {
        set({ loading: false });
      }
    },
  }),
);
