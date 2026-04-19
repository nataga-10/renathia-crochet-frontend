import axios from "axios";

const API_URL = "http://localhost:5098/api";

// Funcion helper que agrega el token JWT a cada peticion
// El carrito requiere autenticacion, por eso enviamos el token
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// HU-05: Obtiene el carrito actual del usuario autenticado
export const getCart = async (token) => {
  const response = await axios.get(`${API_URL}/Cart`, authHeader(token));
  return response.data;
};

// HU-05: Agrega un producto al carrito
// Si el carrito no existe lo crea automaticamente
export const addToCart = async (token, productId, quantity = 1, productColorId = null) => {
  const response = await axios.post(
    `${API_URL}/Cart`,
    { productId, quantity, productColorId },
    authHeader(token)
  );
  return response.data;
};

// HU-06: Actualiza la cantidad de un producto en el carrito
// Si quantity = 0, el backend elimina el producto
export const updateCartItem = async (token, orderItemId, quantity) => {
  const response = await axios.put(
    `${API_URL}/Cart/items/${orderItemId}`,
    { quantity },
    authHeader(token)
  );
  return response.data;
};

// HU-07: Elimina un producto del carrito
export const removeFromCart = async (token, orderItemId) => {
  const response = await axios.delete(
    `${API_URL}/Cart/items/${orderItemId}`,
    authHeader(token)
  );
  return response.data;
};

// HU-08: Finaliza la compra
// deliveryMethod: "Shipping" o "Pickup"
export const checkout = async (token, deliveryMethod, notes = "") => {
  const response = await axios.post(
    `${API_URL}/Cart/checkout`,
    { deliveryMethod, notes },
    authHeader(token)
  );
  return response.data;
};