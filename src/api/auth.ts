import axios from "axios";
import { FILE_BASE_URL } from "./base";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const createWebSession = () =>
  API.post(`${FILE_BASE_URL}/auth/web-login-session`);

export const checkWebSession = (sessionId: string) =>
  API.get(`${FILE_BASE_URL}/auth/web-login-session/${sessionId}`);

export const getPermissions = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${FILE_BASE_URL}/path/role-permissions`, {
    method: "GET",
    headers: {
      Authorization: `TMS ${token}`,
    },
  });

  const data = await res.json();

  return data.permissions.map((p: any) => p.path);
};

export const generateStartOTP = async (routeId: string | number) => {
  const response = await fetch(`${FILE_BASE_URL}/request/generate-start-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `TMS ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ route_id: routeId }),
  });
  return response.json();
};

export const generateEndOTP = async (routeId: string | number) => {
  const response = await fetch(`${FILE_BASE_URL}/request/generate-end-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `TMS ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ route_id: routeId }),
  });
  return response.json();
};
