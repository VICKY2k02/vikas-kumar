import api from "./axios";


export const getSales = (params?: any) =>
    api.get("/sales/", { params });

export const getSale = (id: number) =>
    api.get(`/sales/${id}`);

export const createSale = (data: any) =>
    api.post("/sales/", data);

export const updateSale = (id: number, data: any) =>
    api.put(`/sales/${id}`, data);

export const deleteSale = (id: number) =>
    api.delete(`/sales/${id}`);

export const dashboardSummary = () =>
    api.get("/sales/dashboard/summary");

export const exportInvoicePDF = (id: number) =>
    api.get(`/sales/${id}/export`, {
        params: { format: "pdf" },
        responseType: "blob"
    });

export const exportInvoiceCSV = (id: number) =>
    api.get(`/sales/${id}/export`, {
        params: { format: "csv" },
        responseType: "blob"
    });