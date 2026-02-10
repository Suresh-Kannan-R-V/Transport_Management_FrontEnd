import { create } from "zustand";
import { FILE_BASE_URL } from "../api/base";
import { privateGet } from "../utils/helper";

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone: string;
  isLogin: boolean;
  status: string;
  created_at: string;
  Role: {
    id: number;
    name: string;
  };
}

interface UserState {
  user: User | null;
  roleName: string | null;
  loading: boolean;

  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  roleName: null,
  loading: false,

  fetchProfile: async () => {
    const token = localStorage.getItem("token");
    const id = privateGet("id");

    if (!token || !id) return;

    set({ loading: true });

    try {
      const response = await fetch(
        `${FILE_BASE_URL}/auth/user/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `TMS ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      

      if (result.success) {
        set({
          user: result.data,
          roleName: result.data.Role.name,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Fetch profile failed:", error);
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, roleName: null });
  },
}));
