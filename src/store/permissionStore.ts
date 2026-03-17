import { create } from "zustand";

interface PermissionState {
  permissions: string[];
  setPermissions: (paths: string[]) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: [],
  setPermissions: (paths) => set({ permissions: paths }),
}));