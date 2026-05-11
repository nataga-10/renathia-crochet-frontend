import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * PagoWompiPage
 *
 * Muestra el boton de pago de Wompi para que el cliente complete su compra.
 *
 * Flujo:
 *   1. CartPage llama al backend (POST /api/Cart/checkout) y recibe los datos de Wompi.
 *   2. Navega a esta pagina pasando esos datos en el estado del router.
 *   3. Esta pagina inyecta el script del widget de Wompi con los datos correctos.
 *   4. El widget renderiza un boton "Pagar con Wompi".
 *   5. Al hacer clic, se abre el modal de pago de Wompi.
 *   6. Despues de pagar, Wompi redirige a /resultado-pago con el ID de la transaccion.
 *
 * Nota sobre el hash de integridad:
 *   El hash se calcula en el BACKEND (WompiService.ComputeIntegrityHash) para no
 *   exponer la llave de integridad en el codigo del frontend.
 */
export default function PagoWompiPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Los datos de Wompi vienen de CartPage via navigate state.
  // Si location.state es null (ej: ProtectedRoute hizo un redirect intermedio),
  // los recuperamos de sessionStorage como respaldo.
  const wompiData = state?.wompiData ?? (() => {
    try {
      const stored = sessionStorage.getItem("wompiCheckout");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    // Si no hay datos (el usuario entro directo a la URL), redirigir al carrito
    if (!wompiData) {
      navigate("/carrito", { replace: true });
      return;
    }

    // Limpiar sessionStorage ahora que ya tenemos los datos en memoria
    sessionStorage.removeItem("wompiCheckout");

    const container = containerRef.current;
    if (!container) return;

    // URL a la que Wompi redirige despues del pago (exitoso o fallido)
    // Incluimos el orderId en la query para mostrar el pedido correcto en la pagina de resultado
    const redirectUrl = `${window.location.origin}/resultado-pago?orderId=${wompiData.orderId}`;

    /**
     * El widget de Wompi funciona como un script tag con atributos data-*.
     * Al cargarse, el script reemplaza su propio elemento por un boton estilizado.
     *
     * Atributos obligatorios:
     *   data-render          = "button"  -> renderiza el boton automaticamente
     *   data-public-key      = llave publica de Wompi (pub_stagtest_...)
     *   data-currency        = "COP"
     *   data-amount-in-cents = monto en centavos (ej: $50.000 COP = 5000000 centavos)
     *   data-reference       = identificador unico del pago (usamos el OrderId)
     *   data-signature:integrity = SHA256(reference + amount + currency + integrity_key)
     *
     * Atributos opcionales:
     *   data-redirect-url    = URL de retorno despues del pago
     */
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.io/widget.js";
    script.setAttribute("data-render", "button");
    script.setAttribute("data-public-key", wompiData.publicKey);
    script.setAttribute("data-currency", wompiData.currency);
    script.setAttribute("data-amount-in-cents", String(wompiData.amountInCents));
    script.setAttribute("data-reference", wompiData.reference);
    script.setAttribute("data-signature:integrity", wompiData.integrityHash);
    script.setAttribute("data-redirect-url", redirectUrl);

    // Limpiar contenido previo por si el componente se re-monta
    container.innerHTML = "";
    container.appendChild(script);

    // Cleanup: remover el script si el componente se desmonta
    return () => {
      if (container) container.innerHTML = "";
    };
  }, [wompiData, navigate]);

  if (!wompiData) return null;

  const totalFormateado = wompiData.total?.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  return (
    <div style={{ maxWidth: "550px", margin: "50px auto", padding: "30px", fontFamily: "sans-serif" }}>
      {/* Encabezado */}
      <h2 style={{ color: "#6B2D8B", marginBottom: "8px" }}>Completar pago</h2>
      <p style={{ color: "#555", marginBottom: "30px" }}>
        Revisa el resumen de tu pedido y haz clic en el boton para pagar de forma segura con Wompi.
      </p>

      {/* Resumen del pedido */}
      <div style={{
        backgroundColor: "#f9f4ff",
        border: "1px solid #d9c3f0",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "30px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "#555" }}>Numero de pedido</span>
          <span style={{ fontWeight: "bold" }}>#{wompiData.orderId}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #d9c3f0", paddingTop: "10px", marginTop: "8px" }}>
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>Total a pagar</span>
          <span style={{ fontWeight: "bold", fontSize: "18px", color: "#6B2D8B" }}>
            {totalFormateado}
          </span>
        </div>
      </div>

      {/* Contenedor donde el widget de Wompi inyecta el boton de pago */}
      <div
        ref={containerRef}
        id="wompi-button-container"
        style={{ display: "flex", justifyContent: "center", minHeight: "50px" }}
      />

      {/* Informacion de seguridad */}
      <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginTop: "20px" }}>
        Pago seguro procesado por Wompi. Tu informacion financiera esta protegida.
      </p>

      {/* Enlace de vuelta al carrito */}
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button
          onClick={() => navigate("/carrito")}
          style={{
            background: "none",
            border: "none",
            color: "#6B2D8B",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px"
          }}>
          Volver al carrito
        </button>
      </div>
    </div>
  );
}
