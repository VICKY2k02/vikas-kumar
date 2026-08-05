import api from "./axios";

export const getDashboardSummary = () =>
  api.get("/dashboard/summary");

export const getInventoryByCategory = () =>
    api.get("/dashboard/inventory-by-category");

export const getStockStatus = () =>
    api.get("/dashboard/stock-status");

export const getInventoryValueCategory = () =>
    api.get("/dashboard/inventory-value-category");

export const getTopStockProducts = () =>
    api.get("/dashboard/top-stock-products");