import api from "./axios";

/* Inventory  */

export const getInventory = (params?: any) =>
    api.get("/inventory", { params });

export const getInventoryById = (id: number) =>
    api.get(`/inventory/${id}`);

export const createInventory = (data: any) =>
    api.post("/inventory", data);


/*  Stock Operations  */


export const removeStock = (
    id: number,
    data: any
) =>
    api.patch(
        `/inventory/${id}/remove-stock`,
        data
    );


export const adjustStock = (
    id: number,
    data: any
) =>
    api.patch(
        `/inventory/${id}/adjust-stock`,
        data
    );

/*  Reorder Level  */

export const updateReorderLevel = (
    id: number,
    reorderLevel: number
) =>
    api.put(
        `/inventory/${id}/reorder-level`,
        {
            reorder_level: reorderLevel
        }
    );



/*  Dashboard  */

export const getInventoryDashboard = () =>
    api.get("/inventory/dashboard");


/*Movement History */

export const getInventoryMovements = (
    id: number
) =>
    api.get(
        `/inventory/${id}/movements`
    );

export const addStock = (
    id: number,
    data: any
) =>
    api.patch(
        `/inventory/${id}/add-stock`,
        data
    );








