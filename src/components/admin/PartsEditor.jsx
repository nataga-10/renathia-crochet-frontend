import { useState } from "react";

/**
 * Editor de partes personalizables de un producto.
 * Props:
 *   parts: [{ partName, colors: [{ colorName, colorHex }] }]
 *   onChange: (newParts) => void
 */
export default function PartsEditor({ parts, onChange }) {
  const [newPartName, setNewPartName] = useState("");
  const [colorInputs, setColorInputs] = useState({}); // { partIndex: { colorName, colorHex } }

  const addPart = () => {
    const name = newPartName.trim();
    if (!name) return;
    if (parts.some(p => p.partName.toLowerCase() === name.toLowerCase())) return;
    onChange([...parts, { partName: name, colors: [] }]);
    setNewPartName("");
  };

  const removePart = (index) => {
    onChange(parts.filter((_, i) => i !== index));
  };

  const getColorInput = (index) =>
    colorInputs[index] || { colorName: "", colorHex: "#f9a8c9" };

  const setColorInput = (index, field, value) => {
    setColorInputs(prev => ({
      ...prev,
      [index]: { ...getColorInput(index), [field]: value }
    }));
  };

  const addColor = (partIndex) => {
    const input = getColorInput(partIndex);
    const name = input.colorName.trim();
    if (!name) return;
    const updated = parts.map((p, i) => {
      if (i !== partIndex) return p;
      return { ...p, colors: [...p.colors, { colorName: name, colorHex: input.colorHex }] };
    });
    onChange(updated);
    setColorInputs(prev => ({ ...prev, [partIndex]: { colorName: "", colorHex: "#f9a8c9" } }));
  };

  const removeColor = (partIndex, colorIndex) => {
    const updated = parts.map((p, i) => {
      if (i !== partIndex) return p;
      return { ...p, colors: p.colors.filter((_, ci) => ci !== colorIndex) };
    });
    onChange(updated);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.titleRow}>
        <span style={styles.title}>Partes personalizables</span>
        <span style={styles.subtitle}>Define qué partes puede personalizar el cliente y qué colores hay disponibles</span>
      </div>

      {/* Agregar parte nueva */}
      <div style={styles.addPartRow}>
        <input
          value={newPartName}
          onChange={e => setNewPartName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPart())}
          placeholder="Nombre de la parte (ej: Caparazón, Cuerpo, Orejas...)"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addPart} className="btn-primary" style={{ flexShrink: 0 }}>
          + Agregar parte
        </button>
      </div>

      {parts.length === 0 && (
        <p style={styles.empty}>Sin partes definidas. El producto no tendrá personalización de colores.</p>
      )}

      {/* Lista de partes */}
      {parts.map((part, partIndex) => (
        <div key={partIndex} style={styles.partCard}>
          <div style={styles.partHeader}>
            <span style={styles.partName}>{part.partName}</span>
            <button
              type="button"
              onClick={() => removePart(partIndex)}
              style={styles.removePartBtn}
              title="Eliminar parte"
            >
              ✕
            </button>
          </div>

          {/* Swatches de colores actuales */}
          <div style={styles.swatchRow}>
            {part.colors.map((color, colorIndex) => (
              <div key={colorIndex} style={styles.swatchWrap} title={color.colorName}>
                <div style={{ ...styles.swatch, background: color.colorHex || "#ccc" }} />
                <span style={styles.swatchName}>{color.colorName}</span>
                <button
                  type="button"
                  onClick={() => removeColor(partIndex, colorIndex)}
                  style={styles.removeColorBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Agregar color */}
          <div style={styles.addColorRow}>
            <input
              type="color"
              value={getColorInput(partIndex).colorHex}
              onChange={e => setColorInput(partIndex, "colorHex", e.target.value)}
              style={styles.colorPicker}
              title="Elige el color"
            />
            <input
              value={getColorInput(partIndex).colorName}
              onChange={e => setColorInput(partIndex, "colorName", e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addColor(partIndex))}
              placeholder="Nombre del color (ej: Verde menta)"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => addColor(partIndex)}
              className="btn-outline"
              style={{ flexShrink: 0, fontSize: 13 }}
            >
              + Color
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrap: {
    border: "1.5px solid var(--border)",
    borderRadius: 12,
    padding: "16px",
    marginTop: 8,
    background: "var(--pink-light)",
  },
  titleRow: { marginBottom: 14 },
  title: { fontWeight: 700, fontSize: 14, color: "var(--pink-dark)", display: "block" },
  subtitle: { fontSize: 12, color: "var(--gray)", marginTop: 2, display: "block" },
  addPartRow: { display: "flex", gap: 8, marginBottom: 14 },
  empty: { fontSize: 13, color: "var(--gray)", fontStyle: "italic", margin: "0 0 8px" },
  partCard: {
    background: "var(--white)",
    borderRadius: 10,
    border: "1.5px solid var(--border)",
    padding: "12px 14px",
    marginBottom: 10,
  },
  partHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
  },
  partName: { fontWeight: 700, fontSize: 14, color: "var(--gray-dark)" },
  removePartBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "var(--gray)", fontSize: 16, lineHeight: 1, padding: "0 4px",
  },
  swatchRow: {
    display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10,
  },
  swatchWrap: {
    display: "flex", alignItems: "center", gap: 5,
    background: "var(--pink-light)", borderRadius: 20,
    padding: "3px 8px 3px 4px", border: "1px solid var(--border)",
  },
  swatch: {
    width: 20, height: 20, borderRadius: "50%",
    border: "1.5px solid rgba(0,0,0,0.15)", flexShrink: 0,
  },
  swatchName: { fontSize: 12, color: "var(--gray-dark)" },
  removeColorBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "var(--gray)", fontSize: 12, padding: 0, lineHeight: 1,
  },
  addColorRow: { display: "flex", gap: 8, alignItems: "center" },
  colorPicker: {
    width: 40, height: 34, borderRadius: 8, border: "1.5px solid var(--border)",
    cursor: "pointer", padding: 2, flexShrink: 0,
  },
};
