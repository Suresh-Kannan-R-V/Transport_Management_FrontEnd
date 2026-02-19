export const BASE_URL = "https://18x50gz9-8055.inc1.devtunnels.ms/api";
export const FILE_BASE_URL = "https://18x50gz9-8055.inc1.devtunnels.ms";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: token ? `TMS ${token}` : "",
    "X-Tunnel-Skip-Anti-Phishing-Page": "true",
  };
};
