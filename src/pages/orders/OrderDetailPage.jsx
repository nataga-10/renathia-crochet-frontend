import { useEffect, useState } from "react";
import { getOrderById } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetailPage() {
  const { token } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedido();
  }, []);

  const cargarPedido = async () => {
    try {
      const data = await getOrderById(token, orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  // Icono segun el estado del pedido
  const getStatusIcon = (status) => {
    switch (status) {
      case "PendingPayment": return "⏳";
      case "PaymentReceived": return "✅";
      case "InProduction": return "🧶";
      case "QualityControl": return "🔍";
      case "Shipped": return "📦";
      case "Delivered": return "🎉";
      case "ReadyForPickup": return "🏪";
      case "PickedUp": return "✅";
      default: return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PaymentReceived": return "#1A7A4A";
      case "InProduction": return "#B05000";
      case "QualityControl": return "#1A3A8A";
      case "Shipped": return "#6B2D8B";
      case "Delivered": return "#1A7A4A";
      default: return "#555555";
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando pedido...</p>;

  if (!order) return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p>Pedido no encontrado</p>
      <button onClick={() => navigate("/mis-pedidos")}
        style={{ padding: "10px 20px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}>
        Volver a mis pedidos
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "20px" }}>

      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ margin: "0 0 5px 0" }}>Pedido #{order.orderId}</h2>
          <p style={{ margin: 0, color: "gray" }}>
            {new Date(order.createdAt).toLocaleDateString("es-CO", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </p>
        </div>
        <span style={{ backgroundColor: getStatusColor(order.status), color: "white", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold" }}>
          {getStatusIcon(order.status)} {order.statusDescription}
        </span>
      </div>

      {/* Tracking del pedido */}
      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
        <h3 style={{ marginTop: 0, color: "#6B2D8B" }}>Seguimiento del pedido</h3>
        <div style={{ position: "relative" }}>
          {order.tracking.map((track, index) => (
            <div key={index} style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
              {/* Icono del estado */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#6B2D8B", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                  {getStatusIcon(track.status)}
                </div>
                {index < order.tracking.length - 1 && (
                  <div style={{ width: "2px", flex: 1, backgroundColor: "#ddd", marginTop: "5px" }} />
                )}
              </div>

              {/* Detalle del estado */}
              <div style={{ flex: 1, paddingBottom: "15px" }}>
                <p style={{ margin: "0 0 4px 0", fontWeight: "bold", color: "#333" }}>
                  {track.statusDescription}
                </p>
                {track.notes && (
                  <p style={{ margin: "0 0 4px 0", color: "#555", fontSize: "14px" }}>
                    {track.notes}
                  </p>
                )}
                <p style={{ margin: 0, color: "gray", fontSize: "13px" }}>
                  {new Date(track.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productos del pedido */}
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "25px" }}>
        <h3 style={{ marginTop: 0 }}>Productos</h3>
        {order.items.map(item => (
          <div key={item.orderItemId} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>{item.productName}</p>
              <p style={{ margin: 0, color: "gray", fontSize: "14px" }}>
                {item.quantity} x ${item.unitPrice.toLocaleString()}
              </p>
            </div>
            <p style={{ fontWeight: "bold", margin: 0 }}>${item.subtotal.toLocaleString()}</p>
          </div>
        ))}

        {/* Totales */}
        <div style={{ marginTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span>Subtotal:</span>
            <span>${order.subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span>Envio:</span>
            <span>{order.shippingCost > 0 ? `$${order.shippingCost.toLocaleString()}` : "Gratis"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", borderTop: "1px solid #ddd", paddingTop: "10px" }}>
            <span>Total:</span>
            <span style={{ color: "#6B2D8B" }}>${order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Metodo de entrega */}
      <div style={{ backgroundColor: "#f0f4ff", padding: "15px", borderRadius: "8px", marginBottom: "25px" }}>
        <p style={{ margin: 0 }}>
          <strong>Metodo de entrega:</strong>{" "}
          {order.deliveryMethod === "Shipping" ? "Envio a domicilio" : "Recojo en tienda"}
        </p>
      </div>

      {/* Boton volver */}
      <button
        onClick={() => navigate("/mis-pedidos")}
        style={{ padding: "10px 24px", backgroundColor: "white", color: "#6B2D8B", border: "2px solid #6B2D8B", cursor: "pointer", borderRadius: "5px" }}>
        Volver a mis pedidos
      </button>
    </div>
  );
}