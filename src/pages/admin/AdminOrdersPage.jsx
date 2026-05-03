import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";

const STATUS_LABELS = {
  PendingPayment:  "Pendiente de pago",
  PaymentReceived: "Pago recibido",
  InProduction:    "En elaboración",
  QualityControl:  "Control de calidad",
  Shipped:         "Enviado",
  Delivered:       "Entregado",
  ReadyForPickup:  "Listo para recoger",
  PickedUp:        "Recogido",
  Cancelled:       "Cancelado",
};

const VALID_STATUSES = [
  { value: "PaymentReceived", label: "Pago recibido" },
  { value: "InProduction",    label: "En elaboración artesanal" },
  { value: "QualityControl",  label: "Control de calidad" },
  { value: "ReadyForPickup",  label: "Listo para recoger" },
  { value: "Shipped",         label: "Enviado" },
  { value: "Delivered",       label: "Entregado" },
  { value: "PickedUp",        label: "Recogido" },
  { value: "Cancelled",       label: "Cancelado" },
];

const STATUS_COLORS = {
  PaymentReceived: "#f59e0b",
  InProduction:    "#3b82f6",
  QualityControl:  "#8b5cf6",
  Shipped:         "#06b6d4",
  Delivered:       "#10b981",
  ReadyForPickup:  "#f97316",
  PickedUp:        "#10b981",
  Cancelled:       "#6b7280",
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [statusDraft, setStatusDraft] = useState({});   // { [orderId]: { status, notes } }
  const [updating, setUpdating] = useState(null);        // orderId en proceso

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders(token);
      setOrders(Array.isArray(data) ? data : []);
      console.log("Pedidos:", data);
    } catch {
      setError("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId) => {
    const draft = statusDraft[orderId];
    if (!draft?.status) return;
    setUpdating(orderId);
    try {
      await updateOrderStatus(token, orderId, draft.status, draft.notes ?? "");
      await loadOrders();
      setStatusDraft(prev => ({ ...prev, [orderId]: {} }));
    } catch {
      setError("Error al actualizar el estado.");
    } finally {
      setUpdating(null);
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
                  {/* Cliente + Entrega */}
                  <div style={styles.infoRow}>
                    <div style={styles.infoBlock}>
                      <p style={styles.sectionTitle}>Cliente</p>
                      <p style={styles.infoText}>{order.clientName ?? "—"}</p>
                      <p style={styles.infoSubText}>{order.clientEmail ?? "—"}</p>
                    </div>
                    <div style={styles.infoBlock}>
                      <p style={styles.sectionTitle}>Entrega</p>
                      <p style={styles.infoText}>
                        {order.deliveryMethod === "Shipping" ? "Envío a domicilio" : "Recojo en tienda"}
                      </p>
                      {order.deliveryMethod === "Shipping" && order.shippingAddress && (
                        <p style={styles.infoSubText}>📍 {order.shippingAddress}</p>
                      )}
                      {order.notes && (
                        <p style={styles.infoSubText}>{order.notes}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.section}>
                    <p style={styles.sectionTitle}>Productos</p>
                    {order.items.map((item) => (
                      <div key={item.orderItemId} style={{ marginBottom: 8 }}>
                        <div style={styles.item}>
                          <span>{item.productName}</span>
                          <span style={{ color: "var(--gray)" }}>x{item.quantity}</span>
                          <span>${item.subtotal.toLocaleString("es-CO")}</span>
                        </div>
                        {item.notes && (
                          <div style={styles.notesBox}>
                            <span style={styles.notesLabel}>Personalización: </span>
                            <span style={styles.notesText}>{item.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
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

                  {/* Cambiar estado — HU-11 */}
                  <div style={styles.statusSection}>
                    <p style={styles.sectionTitle}>Cambiar estado del pedido</p>
                    <div style={styles.statusRow}>
                      <select
                        value={statusDraft[order.orderId]?.status ?? order.status}
                        onChange={e => setStatusDraft(prev => ({
                          ...prev,
                          [order.orderId]: { ...prev[order.orderId], status: e.target.value }
                        }))}
                        style={styles.statusSelect}
                      >
                        {VALID_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Nota interna (opcional)"
                        value={statusDraft[order.orderId]?.notes ?? ""}
                        onChange={e => setStatusDraft(prev => ({
                          ...prev,
                          [order.orderId]: { ...prev[order.orderId], notes: e.target.value }
                        }))}
                        style={styles.statusNoteInput}
                      />
                      <button
                        onClick={() => handleUpdateStatus(order.orderId)}
                        disabled={updating === order.orderId}
                        style={styles.statusBtn}
                      >
                        {updating === order.orderId ? "Guardando..." : "Actualizar estado"}
                      </button>
                    </div>
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
  infoRow: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    padding: "12px 16px",
    background: "var(--pink-light)",
    borderRadius: 10,
  },
  infoBlock: {
    flex: 1,
    minWidth: 160,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  infoText: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--gray-dark)",
  },
  infoSubText: {
    margin: 0,
    fontSize: 13,
    color: "var(--gray)",
  },
  statusSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 16px",
    background: "#f8f4ff",
    borderRadius: 10,
    border: "1.5px solid #e2d9f3",
  },
  statusRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  statusSelect: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 13,
    fontFamily: "inherit",
    background: "var(--white)",
    cursor: "pointer",
    flex: "0 0 auto",
  },
  statusNoteInput: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 13,
    fontFamily: "inherit",
    flex: 1,
    minWidth: 160,
  },
  statusBtn: {
    background: "var(--pink-dark, #c0386a)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  },
};
