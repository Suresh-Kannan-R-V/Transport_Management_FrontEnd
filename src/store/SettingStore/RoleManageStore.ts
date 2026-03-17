import { create } from "zustand";
import axios from "axios";
import { FILE_BASE_URL } from "../../api/base";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_name?: string;
  user_name?: string;
  Role?: { name: string };
  isLogin?: boolean;
}

interface Role {
  id: number;
  name: string;
}

interface UserState {
  users: User[];
  roles: Role[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  fetchUsers: (page: number, limit: number, filters?: any) => Promise<void>;
  fetchRoles: () => Promise<void>;
  changeUserRole: (payload: any) => Promise<boolean>;
  logout: (id: string | number, Name: string) => Promise<boolean>;
}

export const useRoleManagementStore = create<UserState>((set) => ({
  users: [],
  roles: [],
  loading: false,
  totalItems: 0,
  totalPages: 1,

  fetchUsers: async (page: number, limit: number, filters: any = {}) => {
    const state = useRoleManagementStore.getState();

    if (state.loading) return;

    set({ loading: true });

    try {
      const token = localStorage.getItem("token");

      const params = Object.fromEntries(
        Object.entries({
          page,
          limit,
          search: filters.search,
          role_name: filters.role_name,
          isLogin: filters.isLogin,
        }).filter(([_, v]) => v !== undefined && v !== null && v !== ""),
      );

      const res = await axios.get(`${FILE_BASE_URL}/auth/users`, {
        params,
        headers: { Authorization: `TMS ${token}` },
      });

      if (res.data.success) {
        set({
          users: res.data.data || [],
          totalPages: Number(res.data.totalPages) || 1,
          totalItems: Number(res.data.totalItems) || 0,
        });
      }
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      set({ loading: false });
    }
  },

  fetchRoles: async () => {
    try {
      const res = await axios.get(`${FILE_BASE_URL}/auth/roles`, {
        headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
      });
      set({ roles: res.data.data || [] });
    } catch (err) {
      toast.error("Failed to load roles");
    }
  },

  changeUserRole: async (payload) => {
    try {
      const res = await axios.patch(
        `${FILE_BASE_URL}/users/change-role`,
        payload,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );
      if (res.data.success) {
        toast.success("Role updated successfully!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
      return false;
    }
  },

  logout: async (id: string | number, Name: string) => {
    try {
      const res = await fetch(`${FILE_BASE_URL}/auth/admin/logout-user/${id}`, {
        method: "POST",
        headers: {
          Authorization: `TMS ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${Name} logged out successfully`);
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Logout failed.");
      return false;
    }
  },
}));
