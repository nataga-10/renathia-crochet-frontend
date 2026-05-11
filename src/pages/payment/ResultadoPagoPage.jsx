import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * ResultadoPagoPage
 *
 * Pagina a la que Wompi redirige al cliente despues de intentar el pago.
 * Wompi agrega parametros en la URL:
 *   - id          : ID de la transaccion en Wompi
 *   - orderId     : nuestro OrderId (lo agregamos nosotros en el redirect URL)
 *
 * IMPORTANTE sobre el estado del pedido:
 *   Esta pagina solo muestra un mensaje al cliente.
 *   La actualizacion real del estado del pedido (PendingPayment -> PaymentReceived)
 *   la hace el WEBHOOK (POST /api/Payments/wompi-webhook), no esta pagina.
 *   Por eso puede haber un ligero retraso entre el pago y la actualizacion visible.
 *
 * Puede darse el caso de que:
 *   - El pago fue exitoso pero el webhook aun no llego -> el pedido sigue en PendingPayment momentaneamente.
 *   - El pago fue rechazado -> el pedido queda en PendingPayment, el cliente puede reintentar.
 */
export default function ResultadoPagoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [segundos, setSegundos] = useState(8);

  const orderId = searchParams.get("orderId");
  // Wompi puede incluir mas params como ?id=TRX_ID&type=PAYMENT, pero solo usamos orderId
  const transaccionId = searchParams.get("id");

  // Cuenta regresiva y redireccion automatica al detalle del pedido
  useEffect(() => {
    if (!orderId) {
      navigate("/mis-pedidos", { replace: true });
      return;
    }

    const intervalo = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          clearInterval(intervalo);
          navigate(`/mis-pedidos/${orderId}`, { replace: true });
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [orderId, navigate]);

  return (
    <div style={{
      maxWidth: "550px",
      margin: "60px auto",
      padding: "40px 30px",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>
      {/* Icono de exito */}
      <div style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        backgroundColor: "#E8F5EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
        fontSize: "36px"
      }}>
        ✓
      </div>

      <h2 style={{ color: "#1A7A4A", marginBottom: "12px" }}>
        Pago procesado
      </h2>

      <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "8px" }}>
        Tu pago fue enviado a Wompi para su procesamiento.
        En unos momentos tu pedido sera actualizado.
      </p>

      {orderId && (
        <p style={{ color: "#555", marginBottom: "24px" }}>
          Pedido <strong>#{orderId}</strong>
        </p>
      )}

      {/* Nota sobre el webhook */}
      <div style={{
        backgroundColor: "#FFF8E1",
        border: "1px solid #FFD54F",
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "28px",
        fontSize: "14px",
        color: "#795548",
        textAlign: "left"
      }}>
        <strong>Nota:</strong> Si el estado del pedido aun aparece como "Pendiente de pago",
        espera unos segundos y recarga la pagina. La confirmacion llega a traves de Wompi.
      </div>

      {/* Boton ir al pedido */}
      <button
        onClick={() => navigate(orderId ? `/mis-pedidos/${orderId}` : "/mis-pedidos")}
        style={{
          padding: "12px 32px",
          backgroundColor: "#6B2D8B",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
          marginBottom: "16px",
          display: "block",
          width: "100%"
        }}>
        Ver mi pedido
      </button>

      {/* Cuenta regresiva */}
      <p style={{ color: "#aaa", fontSize: "13px" }}>
        Redirigiendo automaticamente en {segundos} segundos...
      </p>
    </div>
  );
}
