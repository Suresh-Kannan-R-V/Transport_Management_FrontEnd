export const BASE_URL = "http://localhost:3000/api";
export const FILE_BASE_URL = "http://localhost:3000";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: token ? `TMS ${token}` : "",
  };
};
  