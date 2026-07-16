import api from "./axios";

export const getCategories = (
  search: string = ""
) =>
  api.get("/categories", {
    params: { search }
  });

export const getCategory = (
  id: number
) =>
  api.get(`/categories/${id}`);

export const createCategory = (
  data: any
) =>
  api.post("/categories", data);

export const updateCategory = (
  id: number,
  data: any
) =>
  api.put(`/categories/${id}`, data);

export const deleteCategory = (
  id: number
) =>
  api.delete(`/categories/${id}`);