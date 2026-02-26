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
  fetchUsers: (query: string) => Promise<void>;
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

  fetchUsers: async (query) => {
    set({ loading: true });
    try {
      const res = await axios.get(`${FILE_BASE_URL}/auth/users${query}`, {
        headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        // FIX: Access fields directly from res.data as per your JSON structure
        set({
          users: res.data.data || [],
          totalPages: Number(res.data.totalPages) || 1,
          totalItems: Number(res.data.totalItems) || 0,
        });
      }
    } catch (err) {
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
