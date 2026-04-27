import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllOrders } from "../../services/orderService";

const STATUS_LABELS = {
  PendingPayment:  "Pendiente de pago",
  PaymentReceived: "Pago recibido",
  InProduction:    "En elaboración",
  QualityControl:  "Control de calidad",
  Shipped:         "Enviado",
  Delivered:       "Entregado",
  ReadyForPickup:  "Listo para recoger",
  PickedUp:        "Recogido",
};

const STATUS_COLORS = {
  PaymentReceived: "#f59e0b",
  InProduction:    "#3b82f6",
  QualityControl:  "#8b5cf6",
  Shipped:         "#06b6d4",
  Delivered:       "#10b981",
  ReadyForPickup:  "#f97316",
  PickedUp:        "#10b981",
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page" style={{ textAlign: "center", paddingTop: 60 }}><p style={{ color: "var(--gray)" }}>Cargando pedidos...</p></div>;

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Gestión de pedidos</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} confirmado{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--gray)" }}>No hay pedidos confirmados aún.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => (
            <div key={order.orderId} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Cabecera del pedido */}
              <div
                style={styles.orderHeader}
                onClick={() => setExpanded(expanded === order.orderId ? null : order.orderId)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <span style={styles.orderId}>Pedido #{order.orderId}</span>
                    <span style={{ color: "var(--gray)", fontSize: 13, marginLeft: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>
                  <span style={{
                    ...styles.badge,
                    background: STATUS_COLORS[order.status] ?? "var(--gray)",
                  }}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <span style={styles.total}>
                    ${order.total.toLocaleString("es-CO")}
                  </span>
                  <span style={{ color: "var(--gray)", fontSize: 12 }}>
                    {expanded === order.orderId ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Detalle expandible */}
              {expanded === order.orderId && (
                <div style={styles.orderBody}>
                  <div style={styles.section}>
                    <p style={styles.sectionTitle}>Productos</p>
                    {order.items.map((item) => (
                      <div key={item.orderItemId} style={styles.item}>
                        <span>{item.productName}</span>
                        <span style={{ color: "var(--gray)" }}>x{item.quantity}</span>
                        <span>${item.subtotal.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <div style={styles.notesBox}>
                        <span style={styles.notesLabel}>Personalización: </span>
                        <span style={styles.notesText}>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.section}>
                    <p style={styles.sectionTitle}>Historial de estados</p>
                    {order.tracking.map((t, i) => (
                      <div key={i} style={styles.trackItem}>
                        <span style={styles.trackDot} />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{t.statusDescription}</span>
                          {t.notes && <span style={{ color: "var(--gray)", fontSize: 12, marginLeft: 8 }}>— {t.notes}</span>}
                          <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 2 }}>
                            {new Date(t.createdAt).toLocaleString("es-CO")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.totalsRow}>
                    <span>Subtotal: ${order.subtotal.toLocaleString("es-CO")}</span>
                    <span>Envío: ${order.shippingCost.toLocaleString("es-CO")}</span>
                    <span style={{ fontWeight: 700 }}>Total: ${order.total.toLocaleString("es-CO")}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    cursor: "pointer",
    userSelect: "none",
  },
  orderId: {
    fontWeight: 700,
    fontSize: 15,
    color: "var(--gray-dark)",
  },
  badge: {
    color: "white",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
  },
  total: {
    fontWeight: 700,
    fontSize: 15,
    color: "var(--pink-dark)",
  },
  orderBody: {
    borderTop: "1px solid var(--border)",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--gray)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  item: {
    display: "flex",
    gap: 16,
    fontSize: 14,
    color: "var(--gray-dark)",
  },
  trackItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  notesBox: {
    marginTop: 8,
    padding: "8px 12px",
    background: "var(--pink-light)",
    borderRadius: 8,
    fontSize: 13,
  },
  notesLabel: {
    fontWeight: 600,
    color: "var(--pink-dark)",
  },
  notesText: {
    color: "var(--gray-dark)",
  },
  trackDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--pink)",
    marginTop: 4,
    flexShrink: 0,
  },
  totalsRow: {
    display: "flex",
    gap: 24,
    fontSize: 13,
    color: "var(--gray-dark)",
    borderTop: "1px solid var(--border)",
    paddingTop: 12,
  },
};
