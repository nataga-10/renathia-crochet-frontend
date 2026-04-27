import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const PRECIOS_EXTRA = {
  mosqueton: 1500,
  llavero:   1000,
  asa:       3000,
  letras:    5000,
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarAlCarrito, loading } = useCart();

  const [product, setProduct] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [selectedColors, setSelectedColors] = useState({});

  // Extras solo para amigurumis (categoryId === 1)
  const [conMosqueton, setConMosqueton] = useState(false);
  const [conLlavero, setConLlavero] = useState(false);
  const [extra, setExtra] = useState("ninguno");
  const [mensajeLetras, setMensajeLetras] = useState("");

  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setCargando(false);
      }
    };
    load();
  }, [id]);

  if (cargando) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 60 }}>
      <p style={{ color: "var(--gray)" }}>Cargando producto...</p>
    </div>
  );

  if (!product) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 60 }}>
      <p style={{ color: "var(--gray)" }}>Producto no encontrado.</p>
      <button className="btn-outline" onClick={() => navigate("/catalogo")} style={{ marginTop: 16 }}>
        Volver al catálogo
      </button>
    </div>
  );

  const tienePartes = product.parts && product.parts.length > 0;
  const esAmigurumi = product.categoryId === 1;

  const extrasPrice =
    (conMosqueton ? PRECIOS_EXTRA.mosqueton : 0) +
    (conLlavero   ? PRECIOS_EXTRA.llavero   : 0) +
    (extra === "asa"    ? PRECIOS_EXTRA.asa    : 0) +
    (extra === "letras" ? PRECIOS_EXTRA.letras : 0);

  const totalPrice = product.basePrice + extrasPrice;

  const buildNotes = () => {
    const partes = [product.name];
    Object.entries(selectedColors).forEach(([partName, color]) => {
      partes.push(`${partName}: ${color.colorName}`);
    });
    if (conMosqueton) partes.push("Mosquetón");
    if (conLlavero)   partes.push("Llavero");
    if (extra === "asa")    partes.push("Asa de cuentas");
    if (extra === "letras") partes.push(`Letras: "${mensajeLetras}"`);
    return partes.length > 1 ? partes.join(" + ") : null;
  };

  const handleAgregar = () => {
    if (!user) { navigate("/login"); return; }
    if (user.roleId !== 2) return;

    if (tienePartes) {
      const partesSinColor = product.parts.filter(p => !selectedColors[p.partName]);
      if (partesSinColor.length > 0) {
        alert(`Elige el color para: ${partesSinColor.map(p => p.partName).join(", ")}`);
        return;
      }
      if (extra === "letras" && !mensajeLetras.trim()) {
        alert("Escribe el mensaje para las letras");
        return;
      }
    }

    const customPrice = extrasPrice > 0 ? totalPrice : null;
    const notes = buildNotes();
    agregarAlCarrito(product.productId, 1, null, customPrice, notes);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  return (
    <div className="page">
      <button className="btn-outline" onClick={() => navigate("/catalogo")} style={{ marginBottom: 20 }}>
        ← Volver al catálogo
      </button>

      <div style={styles.layout}>
        {/* Imagen */}
        <div style={styles.imageCol}>
          {product.primaryImageUrl ? (
            <img src={product.primaryImageUrl} alt={product.name} style={styles.img} />
          ) : (
            <div style={styles.imgPlaceholder}>🧶</div>
          )}
          {product.isMadeToOrder && (
            <div style={styles.badgePedido}>Elaborado bajo pedido</div>
          )}
        </div>

        {/* Info + personalización */}
        <div style={styles.infoCol}>
          {product.categoryName && (
            <span style={styles.categoryBadge}>{product.categoryName}</span>
          )}
          <h1 style={styles.title}>{product.name}</h1>
          {product.description && (
            <p style={styles.description}>{product.description}</p>
          )}

          {/* Precio */}
          {user ? (
            <div style={styles.priceBlock}>
              <span style={styles.price}>${totalPrice.toLocaleString()}</span>
              {extrasPrice > 0 && (
                <span style={styles.priceBase}>Base: ${product.basePrice.toLocaleString()}</span>
              )}
            </div>
          ) : (
            <p style={styles.priceHidden}>Inicia sesión para ver el precio</p>
          )}

          {/* Selector de colores por parte */}
          {tienePartes && (
            <div style={styles.section}>
              <p style={styles.sectionTitle}>Elige el color de cada parte</p>
              {product.parts.map(part => (
                <div key={part.partName} style={{ marginBottom: 16 }}>
                  <p style={styles.partLabel}>{part.partName}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {part.colors.map(color => {
                      const selected = selectedColors[part.partName]?.colorName === color.colorName;
                      return (
                        <div
                          key={color.productColorId}
                          onClick={() => setSelectedColors(prev => ({ ...prev, [part.partName]: color }))}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
                        >
                          <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: color.colorHex || "#ccc",
                            border: selected ? "3px solid var(--pink-dark)" : "2px solid rgba(0,0,0,0.12)",
                            boxShadow: selected ? "0 0 0 3px var(--pink-light)" : "none",
                            transition: "all 0.15s",
                          }} />
                          <span style={{ fontSize: 10, color: "var(--gray)", maxWidth: 52, textAlign: "center", lineHeight: 1.2 }}>
                            {color.colorName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {!selectedColors[part.partName] && (
                    <p style={{ fontSize: 11, color: "var(--pink-dark)", margin: "4px 0 0", fontStyle: "italic" }}>
                      Selecciona un color
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Extras solo para amigurumis */}
          {esAmigurumi && (
            <div style={styles.section}>
              <p style={styles.sectionTitle}>Extras opcionales</p>

              {[
                { key: "mosqueton", label: "Mosquetón", desc: "Añade un mosquetón al llavero", price: PRECIOS_EXTRA.mosqueton, val: conMosqueton, set: setConMosqueton },
                { key: "llavero",   label: "Llavero",   desc: "Añade un llavero al amigurumi", price: PRECIOS_EXTRA.llavero,   val: conLlavero,   set: setConLlavero   },
              ].map(opt => (
                <div
                  key={opt.key}
                  onClick={() => opt.set(!opt.val)}
                  style={{ ...styles.extraRow, background: opt.val ? "var(--pink-light)" : "var(--white)", borderColor: opt.val ? "var(--pink)" : "var(--border)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ ...styles.checkbox, background: opt.val ? "var(--pink)" : "var(--white)" }}>
                      {opt.val && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
                    </div>
                    <div>
                      <p style={styles.extraLabel}>{opt.label}</p>
                      <p style={styles.extraDesc}>{opt.desc}</p>
                    </div>
                  </div>
                  <span style={styles.extraPrice}>+${opt.price.toLocaleString()}</span>
                </div>
              ))}

              {/* Asa de cuentas */}
              <div
                onClick={() => setExtra(extra === "asa" ? "ninguno" : "asa")}
                style={{ ...styles.extraRow, background: extra === "asa" ? "var(--green-light)" : "var(--white)", borderColor: extra === "asa" ? "var(--green)" : "var(--border)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ ...styles.radio, borderColor: extra === "asa" ? "var(--green)" : "var(--border)", background: extra === "asa" ? "var(--green)" : "var(--white)" }}>
                    {extra === "asa" && <div style={styles.radioDot} />}
                  </div>
                  <div>
                    <p style={styles.extraLabel}>Asa de cuentas</p>
                    <p style={styles.extraDesc}>Asa decorativa hecha con cuentas</p>
                  </div>
                </div>
                <span style={styles.extraPrice}>+${PRECIOS_EXTRA.asa.toLocaleString()}</span>
              </div>

              {/* Letras personalizadas */}
              <div
                onClick={() => setExtra(extra === "letras" ? "ninguno" : "letras")}
                style={{ ...styles.extraRow, background: extra === "letras" ? "var(--green-light)" : "var(--white)", borderColor: extra === "letras" ? "var(--green)" : "var(--border)", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ ...styles.radio, borderColor: extra === "letras" ? "var(--green)" : "var(--border)", background: extra === "letras" ? "var(--green)" : "var(--white)" }}>
                      {extra === "letras" && <div style={styles.radioDot} />}
                    </div>
                    <div>
                      <p style={styles.extraLabel}>Letras personalizadas ✨</p>
                      <p style={styles.extraDesc}>Cuentas con mensaje (ej: "Shine")</p>
                    </div>
                  </div>
                  <span style={styles.extraPrice}>+${PRECIOS_EXTRA.letras.toLocaleString()}</span>
                </div>
                {extra === "letras" && (
                  <input
                    placeholder="Escribe tu mensaje (ej: Shine, Love, Ana...)"
                    value={mensajeLetras}
                    onChange={e => { e.stopPropagation(); setMensajeLetras(e.target.value); }}
                    onClick={e => e.stopPropagation()}
                    style={{ marginLeft: 36 }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Botón agregar */}
          {user?.roleId === 2 && (
            <button
              className="btn-primary"
              onClick={handleAgregar}
              disabled={loading}
              style={{ width: "100%", marginTop: 8, fontSize: 16, padding: "12px 0" }}
            >
              {agregado ? "¡Agregado al carrito! ✓" : "Agregar al carrito"}
            </button>
          )}
          {!user && (
            <button className="btn-outline" onClick={() => navigate("/login")} style={{ width: "100%", marginTop: 8 }}>
              Inicia sesión para comprar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex", gap: 40, alignItems: "flex-start",
    flexWrap: "wrap",
  },
  imageCol: {
    flex: "0 0 340px", maxWidth: 340,
  },
  img: {
    width: "100%", borderRadius: 16,
    objectFit: "cover", aspectRatio: "1",
    boxShadow: "var(--shadow)",
  },
  imgPlaceholder: {
    width: "100%", aspectRatio: "1",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--pink-light)", borderRadius: 16,
    fontSize: 80,
  },
  badgePedido: {
    marginTop: 10, textAlign: "center",
    background: "var(--green)", color: "white",
    borderRadius: 20, padding: "5px 14px",
    fontSize: 13, fontWeight: 600,
  },
  infoCol: {
    flex: 1, minWidth: 280,
  },
  categoryBadge: {
    display: "inline-block",
    background: "var(--green-light)", color: "var(--green-dark)",
    fontSize: 12, padding: "3px 12px", borderRadius: 20,
    fontWeight: 500, marginBottom: 10,
  },
  title: {
    margin: "0 0 10px", fontSize: 28, fontWeight: 700,
    color: "var(--gray-dark)",
  },
  description: {
    color: "var(--gray)", fontSize: 15, lineHeight: 1.6,
    margin: "0 0 16px",
  },
  priceBlock: {
    display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20,
  },
  price: {
    fontSize: 32, fontWeight: 700, color: "var(--pink-dark)",
  },
  priceBase: {
    fontSize: 13, color: "var(--gray)",
  },
  priceHidden: {
    fontSize: 13, color: "var(--gray)", fontStyle: "italic", marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    margin: "0 0 12px", fontSize: 14, fontWeight: 700,
    color: "var(--gray-dark)", textTransform: "uppercase", letterSpacing: "0.4px",
  },
  partLabel: {
    margin: "0 0 8px", fontWeight: 600, fontSize: 14, color: "var(--gray-dark)",
  },
  extraRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 14px", borderRadius: 10, marginBottom: 8,
    border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
  },
  extraLabel: {
    margin: 0, fontWeight: 600, fontSize: 14, color: "var(--gray-dark)",
  },
  extraDesc: {
    margin: 0, fontSize: 12, color: "var(--gray)", marginTop: 2,
  },
  extraPrice: {
    fontWeight: 700, color: "var(--pink-dark)", fontSize: 14,
    flexShrink: 0, marginLeft: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    border: "2px solid var(--pink)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s",
  },
  radio: {
    width: 20, height: 20, borderRadius: "50%",
    border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s",
  },
  radioDot: {
    width: 8, height: 8, borderRadius: "50%", background: "white",
  },
};
