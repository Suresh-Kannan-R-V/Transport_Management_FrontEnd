import axios from "axios";
import { FILE_BASE_URL } from "./base";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const createWebSession = () =>
    API.post(`${FILE_BASE_URL}/auth/web-login-session`);

export const checkWebSession = (sessionId: string) =>
    API.get(`${FILE_BASE_URL}/auth/web-login-session/${sessionId}`);
