import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// HU-09: Obtiene todos los pedidos del usuario autenticado
// No incluye el carrito actual (solo pedidos confirmados)
export const getMyOrders = async (token) => {
  const response = await axios.get(`${API_URL}/Orders`, authHeader(token));
  return response.data;
};

// Admin y Seller: obtiene todos los pedidos confirmados
export const getAllOrders = async (token) => {
  const response = await axios.get(`${API_URL}/Orders/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Obtiene el detalle de un pedido especifico con su tracking
export const getOrderById = async (token, orderId) => {
  const response = await axios.get(`${API_URL}/Orders/${orderId}`, authHeader(token));
  return response.data;
};

// HU-11: Admin/Seller cambia el estado de un pedido
export const updateOrderStatus = async (token, orderId, status, notes = "") => {
  const response = await axios.put(
    `${API_URL}/Orders/${orderId}/status`,
    { status, notes },
    authHeader(token)
  );
  return response.data;
};