import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await axios.get(`${API_URL}/products/category/${categoryId}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await axios.post(`${API_URL}/products`, formData, {
    headers: { "Content-Type": "multipart/form-data", ...authHeader() }
  });
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await axios.put(`${API_URL}/products/${id}`, data, {
    headers: authHeader()
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`, {
    headers: authHeader()
  });
  return response.data;
};

export const setProductParts = async (id, parts) => {
  const response = await axios.put(`${API_URL}/products/${id}/parts`, { parts }, {
    headers: authHeader()
  });
  return response.data;
};
