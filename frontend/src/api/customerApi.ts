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


// ------------------------------------
// Get Customers
// ------------------------------------
export const getCustomers = async (params?: any) => {
    const response = await API.get("/customers", {
        params
    });

    return response.data;
};


// ------------------------------------
// Get Single Customer
// ------------------------------------
export const getCustomer = (id: number) =>
    API.get(`/customers/${id}`);


// ------------------------------------
// Create Customer
// ------------------------------------
export const createCustomer = (data: any) =>
    API.post("/customers", data);


// ------------------------------------
// Update Customer
// ------------------------------------
export const updateCustomer = (
    id: number,
    data: any
) =>
    API.put(`/customers/${id}`, data);


// ------------------------------------
// Delete Customer
// ------------------------------------
export const deleteCustomer = (
    id: number
) =>
    API.delete(`/customers/${id}`);


// ------------------------------------
// Activate / Deactivate Customer
// ------------------------------------
export const changeCustomerStatus = (
    id: number,
    status: string
) =>
    API.patch(
        `/customers/${id}/status`,
        null,
        {
            params: {
                status
            }
        }
    );


// ------------------------------------
// Export Customers
// ------------------------------------
export const exportCustomers = (
    format: string
) =>
    API.get(
        "/customers/export",
        {
            params: {
                format
            },
            responseType: "blob"
        }
    );

// ------------------------------------
// Customer Analytics
// ------------------------------------

export const getCustomerAnalytics = () =>
    API.get("/customers/analytics");



export const getCustomerSegments = () =>
    API.get("/customers/segments");