import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://chat-app-gnvv.onrender.com" : "/api",
  withCredentials: true,
});
