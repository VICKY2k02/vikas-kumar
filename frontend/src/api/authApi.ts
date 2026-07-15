import api from "./axios";

export const registerCompany = (data: any) =>
  api.post("/auth/register-company", data);

export const loginUser = (data: any) =>
  api.post("/auth/login", data);

export const logoutUser = () =>
    api.post("/auth/logout");

export const getProfile = () => {
  const token = localStorage.getItem("access_token");

  return api.get("/profile/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const forgotPassword = (data: any) =>
    api.post("/auth/forgot-password", data);

export const resetPassword = (data: any) =>
    api.post("/auth/reset-password", data);

export const registerUser = (data: any) =>
    api.post("/auth/register-user", data);

export const clearAuditLogs = () =>
    api.delete("/audit/clear");