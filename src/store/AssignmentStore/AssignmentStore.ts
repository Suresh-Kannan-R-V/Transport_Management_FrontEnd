import toast from "react-hot-toast";
import { create } from "zustand";
import { FILE_BASE_URL } from "../../api/base";
import { privateGet, ROUTE_STATUS } from "../../utils/helper";
import { decryptOTP } from "../../utils/encryption";
import { useUserStore } from "../useUserStore";

let searchTimeout: ReturnType<typeof setTimeout>;

interface AssignmentItem {
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

interface AssignmentState {
  items: AssignmentItem[];
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
  otp: string | null;
  encryptedOtp: string | null;
  otpLoading: boolean;

  setSort: (column: string, order?: "ASC" | "DESC") => void;
  setSearch: (val: string) => void;
  setFilters: (status?: string, type?: string, dateFilter?: boolean) => void;
  setPage: (page: number) => void;
  fetchAssignment: () => Promise<void>;
  executeOTPAction: (
    action: (id: number) => Promise<{ otp?: string; encryptedOtp?: string }>,
    routeId: number,
  ) => Promise<void>;
  completeRouteAdmin: (
    routeId: number,
    driverIds: number[],
  ) => Promise<boolean>;
  clearOTP: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
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
  otp: null,
  encryptedOtp: null,
  otpLoading: false,

  setFilters: (status, type, dateFilter) => {
    set({
      statusFilter: status ? Number(status) : "",
      travelTypeFilter: type ?? "",
      fromDate: dateFilter ? new Date().toISOString().split("T")[0] : null,

      currentPage: 1,
    });

    get().fetchAssignment();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchAssignment();
  },

  setSearch: (search) => {
    set({ search, currentPage: 1 });

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      get().fetchAssignment();
    }, 500);
  },

  setSort: (column, order) => {
    const newOrder =
      order ??
      (get().sortBy === column && get().sortOrder === "DESC" ? "ASC" : "DESC");

    set({ sortBy: column, sortOrder: newOrder, currentPage: 1 });
    get().fetchAssignment();
  },

  fetchAssignment: async () => {
    const id = privateGet("id");
    const role = useUserStore.getState().roleName;

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

    if (role !== "Transport Admin") {
      params.append("user_id", String(id));
    }

    if (search) params.append("search", search);

    if (travelTypeFilter) {
      params.append("travel_type", travelTypeFilter);
    }

    const allowedStatuses = [
      ROUTE_STATUS.DRIVER_ASSIGNED,
      ROUTE_STATUS.DRIVER_REASSIGNED,
      ROUTE_STATUS.STARTED,
      ROUTE_STATUS.COMPLETED,
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

  executeOTPAction: async (action, routeId) => {
    set({ otpLoading: true, otp: null, encryptedOtp: null });
    try {
      const data = await action(routeId);
      if (data && data.otp && data.encryptedOtp) {
        set({
          otp: decryptOTP(data.encryptedOtp),
          encryptedOtp: data.encryptedOtp,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || "An error occurred");
      console.error("OTP Action Error:", error);
    } finally {
      set({ otpLoading: false });
    }
  },

  completeRouteAdmin: async (routeId: number, driverIds: number[]) => {
    set({ otpLoading: true });
    try {
      const response = await fetch(
        `${FILE_BASE_URL}/request/complete-route-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            route_id: routeId,
            driver_ids: driverIds,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Route completed successfully");
        get().fetchAssignment();
        return true;
      }
    } catch (error) {
      toast.error("Failed to complete route");
      console.error("Complete Route Error:", error);
    } finally {
      set({ otpLoading: false });
    }
    return false;
  },

  clearOTP: () => set({ otp: null }),
}));
