import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getOrderById } from "../../services/orderService";

const MAX_INTENTOS = 15;   // 15 × 3 s = 45 s máximo de polling
const INTERVALO_MS = 3000;

export default function ResultadoPagoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { limpiarCarrito } = useCart();

  const orderId = searchParams.get("orderId");

  const [estadoPedido, setEstadoPedido] = useState("PendingPayment");
  const [intentos, setIntentos] = useState(0);
  const [segundos, setSegundos] = useState(5);
  const pollingRef = useRef(null);
  const cuentaRef = useRef(null);

  const confirmado = estadoPedido !== "PendingPayment";
  const agotado = !confirmado && intentos >= MAX_INTENTOS;

  // Polling: consulta el estado del pedido cada INTERVALO_MS
  useEffect(() => {
    if (!orderId || !token) return;

    const poll = async () => {
      try {
        const order = await getOrderById(token, orderId);
        const status = order?.status ?? order?.Status ?? "PendingPayment";
        setEstadoPedido(status);
        setIntentos((n) => n + 1);

        if (status !== "PendingPayment") {
          clearInterval(pollingRef.current);
        }
      } catch {
        setIntentos((n) => n + 1);
      }
    };

    // Primera consulta inmediata, luego cada INTERVALO_MS
    poll();
    pollingRef.current = setInterval(poll, INTERVALO_MS);

    return () => clearInterval(pollingRef.current);
  }, [orderId, token]);

  // Detener polling cuando se alcanza el máximo de intentos
  useEffect(() => {
    if (intentos >= MAX_INTENTOS) clearInterval(pollingRef.current);
  }, [intentos]);

  // Limpiar carrito cuando el pago es confirmado
  useEffect(() => {
    if (confirmado) limpiarCarrito();
  }, [confirmado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cuenta regresiva de redirección — solo arranca cuando el pago está confirmado
  useEffect(() => {
    if (!confirmado || !orderId) return;

    cuentaRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(cuentaRef.current);
          navigate(`/mis-pedidos/${orderId}`, { replace: true });
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(cuentaRef.current);
  }, [confirmado, orderId, navigate]);

  if (!orderId) {
    navigate("/mis-pedidos", { replace: true });
    return null;
  }

  return (
    <div style={{
      maxWidth: "550px",
      margin: "60px auto",
      padding: "40px 30px",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>

      {/* ── Pago confirmado ── */}
      {confirmado && (
        <>
          <div style={styles.iconCircle("#E8F5EE")}>✓</div>
          <h2 style={{ color: "#1A7A4A", marginBottom: "12px" }}>Pago confirmado</h2>
          <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "8px" }}>
            Tu pago fue aprobado y tu pedido está siendo preparado.
          </p>
          <p style={{ color: "#555", marginBottom: "24px" }}>
            Pedido <strong>#{orderId}</strong>
          </p>
          <button onClick={() => navigate(`/mis-pedidos/${orderId}`)} style={styles.btnPrimary}>
            Ver mi pedido
          </button>
          <p style={{ color: "#aaa", fontSize: "13px", marginTop: "12px" }}>
            Redirigiendo automáticamente en {segundos} segundos...
          </p>
        </>
      )}

      {/* ── Verificando pago (polling en curso) ── */}
      {!confirmado && !agotado && (
        <>
          <div style={styles.iconCircle("#FFF8E1")}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
          </div>
          <h2 style={{ color: "#795548", marginBottom: "12px" }}>Verificando pago...</h2>
          <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "24px" }}>
            Wompi está procesando tu transacción. Esto puede tomar unos segundos.
          </p>
          <p style={{ color: "#555", marginBottom: "24px" }}>
            Pedido <strong>#{orderId}</strong>
          </p>
          <div style={styles.infoBox}>
            <div style={styles.progressBar(intentos, MAX_INTENTOS)} />
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#795548" }}>
              Verificando... intento {intentos} de {MAX_INTENTOS}
            </p>
          </div>
          <button onClick={() => navigate(`/mis-pedidos/${orderId}`)} style={styles.btnSecondary}>
            Ver mi pedido
          </button>
        </>
      )}

      {/* ── Tiempo agotado — webhook no llegó ── */}
      {agotado && (
        <>
          <div style={styles.iconCircle("#FFF8E1")}>⚠️</div>
          <h2 style={{ color: "#795548", marginBottom: "12px" }}>Pago en proceso</h2>
          <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "8px" }}>
            Tu pago fue enviado a Wompi pero la confirmación aún no llegó.
          </p>
          <p style={{ color: "#555", marginBottom: "16px" }}>
            Pedido <strong>#{orderId}</strong>
          </p>
          <div style={{ ...styles.infoBox, marginBottom: "20px" }}>
            <strong>¿Qué hacer?</strong>
            <ul style={{ textAlign: "left", margin: "8px 0 0", paddingLeft: 20, fontSize: "14px", color: "#795548" }}>
              <li>Si Wompi aprobó el pago, el estado se actualizará en unos minutos.</li>
              <li>Ve a "Mis pedidos" y recarga la página en un momento.</li>
              <li>Si el problema persiste, contacta al soporte.</li>
            </ul>
          </div>
          <button onClick={() => navigate(`/mis-pedidos/${orderId}`)} style={styles.btnPrimary}>
            Ver mi pedido
          </button>
          <button onClick={() => navigate("/mis-pedidos")} style={{ ...styles.btnSecondary, marginTop: 10 }}>
            Todos mis pedidos
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  iconCircle: (bg) => ({
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    fontSize: "36px",
  }),
  btnPrimary: {
    padding: "12px 32px",
    backgroundColor: "#6B2D8B",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    display: "block",
    width: "100%",
  },
  btnSecondary: {
    padding: "11px 32px",
    backgroundColor: "transparent",
    color: "#6B2D8B",
    border: "1.5px solid #6B2D8B",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "block",
    width: "100%",
    marginTop: 12,
  },
  infoBox: {
    backgroundColor: "#FFF8E1",
    border: "1px solid #FFD54F",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#795548",
    textAlign: "left",
  },
  progressBar: (intentos, max) => ({
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, #C96EA0 ${(intentos / max) * 100}%, #f0d0e0 ${(intentos / max) * 100}%)`,
    marginBottom: 4,
    transition: "background 0.3s",
  }),
};
