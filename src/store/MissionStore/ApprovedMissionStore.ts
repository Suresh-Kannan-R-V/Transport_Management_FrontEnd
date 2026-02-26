import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";
import { ROUTE_STATUS } from "../../utils/helper";

let searchTimeout: ReturnType<typeof setTimeout>;

interface MissionItem {
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

interface ApproveMissionState {
  items: MissionItem[];
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
    sortBy: "created_at",
    sortOrder: "DESC",

    setFilters: (status, type) => {
      set({
        statusFilter: status ? Number(status) : "",
        travelTypeFilter: type ?? "",
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
        limit: "10",
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (travelTypeFilter) params.append("travel_type", travelTypeFilter);

      if (statusFilter !== "" && !isNaN(Number(statusFilter))) {
        params.append("status", String(statusFilter));
      } else {
        const missionStatuses = [
          ROUTE_STATUS.VEHICLE_ASSIGNED,
          ROUTE_STATUS.VEHICLE_REASSIGNED,
          ROUTE_STATUS.FACULTY_APPROVED,
          ROUTE_STATUS.DRIVER_ASSIGNED,
          ROUTE_STATUS.DRIVER_REASSIGNED,
          ROUTE_STATUS.STARTED,
          ROUTE_STATUS.COMPLETED,
        ];

        missionStatuses.forEach((s) => params.append("status", String(s)));
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
