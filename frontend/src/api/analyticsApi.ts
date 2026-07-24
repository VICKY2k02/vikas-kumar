import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const getDashboardSummary = () => {
    return axios.get(`${API}/analytics/dashboard`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
};


export const getDashboardAnalytics = (params?: any) =>
    API.get("/analytics/dashboard", {
        params
    });



export const getProducts = async () => {
    return await API.get("/products");
};