import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, mensaje, actualizarCantidad, eliminarDelCarrito } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.roleId !== 2) return null;

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div style={styles.overlay} onClick={() => setCartOpen(false)} />
      )}

      {/* Drawer */}
      <div style={{ ...styles.drawer, transform: cartOpen ? "translateX(0)" : "translateX(100%)" }}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, color: "var(--pink-dark)" }}>🛒 Mi carrito</h3>
          <button style={styles.closeBtn} onClick={() => setCartOpen(false)}>✕</button>
        </div>

        {mensaje && (
          <div style={styles.toast}>✅ {mensaje}</div>
        )}

        <div style={styles.body}>
          {!cart?.items?.length ? (
            <div style={styles.empty}>
              <span style={{ fontSize: 40 }}>🛍️</span>
              <p style={{ color: "var(--gray)", marginTop: 10 }}>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.orderItemId} style={styles.item}>
                {item.productImageUrl && (
                  <img src={item.productImageUrl} alt={item.productName} style={styles.img} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.productName}</p>
                  <p style={styles.itemPrice}>${item.unitPrice.toLocaleString()}</p>
                  <div style={styles.qty}>
                    <button style={styles.qtyBtn} onClick={() => actualizarCantidad(item.orderItemId, item.quantity - 1)}>−</button>
                    <span style={{ minWidth: 24, textAlign: "center", fontSize: 14 }}>{item.quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => actualizarCantidad(item.orderItemId, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={styles.subtotal}>${item.subtotal.toLocaleString()}</p>
                  <button style={styles.removeBtn} onClick={() => eliminarDelCarrito(item.orderItemId)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.total}>
              <span>Total</span>
              <span style={{ fontWeight: 700, color: "var(--pink-dark)", fontSize: 18 }}>
                ${cart.subtotal.toLocaleString()}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => { setCartOpen(false); navigate("/carrito"); }}
            >
              Ver carrito completo
            </button>
            <button
              className="btn-outline"
              style={{ width: "100%", marginTop: 8 }}
              onClick={() => setCartOpen(false)}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 150,
  },
  drawer: {
    position: "fixed", top: 0, right: 0,
    width: 360, height: "100vh",
    background: "var(--white)",
    boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
    zIndex: 200,
    display: "flex", flexDirection: "column",
    transition: "transform 0.3s ease",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1.5px solid var(--border)",
    background: "var(--pink-light)",
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "var(--gray)", padding: 4,
  },
  toast: {
    background: "var(--green-light)",
    color: "var(--green-dark)",
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 500,
    borderBottom: "1px solid var(--green)",
  },
  body: {
    flex: 1, overflowY: "auto", padding: "12px 16px",
  },
  empty: {
    textAlign: "center", paddingTop: 60,
  },
  item: {
    display: "flex", gap: 12, alignItems: "flex-start",
    padding: "12px 0",
    borderBottom: "1px solid var(--border)",
  },
  img: {
    width: 60, height: 60, objectFit: "cover",
    borderRadius: 8, flexShrink: 0,
  },
  itemName: {
    margin: 0, fontSize: 13, fontWeight: 600,
    color: "var(--gray-dark)", marginBottom: 2,
  },
  itemPrice: {
    margin: 0, fontSize: 12, color: "var(--gray)", marginBottom: 6,
  },
  qty: {
    display: "flex", alignItems: "center", gap: 8,
  },
  qtyBtn: {
    width: 26, height: 26, border: "1.5px solid var(--border)",
    borderRadius: 6, background: "var(--white)",
    cursor: "pointer", fontSize: 14, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  subtotal: {
    margin: "0 0 8px", fontWeight: 700, fontSize: 14,
    color: "var(--pink-dark)",
  },
  removeBtn: {
    background: "none", border: "none",
    cursor: "pointer", fontSize: 16,
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1.5px solid var(--border)",
    background: "var(--pink-light)",
  },
  total: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", fontSize: 15,
  },
};
