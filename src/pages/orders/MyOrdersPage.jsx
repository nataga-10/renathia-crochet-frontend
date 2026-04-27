import { useEffect, useState } from "react";
import { getMyOrders } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyOrdersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await getMyOrders(token);
      if (data.message) {
        setMensaje(data.message);
      } else {
        setOrders(data);
      }
    } catch (error) {
      setMensaje("Error al cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };

  // Devuelve un color segun el estado del pedido
  const getStatusColor = (status) => {
    switch (status) {
      case "PaymentReceived": return "#1A7A4A";
      case "InProduction": return "#B05000";
      case "QualityControl": return "#1A3A8A";
      case "Shipped": return "#6B2D8B";
      case "Delivered": return "#1A7A4A";
      case "ReadyForPickup": return "#1A3A8A";
      case "PickedUp": return "#1A7A4A";
      default: return "#555555";
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando pedidos...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px" }}>
      <h2>Mis Pedidos - RENATHIA CROCHET</h2>

      {mensaje && (
        <p style={{ color: "gray", textAlign: "center", marginTop: "40px" }}>{mensaje}</p>
      )}

      {orders.map(order => (
        <div key={order.orderId} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>

          {/* Encabezado del pedido */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <div>
              <h3 style={{ margin: "0 0 5px 0" }}>Pedido #{order.orderId}</h3>
              <p style={{ margin: 0, color: "gray", fontSize: "14px" }}>
                {new Date(order.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>
            <span style={{ backgroundColor: getStatusColor(order.status), color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
              {order.statusDescription}
            </span>
          </div>

          {/* Productos del pedido */}
          <div style={{ marginBottom: "15px" }}>
            {order.items.map(item => (
              <div key={item.orderItemId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span>{item.productName} x{item.quantity}</span>
                <span>${item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Total y metodo de entrega */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "gray", fontSize: "14px" }}>
              {order.deliveryMethod === "Shipping" ? "Envio a domicilio" : "Recojo en tienda"}
            </span>
            <span style={{ fontWeight: "bold", fontSize: "18px", color: "#6B2D8B" }}>
              Total: ${order.total.toLocaleString()}
            </span>
          </div>

          {/* Boton ver detalle */}
          <button
            onClick={() => navigate(`/mis-pedidos/${order.orderId}`)}
            style={{ marginTop: "15px", padding: "8px 20px", backgroundColor: "white", color: "#6B2D8B", border: "2px solid #6B2D8B", cursor: "pointer", borderRadius: "5px" }}>
            Ver detalle y seguimiento
          </button>
        </div>
      ))}
    </div>
  );
}