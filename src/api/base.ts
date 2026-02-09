export const GOOGLE_CLIENT_ID = "1044594848603-3l3hi7sf390vgru417runabvpuimfpn2.apps.googleusercontent.com";
export const BASE_URL = "http://localhost:8055/api";
export const FILE_BASE_URL = "http://localhost:8055";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: token ? `TMS ${token}` : "",
  };
};
  