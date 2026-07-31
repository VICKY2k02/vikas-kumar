import api from "./axios";

export const generateForecast = async (period: number) => {
    const res = await api.post(`/forecast/generate?period=${period}`);
    return res.data;
};

export const refreshForecast = (period: number) =>
    api.post(`/forecast/refresh?period=${period}`);

export const getDashboard = () =>
    api.get("/forecast/dashboard");

export const getProductForecasts = () =>
    api.get("/forecast/products");

export const getCategoryForecasts = () =>
    api.get("/forecast/categories");

// -------------------------
// Get Forecasts
// -------------------------
export const getForecasts = async () => {
    const response = await api.get("/forecast/products");
    return response.data;
};

// -------------------------
// KPI Dashboard
// -------------------------
export const getForecastDashboard = async () => {

    const response = await api.get(
        "/forecast/dashboard"
    );

    return response.data;
};

// -------------------------
// Export
// -------------------------
export const exportForecast = async (
    type: string,
    format: string
) => {

    const response = await api.get(

        `/forecast/export/${type}?format=${format}`,

        {
            responseType: "blob"
        }

    );

    return response.data;
};



export const exportForecastReport = async (

    report:string,

    format:string

)=>{

    const res = await api.get(

        `/forecast/export/${report}?format=${format}`,

        {

            responseType:"blob"

        }

    );

    const url=

        window.URL.createObjectURL(

            new Blob([res.data])

        );

    const link=document.createElement("a");

    link.href=url;

    link.download=`${report}.${format}`;

    link.click();

};