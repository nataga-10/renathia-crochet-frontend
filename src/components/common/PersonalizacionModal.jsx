import { useState } from "react";

// Precios de cada componente
const PRECIOS = {
  base: 1000,
  mosqueton: 1500,
  llavero: 1000,
  asaCuentas: 3000,
  letras: 5000,
};

export default function PersonalizacionModal({ product, onConfirm, onClose }) {
  const [conMosqueton, setConMosqueton] = useState(false);
  const [conLlavero, setConLlavero] = useState(false);
  const [extra, setExtra] = useState("ninguno"); // "ninguno" | "asa" | "letras"
  // selectedColors: { [partName]: { colorName, colorHex } }
  const [selectedColors, setSelectedColors] = useState({});

  const parts = product.parts || [];
  const [mensajeLetras, setMensajeLetras] = useState("");

  // El precio base viene del producto, los add-ons son fijos
  const total =
    product.basePrice +
    (conMosqueton ? PRECIOS.mosqueton : 0) +
    (conLlavero ? PRECIOS.llavero : 0) +
    (extra === "asa" ? PRECIOS.asaCuentas : 0) +
    (extra === "letras" ? PRECIOS.letras : 0);

  const buildNotes = () => {
    const parts = [product.name];
    if (conMosqueton) parts.push("Mosquetón");
    if (conLlavero) parts.push("Llavero");
    Object.entries(selectedColors).forEach(([partName, color]) => {
      parts.push(`${partName}: ${color.colorName}`);
    });
    if (extra === "asa") parts.push("Asa de cuentas");
    if (extra === "letras") parts.push(`Letras: "${mensajeLetras}"`);
    return parts.join(" + ");
  };

  const handleConfirm = () => {
    if (extra === "letras" && !mensajeLetras.trim()) {
      alert("Escribe el mensaje para las letras");
      return;
    }
    const partesSinColor = parts.filter(p => !selectedColors[p.partName]);
    if (partesSinColor.length > 0) {
      alert(`Elige el color para: ${partesSinColor.map(p => p.partName).join(", ")}`);
      return;
    }
    onConfirm(total, buildNotes());
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, color: "var(--pink-dark)" }}>Personaliza: {product.name}</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Base */}
          <div style={styles.optionRow}>
            <div>
              <p style={styles.optLabel}>{product.name}</p>
              <p style={styles.optDesc}>Precio base — incluido siempre</p>
            </div>
            <span style={styles.price}>${product.basePrice.toLocaleString()}</span>
          </div>

          {/* Mosquetón */}
          <div style={{ ...styles.optionRow, ...styles.optionSelectable, background: conMosqueton ? "var(--pink-light)" : "var(--white)", borderColor: conMosqueton ? "var(--pink)" : "var(--border)" }}
            onClick={() => setConMosqueton(!conMosqueton)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...styles.checkbox, background: conMosqueton ? "var(--pink)" : "var(--white)" }}>
                {conMosqueton && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
              </div>
              <div>
                <p style={styles.optLabel}>Mosquetón</p>
                <p style={styles.optDesc}>Añade un mosquetón al llavero</p>
              </div>
            </div>
            <span style={styles.price}>+${PRECIOS.mosqueton.toLocaleString()}</span>
          </div>

          {/* Llavero */}
          <div style={{ ...styles.optionRow, ...styles.optionSelectable, background: conLlavero ? "var(--pink-light)" : "var(--white)", borderColor: conLlavero ? "var(--pink)" : "var(--border)" }}
            onClick={() => setConLlavero(!conLlavero)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...styles.checkbox, background: conLlavero ? "var(--pink)" : "var(--white)" }}>
                {conLlavero && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
              </div>
              <div>
                <p style={styles.optLabel}>Llavero</p>
                <p style={styles.optDesc}>Añade un llavero al amigurumi</p>
              </div>
            </div>
            <span style={styles.price}>+${PRECIOS.llavero.toLocaleString()}</span>
          </div>

          {/* Partes personalizables — colores por parte */}
          {parts.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: "var(--gray)", margin: "16px 0 8px", fontWeight: 500 }}>
                Elige el color de cada parte:
              </p>
              {parts.map(part => (
                <div key={part.partName} style={{ marginBottom: 12 }}>
                  <p style={{ ...styles.optLabel, marginBottom: 8 }}>{part.partName}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {part.colors.map(color => {
                      const isSelected = selectedColors[part.partName]?.colorName === color.colorName;
                      return (
                        <div
                          key={color.productColorId}
                          title={color.colorName}
                          onClick={() => setSelectedColors(prev => ({ ...prev, [part.partName]: color }))}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            gap: 4, cursor: "pointer",
                          }}
                        >
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: color.colorHex || "#ccc",
                            border: isSelected ? "3px solid var(--pink-dark)" : "2px solid rgba(0,0,0,0.12)",
                            boxShadow: isSelected ? "0 0 0 2px var(--pink-light)" : "none",
                            transition: "all 0.15s",
                          }} />
                          <span style={{ fontSize: 10, color: "var(--gray)", maxWidth: 50, textAlign: "center", lineHeight: 1.2 }}>
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
            </>
          )}

          {/* Opciones exclusivas */}
          <p style={{ fontSize: 13, color: "var(--gray)", margin: "16px 0 8px", fontWeight: 500 }}>
            Elige una opción (o ninguna):
          </p>

          {/* Asa de cuentas */}
          <div style={{ ...styles.optionRow, ...styles.optionSelectable, background: extra === "asa" ? "var(--green-light)" : "var(--white)", borderColor: extra === "asa" ? "var(--green)" : "var(--border)" }}
            onClick={() => setExtra(extra === "asa" ? "ninguno" : "asa")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...styles.radio, background: extra === "asa" ? "var(--green)" : "var(--white)", borderColor: extra === "asa" ? "var(--green)" : "var(--border)" }}>
                {extra === "asa" && <div style={styles.radioDot} />}
              </div>
              <div>
                <p style={styles.optLabel}>Asa de cuentas</p>
                <p style={styles.optDesc}>Asa decorativa hecha con cuentas</p>
              </div>
            </div>
            <span style={styles.price}>+${PRECIOS.asaCuentas.toLocaleString()}</span>
          </div>

          {/* Letras personalizadas */}
          <div style={{ ...styles.optionRow, ...styles.optionSelectable, background: extra === "letras" ? "var(--green-light)" : "var(--white)", borderColor: extra === "letras" ? "var(--green)" : "var(--border)", flexDirection: "column", gap: 10 }}
            onClick={() => setExtra(extra === "letras" ? "ninguno" : "letras")}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ ...styles.radio, background: extra === "letras" ? "var(--green)" : "var(--white)", borderColor: extra === "letras" ? "var(--green)" : "var(--border)" }}>
                  {extra === "letras" && <div style={styles.radioDot} />}
                </div>
                <div>
                  <p style={styles.optLabel}>Letras personalizadas ✨</p>
                  <p style={styles.optDesc}>Cuentas con mensaje (ej: "Shine")</p>
                </div>
              </div>
              <span style={styles.price}>+${PRECIOS.letras.toLocaleString()}</span>
            </div>
            {extra === "letras" && (
              <input
                placeholder="Escribe tu mensaje (ej: Shine, Love, Ana...)"
                value={mensajeLetras}
                onChange={(e) => { e.stopPropagation(); setMensajeLetras(e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={{ marginLeft: 36 }}
              />
            )}
          </div>
        </div>

        {/* Total y botón */}
        <div style={styles.footer}>
          <div style={styles.totalRow}>
            <span style={{ fontSize: 15, color: "var(--gray)" }}>Total personalización:</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "var(--pink-dark)" }}>
              ${total.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleConfirm}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 300,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "var(--white)",
    borderRadius: 16,
    width: "100%", maxWidth: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column",
    maxHeight: "90vh", overflow: "hidden",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 20px",
    background: "var(--pink-light)",
    borderBottom: "1.5px solid var(--border)",
  },
  closeBtn: {
    background: "none", border: "none",
    fontSize: 18, cursor: "pointer", color: "var(--gray)",
  },
  body: {
    padding: "16px 20px",
    overflowY: "auto", flex: 1,
  },
  optionRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 14px",
    borderRadius: 10, marginBottom: 8,
    border: "1.5px solid var(--border)",
  },
  optionSelectable: {
    cursor: "pointer",
    transition: "all 0.15s",
  },
  optLabel: {
    margin: 0, fontWeight: 600, fontSize: 14,
    color: "var(--gray-dark)",
  },
  optDesc: {
    margin: 0, fontSize: 12, color: "var(--gray)", marginTop: 2,
  },
  price: {
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
    width: 8, height: 8, borderRadius: "50%",
    background: "white",
  },
  footer: {
    padding: "16px 20px",
    borderTop: "1.5px solid var(--border)",
    background: "var(--pink-light)",
  },
  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
};
