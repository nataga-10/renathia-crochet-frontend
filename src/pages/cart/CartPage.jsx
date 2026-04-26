import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getProductById } from "../../services/productService";
import PersonalizacionModal from "../../components/common/PersonalizacionModal";

export default function CartPage() {
  const { cart, loading, mensaje, actualizarCantidad, eliminarDelCarrito, finalizarCompra } = useCart();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState("Shipping");
  const [notes, setNotes] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [editItem, setEditItem] = useState(null);       // item del carrito en edición
  const [editProduct, setEditProduct] = useState(null); // datos completos del producto
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleEditPersonalizacion = async (item) => {
    setLoadingEdit(true);
    try {
      const product = await getProductById(item.productId);
      if (!product.parts || product.parts.length === 0) return;
      setEditItem(item);
      setEditProduct(product);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEditConfirm = async (customPrice, customNotes) => {
    await eliminarDelCarrito(editItem.orderItemId);
    await agregarAlCarrito(editItem.productId, editItem.quantity, null, customPrice, customNotes);
    setEditItem(null);
    setEditProduct(null);
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      const order = await finalizarCompra(deliveryMethod, notes);
      navigate(`/mis-pedidos/${order.orderId}`);
    } catch (error) {
      console.error("Error al finalizar compra:", error);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando carrito...</p>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
        <h2>Tu carrito esta vacio</h2>
        <p style={{ color: "gray" }}>Agrega productos desde el catalogo para comenzar tu compra.</p>
        <button
          onClick={() => navigate("/catalogo")}
          style={{ padding: "12px 24px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px", marginTop: "20px" }}>
          Ver Catalogo
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px" }}>
      <h2>Mi Carrito - RENATHIA CROCHET</h2>

      {mensaje && (
        <p style={{ backgroundColor: "#E8F5EE", color: "#1A7A4A", padding: "10px", borderRadius: "5px" }}>
          {mensaje}
        </p>
      )}

      {/* Lista de productos en el carrito */}
      <div style={{ marginBottom: "30px" }}>
        {cart.items.map(item => (
          <div key={item.orderItemId} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "15px", borderBottom: "1px solid #ddd", marginBottom: "10px" }}>

            {/* Imagen del producto */}
            {item.productImageUrl && (
              <img src={item.productImageUrl} alt={item.productName}
                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }} />
            )}

            {/* Nombre y precio */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 5px 0" }}>{item.productName}</h4>
              <p style={{ margin: 0, color: "gray" }}>
                Precio unitario: ${item.unitPrice.toLocaleString()}
              </p>
            </div>

            {/* Controles de cantidad */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => actualizarCantidad(item.orderItemId, item.quantity - 1)}
                style={{ width: "32px", height: "32px", backgroundColor: "#f0f0f0", border: "1px solid #ddd", cursor: "pointer", borderRadius: "4px", fontSize: "18px" }}>
                -
              </button>
              <span style={{ fontWeight: "bold", minWidth: "30px", textAlign: "center" }}>
                {item.quantity}
              </span>
              <button
                onClick={() => actualizarCantidad(item.orderItemId, item.quantity + 1)}
                style={{ width: "32px", height: "32px", backgroundColor: "#f0f0f0", border: "1px solid #ddd", cursor: "pointer", borderRadius: "4px", fontSize: "18px" }}>
                +
              </button>
            </div>

            {/* Subtotal del item */}
            <div style={{ minWidth: "100px", textAlign: "right" }}>
              <p style={{ fontWeight: "bold", margin: 0 }}>
                ${item.subtotal.toLocaleString()}
              </p>
            </div>

            {/* Botones acción */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => handleEditPersonalizacion(item)}
                disabled={loadingEdit}
                style={{ backgroundColor: "var(--pink)", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px", fontSize: 13, whiteSpace: "nowrap" }}>
                🎨 Editar
              </button>
              <button
                onClick={() => eliminarDelCarrito(item.orderItemId)}
                style={{ backgroundColor: "#A00000", color: "white", border: "none", padding: "6px 12px", cursor: "pointer", borderRadius: "4px", fontSize: 13 }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del carrito */}
      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>Resumen del pedido</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span>Subtotal ({cart.totalItems} productos):</span>
          <span>${cart.subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span>Envio:</span>
          <span>{cart.total - cart.subtotal > 0 ? `$${(cart.total - cart.subtotal).toLocaleString()}` : "Por calcular"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", borderTop: "1px solid #ddd", paddingTop: "10px" }}>
          <span>Total:</span>
          <span style={{ color: "#6B2D8B" }}>${cart.subtotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Metodo de entrega */}
      <div style={{ backgroundColor: "#f0f4ff", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ marginTop: 0 }}>Metodo de entrega</h3>
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <label style={{ cursor: "pointer" }}>
            <input type="radio" value="Shipping" checked={deliveryMethod === "Shipping"}
              onChange={(e) => setDeliveryMethod(e.target.value)} />
            {" "} Envio a domicilio
          </label>
          <label style={{ cursor: "pointer" }}>
            <input type="radio" value="Pickup" checked={deliveryMethod === "Pickup"}
              onChange={(e) => setDeliveryMethod(e.target.value)} />
            {" "} Recojo en tienda
          </label>
        </div>

        <div>
          <label>Notas adicionales (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: color especifico, dedicatoria, instrucciones de entrega..."
            style={{ width: "100%", padding: "8px", marginTop: "8px", height: "80px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
      </div>

      {/* Botones de accion */}
      <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
        <button
          onClick={() => navigate("/catalogo")}
          style={{ padding: "12px 24px", backgroundColor: "white", color: "#6B2D8B", border: "2px solid #6B2D8B", cursor: "pointer", borderRadius: "5px" }}>
          Seguir comprando
        </button>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          style={{ padding: "12px 32px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px", fontWeight: "bold", fontSize: "16px" }}>
          {checkingOut ? "Procesando..." : "Finalizar compra"}
        </button>
      </div>

      {/* Modal de edición de personalización */}
      {editProduct && (
        <PersonalizacionModal
          product={editProduct}
          onConfirm={handleEditConfirm}
          onClose={() => { setEditItem(null); setEditProduct(null); }}
        />
      )}
    </div>
  );
}