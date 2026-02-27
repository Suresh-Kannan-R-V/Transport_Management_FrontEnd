export interface Token {
  auth_token: string;
}
interface TokenPayload {
  [key: string]: unknown;
}
import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const encryptId = (id: number) => {
  return btoa(`${id}_secure`);
};

export const decryptId = (hash: string) => {
  try {
    const decoded = atob(hash);
    const match = decoded.match(/(\d+)_secure/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const secondsToHMS = (seconds: string | number) => {
  const secondsNum = Number(seconds);
  const hours = Math.floor(secondsNum / 3600);
  const minutes = Math.floor((secondsNum % 3600) / 60);
  const secs = secondsNum % 60;

  return { hours, minutes, seconds: secs };
};

export const privateGet = (key: string) => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return decoded[key] ?? null;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getTokenRemainingTime = () => {
  const token = localStorage.getItem("token");
  if (!token) return "00:00:00";

  const decoded = decodeToken(token);
  if (!decoded?.exp) return "00:00:00";

  const expiryTime = Number(decoded.exp) * 1000; // JWT exp → ms
  const now = Date.now();
  const diff = expiryTime - now;

  if (diff <= 0) return "00:00:00";

  const totalSeconds = Math.floor(diff / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
};

export const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(",", " -")
    .toUpperCase();
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Checks if the date is actually valid before formatting
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
};

export const formatTimeOnly = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDuration = (totalMinutes: number): string => {
  if (!totalMinutes || totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  const hourPart = hours > 0 ? `${hours}h ` : "";
  const minutePart = minutes > 0 ? `${minutes}m` : "";

  return `${hourPart}${minutePart}`.trim();
};

export const geocodeLocations = async (locations: string[]) => {
  const coords = await Promise.all(
    locations.map(async (address, idx) => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        );
        if (res.data && res.data.length > 0) {
          return {
            id: `stop-${idx}`,
            address: address,
            lat: parseFloat(res.data[0].lat),
            lon: parseFloat(res.data[0].lon),
          };
        }
      } catch (err) {
        console.error("Geocoding failed for:", address);
      }
      // Fallback for BIT if geocoding fails, otherwise 0
      const isBIT = address.includes("Bannari Amman");
      return {
        id: `stop-${idx}`,
        address: address,
        lat: isBIT ? 11.4965 : 0,
        lon: isBIT ? 77.2764 : 0,
      };
    }),
  );
  return coords;
};

export const RouteStatus: Record<number, string> = {
  1: "Pending",
  2: "Vehicle Assigned",
  3: "Vehicle Reassigned",
  4: "Faculty Approved",
  5: "Driver Assigned",
  6: "Driver Reassigned",
  7: "Started",
  8: "Completed",
  9: "Cancelled",
};

export const ROUTE_STATUS: Record<string, number> = {
  PENDING: 1,
  VEHICLE_ASSIGNED: 2,
  VEHICLE_REASSIGNED: 3,
  FACULTY_APPROVED: 4,
  DRIVER_ASSIGNED: 5,
  DRIVER_REASSIGNED: 6,
  STARTED: 7,
  COMPLETED: 8,
  CANCELLED: 9,
};

export const DriverStatus: Record<number, string> = {
  1: "Available",
  2: "Assigned",
  3: "On Trip",
  4: "On Leave",
};

export const DRIVER_STATUS: Record<string, number> = {
  AVAILABLE: 1,
  ASSIGNED: 2,
  ON_TRIP: 3,
  ON_LEAVE: 4,
};

export const LEAVE_TYPE: Record<number, string> = {
  1: "Sick",
  2: "Casual",
  3: "Emergency",
  4: "Other",
};
