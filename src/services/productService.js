import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await axios.get(`${API_URL}/products/category/${categoryId}`);
  return response.data;
};