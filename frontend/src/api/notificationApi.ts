import api from "./axios";

export const getNotifications = () =>
  api.get("/notifications/");

export const markNotificationRead = (id: number) =>
  api.put(`/notifications/${id}/read`);

export const clearNotifications = () =>
  api.delete("/notifications/clear/all");