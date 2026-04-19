/**
 * Servicio de productos. Encapsula todas las llamadas a la API REST del catálogo.
 * La creación usa multipart/form-data para enviar la imagen junto con los datos.
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

/** Obtiene todos los productos activos del catálogo. */
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

/** Obtiene un producto específico por su ID. */
export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

/** Filtra productos activos por categoría. */
export const getProductsByCategory = async (categoryId) => {
  const response = await axios.get(`${API_URL}/products/category/${categoryId}`);
  return response.data;
};

/**
 * Crea un nuevo producto. Requiere multipart/form-data para enviar la imagen opcional.
 * @param {FormData} formData - Datos del producto incluyendo el campo "image" opcional
 */
export const createProduct = async (formData) => {
  const response = await axios.post(`${API_URL}/products`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

/**
 * Actualiza los datos de un producto existente (sin imagen, usa JSON).
 * @param {number} id - ID del producto a actualizar
 * @param {object} data - Campos actualizados del producto
 */
export const updateProduct = async (id, data) => {
  const response = await axios.put(`${API_URL}/products/${id}`, data);
  return response.data;
};

/**
 * Realiza la eliminación lógica del producto (soft delete en el backend).
 * @param {number} id - ID del producto a eliminar
 */
export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};