import { createContext, useContext, useState, useEffect } from "react";
import { getCart, addToCart, updateCartItem, removeFromCart, checkout } from "../services/cartService";
import { useAuth } from "./AuthContext";

// Contexto global del carrito
// Permite que cualquier componente acceda al carrito sin pasar props
const CartContext = createContext();

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Cargar el carrito cuando el usuario inicia sesion
  useEffect(() => {
    if (token) {
      cargarCarrito();
    } else {
      setCart(null);
    }
  }, [token]);

  // Obtiene el carrito actual del usuario desde la API
  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const data = await getCart(token);
      setCart(data);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
    } finally {
      setLoading(false);
    }
  };

  // HU-05: Agrega un producto al carrito
  const agregarAlCarrito = async (productId, quantity = 1, productColorId = null, customPrice = null, customizationNotes = null) => {
    try {
      setLoading(true);
      const data = await addToCart(token, productId, quantity, productColorId, customPrice, customizationNotes);
      setCart(data);
      setMensaje("¡Producto agregado al carrito!");
      setCartOpen(true);
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje("Error al agregar el producto");
    } finally {
      setLoading(false);
    }
  };

  // HU-06: Actualiza la cantidad de un producto
  const actualizarCantidad = async (orderItemId, quantity) => {
    try {
      setLoading(true);
      const data = await updateCartItem(token, orderItemId, quantity);
      setCart(data);
    } catch (error) {
      setMensaje("Error al actualizar el carrito");
    } finally {
      setLoading(false);
    }
  };

  // HU-07: Elimina un producto del carrito
  const eliminarDelCarrito = async (orderItemId) => {
    try {
      setLoading(true);
      const data = await removeFromCart(token, orderItemId);
      setCart(data);
      setMensaje("Producto eliminado del carrito");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje("Error al eliminar el producto");
    } finally {
      setLoading(false);
    }
  };

  // HU-08: Finaliza la compra
  const finalizarCompra = async (deliveryMethod, notes) => {
    try {
      setLoading(true);
      const order = await checkout(token, deliveryMethod, notes);
      setCart(null); // Limpiar carrito despues de comprar
      return order;
    } catch (error) {
      setMensaje("Error al finalizar la compra");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      mensaje,
      cartOpen,
      setCartOpen,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      finalizarCompra,
      cargarCarrito
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}