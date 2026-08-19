import api from "./axios";

export const getInventoryForecast = (
    params?: any
) =>
    api.get("/inventory/forecast", {
        params
    });


export const getInventoryRecommendations = (
    params?: any
) =>
    api.get("/inventory/recommendations", {
        params
    });


export const getInventoryRecommendation = (
    productId: number,
    params?: any
) =>
    api.get(
        `/inventory/recommendations/${productId}`,
        {
            params
        }
    );


export const getInventoryForecastSummary = (
    params?: any
) =>
    api.get(
        "/inventory/forecast/summary",
        {
            params
        }
    );


export const getInventoryForecastChart = (
    params?: any
) =>
    api.get(
        "/inventory/forecast/chart",
        {
            params
        }
    );