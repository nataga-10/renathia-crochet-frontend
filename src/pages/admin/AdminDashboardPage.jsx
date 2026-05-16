import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  LineChart, Line, ResponsiveContainer,
  PieChart, Pie, Legend as PieLegend,
} from "recharts";
import {
  getDashboardResumen,
  getVentasPorDia,
  getEstadosPedidos,
  getProductosVendidos,
} from "../../services/dashboardService";

// ─── Constantes de estilo ──────────────────────────────────────────────────
const PINK       = "#C96EA0";
const PINK_LIGHT = "#F9E8F3";
const GREEN      = "#6DBF8B";
const GRAY       = "#9ca3af";

const STATUS_LABELS = {
  PendingPayment:  "Pend. pago",
  PaymentReceived: "Pago recibido",
  InProduction:    "En elaboración",
  QualityControl:  "Ctrl. calidad",
  Shipped:         "Enviado",
  Delivered:       "Entregado",
  ReadyForPickup:  "Listo recoger",
  PickedUp:        "Recogido",
  Cancelled:       "Cancelado",
};

const STATUS_COLORS = [
  "#C96EA0","#6DBF8B","#F59E0B","#3B82F6","#8B5CF6",
  "#06B6D4","#F97316","#10B981","#6B7280",
];

const fmt = (n) => `$${Number(n).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
const fmtFecha = (f) => {
  const [, m, d] = f.split("-");
  return `${d}/${m}`;
};

// ─── Tarjeta de resumen ────────────────────────────────────────────────────
function Card({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color ?? PINK}` }}>
      <div style={s.cardIcon}>{icon}</div>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValue, color: color ?? PINK }}>{value}</div>
      {sub && <div style={s.cardSub}>{sub}</div>}
    </div>
  );
}

// ─── Sección con título ────────────────────────────────────────────────────
function Seccion({ titulo, children }) {
  return (
    <div style={s.seccion}>
      <h3 style={s.seccionTitulo}>{titulo}</h3>
      {children}
    </div>
  );
}

// ─── Tooltip personalizado ─────────────────────────────────────────────────
function TooltipVentas({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, color: PINK }}>{fmt(payload[0]?.value)}</p>
      {payload[1] && <p style={{ margin: 0, color: GRAY, fontSize: 12 }}>{payload[1]?.value} pedidos</p>}
    </div>
  );
}

function TooltipProductos({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{payload[0]?.payload?.Producto}</p>
      <p style={{ margin: 0 }}>{payload[0]?.value} unidades</p>
    </div>
  );
}

function LabelPie({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [resumen,    setResumen]    = useState(null);
  const [ventas,     setVentas]     = useState([]);
  const [estados,    setEstados]    = useState([]);
  const [productos,  setProductos]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => {
    Promise.all([
      getDashboardResumen(),
      getVentasPorDia(),
      getEstadosPedidos(),
      getProductosVendidos(),
    ])
      .then(([r, v, e, p]) => {
        setResumen(r);
        setVentas(v.map(d => ({ ...d, fechaLabel: fmtFecha(d.fecha) })));
        setEstados(e.map(d => ({ ...d, name: STATUS_LABELS[d.status] ?? d.status })));
        setProductos(p);
      })
      .catch(() => setError("Error al cargar el dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p style={{ color: GRAY }}>Cargando dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="form-message error">{error}</div>
    </div>
  );

  // Separar top 5 y bottom 3 para el bar chart
  const top5      = productos.slice(0, 5);
  const bottom3   = [...productos].slice(-3).reverse();
  const barData   = [
    ...top5.map(p => ({ ...p, tipo: "top" })),
    ...bottom3.map(p => ({ ...p, tipo: "bottom" })),
  ];

  return (
    <div className="page">
      <div style={s.header}>
        <div>
          <h2 style={{ margin: 0, color: PINK }}>Dashboard</h2>
          <p style={{ color: GRAY, fontSize: 14, margin: "4px 0 0" }}>
            Resumen operativo — {new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Tarjetas de resumen ── */}
      <div style={s.cards}>
        <Card
          icon="💰"
          label="Ingresos del mes"
          value={fmt(resumen?.totalIngresosMes ?? 0)}
          color={PINK}
        />
        <Card
          icon="📦"
          label="Pedidos del mes"
          value={resumen?.totalPedidosMes ?? 0}
          color="#3B82F6"
        />
        <Card
          icon="🏆"
          label="Producto más vendido"
          value={resumen?.productoMasVendido ?? "—"}
          color="#8B5CF6"
        />
        <Card
          icon="⏳"
          label="Pendientes de pago"
          value={resumen?.pedidosPendientesPago ?? 0}
          sub="pedidos sin confirmar"
          color="#F59E0B"
        />
      </div>

      {/* ── Gráficas ── */}
      <div style={s.graficas}>

        {/* Bar chart — productos */}
        <Seccion titulo="Top 5 más vendidos · Bottom 3 menos vendidos">
          {barData.length === 0
            ? <p style={{ color: GRAY, textAlign: "center", padding: 24 }}>Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="producto"
                    width={130}
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => v.length > 18 ? v.slice(0, 18) + "…" : v}
                  />
                  <Tooltip content={<TooltipProductos />} />
                  <Bar dataKey="totalUnidades" name="Unidades" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.tipo === "top" ? PINK : GRAY} />
                    ))}
                  </Bar>
                  <Legend
                    payload={[
                      { value: "Top 5 más vendidos", type: "square", color: PINK },
                      { value: "Bottom 3 menos vendidos", type: "square", color: GRAY },
                    ]}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Seccion>

        {/* Line chart — ventas por día */}
        <Seccion titulo="Ingresos diarios — últimos 30 días">
          {ventas.length === 0
            ? <p style={{ color: GRAY, textAlign: "center", padding: 24 }}>Sin ventas en los últimos 30 días</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={ventas} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fechaLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<TooltipVentas />} />
                  <Line
                    type="monotone"
                    dataKey="totalIngresos"
                    name="Ingresos"
                    stroke={PINK}
                    strokeWidth={2.5}
                    dot={{ fill: PINK, r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
        </Seccion>

        {/* Pie chart — estados de pedidos */}
        <Seccion titulo="Distribución de estados de pedidos">
          {estados.length === 0
            ? <p style={{ color: GRAY, textAlign: "center", padding: 24 }}>Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estados}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={LabelPie}
                  >
                    {estados.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + " pedidos", n]} />
                  <PieLegend
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
        </Seccion>

      </div>
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────
const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: "var(--white)",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(201,110,160,0.10)",
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  cardIcon:  { fontSize: 26, marginBottom: 4 },
  cardLabel: { fontSize: 12, color: GRAY, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" },
  cardValue: { fontSize: 22, fontWeight: 800, lineHeight: 1.2, wordBreak: "break-word" },
  cardSub:   { fontSize: 11, color: GRAY },
  graficas: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  seccion: {
    background: "var(--white)",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(201,110,160,0.08)",
    padding: "22px 24px",
  },
  seccionTitulo: {
    margin: "0 0 16px",
    fontSize: 15,
    fontWeight: 700,
    color: PINK,
  },
  tooltip: {
    background: "var(--white)",
    border: `1.5px solid ${PINK_LIGHT}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
  },
};
