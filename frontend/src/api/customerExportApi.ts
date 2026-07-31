import API from "./axios";

export const exportCustomerList = async () => {
    return API.get(
        "/customers/export/list?format=csv",
        {
            responseType: "blob"
        }
    );
};

export const exportCustomerAnalyticsCSV = async () => {
    return API.get(
        "/customers/export/analytics?format=csv",
        {
            responseType: "blob"
        }
    );
};

export const exportCustomerAnalyticsPDF = async () => {
    return API.get(
        "/customers/export/analytics?format=pdf",
        {
            responseType: "blob"
        }
    );
};

export const exportTopCustomersCSV = async () => {
    return API.get(
        "/customers/export/top-customers?format=csv",
        {
            responseType: "blob"
        }
    );
};

export const exportTopCustomersPDF = async () => {
    return API.get(
        "/customers/export/top-customers?format=pdf",
        {
            responseType: "blob"
        }
    );
};