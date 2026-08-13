import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {

    const token =
        localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});


export const getDashboardSummary = () => {
    return API.get("/analytics/dashboard");
};


export const getDashboardAnalytics = (
    params?: any
) => {

    return API.get(
        "/analytics/dashboard",
        {
            params
        }
    );
};


export const getProducts = async () => {

    return API.get("/products");

};


export const exportAnalytics = (
    format: "csv" | "pdf",
    filters: any
) => {

    return API.get(
        `/analytics/export/${format}`,
        {
            params: filters,
            responseType: "blob"
        }
    );

};