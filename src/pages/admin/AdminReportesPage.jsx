import { useState } from "react";
import {
  descargarVentasExcel,
  descargarVentasPdf,
  descargarProductosExcel,
  descargarProductosPdf,
} from "../../services/reportesService";

export default function AdminReportesPage() {
  // Ventas
  const hoy = new Date().toISOString().slice(0, 10);
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().slice(0, 10);

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [loadingVentas, setLoadingVentas] = useState(null); // "excel" | "pdf" | null
  const [errorVentas, setErrorVentas] = useState("");

  // Productos
  const [topN, setTopN] = useState(10);
  const [loadingProductos, setLoadingProductos] = useState(null);
  const [errorProductos, setErrorProductos] = useState("");

  const handleVentas = async (tipo) => {
    setErrorVentas("");
    setLoadingVentas(tipo);
    try {
      if (tipo === "excel") await descargarVentasExcel(fechaInicio, fechaFin);
      else await descargarVentasPdf(fechaInicio, fechaFin);
    } catch {
      setErrorVentas("Error al generar el reporte. Verifica el período ingresado.");
    } finally {
      setLoadingVentas(null);
    }
  };

  const handleProductos = async (tipo) => {
    setErrorProductos("");
    setLoadingProductos(tipo);
    try {
      if (tipo === "excel") await descargarProductosExcel(topN);
      else await descargarProductosPdf(topN);
    } catch {
      setErrorProductos("Error al generar el reporte.");
    } finally {
      setLoadingProductos(null);
    }
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Reportes</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            Descarga reportes en Excel o PDF
          </p>
        </div>
      </div>

      {/* ── Sección 1: Ventas por período ── */}
      <div className="card" style={styles.seccion}>
        <div style={styles.seccionHeader}>
          <div style={styles.iconWrap}>📊</div>
          <div>
            <h3 style={styles.seccionTitulo}>Ventas por Período</h3>
            <p style={styles.seccionDesc}>
              Detalle diario y resumen global de ventas en el período seleccionado.
            </p>
          </div>
        </div>

        <div style={styles.controles}>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              max={fechaFin}
              onChange={e => setFechaInicio(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              min={fechaInicio}
              max={hoy}
              onChange={e => setFechaFin(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {errorVentas && <p style={styles.error}>{errorVentas}</p>}

        <div style={styles.botones}>
          <button
            style={styles.btnExcel}
            onClick={() => handleVentas("excel")}
            disabled={!!loadingVentas}
          >
            {loadingVentas === "excel" ? "Generando…" : "⬇ Descargar Excel"}
          </button>
          <button
            style={styles.btnPdf}
            onClick={() => handleVentas("pdf")}
            disabled={!!loadingVentas}
          >
            {loadingVentas === "pdf" ? "Generando…" : "⬇ Descargar PDF"}
          </button>
        </div>
      </div>

      {/* ── Sección 2: Productos más vendidos ── */}
      <div className="card" style={styles.seccion}>
        <div style={styles.seccionHeader}>
          <div style={styles.iconWrap}>🏆</div>
          <div>
            <h3 style={styles.seccionTitulo}>Productos Más Vendidos</h3>
            <p style={styles.seccionDesc}>
              Ranking de productos por unidades vendidas e ingresos generados.
            </p>
          </div>
        </div>

        <div style={styles.controles}>
          <div style={styles.campo}>
            <label style={styles.label}>Top N productos</label>
            <input
              type="number"
              min={1}
              max={100}
              value={topN}
              onChange={e => setTopN(Math.max(1, Number(e.target.value)))}
              style={{ ...styles.input, maxWidth: 120 }}
            />
          </div>
        </div>

        {errorProductos && <p style={styles.error}>{errorProductos}</p>}

        <div style={styles.botones}>
          <button
            style={styles.btnExcel}
            onClick={() => handleProductos("excel")}
            disabled={!!loadingProductos}
          >
            {loadingProductos === "excel" ? "Generando…" : "⬇ Descargar Excel"}
          </button>
          <button
            style={styles.btnPdf}
            onClick={() => handleProductos("pdf")}
            disabled={!!loadingProductos}
          >
            {loadingProductos === "pdf" ? "Generando…" : "⬇ Descargar PDF"}
          </button>
        </div>
      </div>
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
  seccion: {
    marginBottom: 20,
    padding: "28px 32px",
  },
  seccionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  iconWrap: {
    fontSize: 32,
    lineHeight: 1,
    flexShrink: 0,
  },
  seccionTitulo: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--pink-dark)",
  },
  seccionDesc: {
    margin: 0,
    fontSize: 13,
    color: "var(--gray)",
  },
  controles: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--gray-dark)",
  },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 14,
    fontFamily: "inherit",
    background: "var(--white)",
  },
  botones: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  btnExcel: {
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    opacity: 1,
    transition: "opacity 0.15s",
  },
  btnPdf: {
    background: "var(--pink-dark)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  error: {
    color: "#C0405A",
    fontSize: 13,
    margin: "0 0 12px",
  },
};
