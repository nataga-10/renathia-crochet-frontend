import { useForm } from "react-hook-form";
import { createProduct, setProductParts } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PartsEditor from "../../components/admin/PartsEditor";

export default function CreateProductPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parts, setParts] = useState([]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("basePrice", data.basePrice);
      formData.append("stock", data.stock);
      formData.append("isMadeToOrder", data.isMadeToOrder || false);
      formData.append("categoryId", data.categoryId || "");
      if (imagen) formData.append("image", imagen);

      const created = await createProduct(formData);
      if (parts.length > 0) {
        await setProductParts(created.productId, parts);
      }
      setTipo("success");
      setMensaje("¡Producto creado exitosamente!");
      setTimeout(() => navigate("/admin/productos"), 2000);
    } catch {
      setTipo("error");
      setMensaje("Error al crear el producto. Verifica que estás autenticada.");
    }
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Nuevo Producto</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            Completa los datos del producto
          </p>
        </div>
        <button className="btn-outline" onClick={() => navigate("/admin/productos")}>
          ← Volver
        </button>
      </div>

      <div style={styles.grid}>
        {/* Formulario */}
        <div className="card" style={{ flex: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Nombre del producto</label>
              <input
                {...register("name", { required: "El nombre es obligatorio" })}
                placeholder="Ej: Amigurumi Oso"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                {...register("description")}
                placeholder="Describe el producto..."
                style={{ height: 90, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Precio (COP)</label>
                <input
                  type="number"
                  {...register("basePrice", {
                    required: "El precio es obligatorio",
                    min: { value: 1, message: "Debe ser mayor a 0" }
                  })}
                  placeholder="Ej: 45000"
                />
                {errors.basePrice && <p className="form-error">{errors.basePrice.message}</p>}
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  {...register("stock", {
                    required: "El stock es obligatorio",
                    min: { value: 0, message: "No puede ser negativo" }
                  })}
                  placeholder="Cantidad disponible"
                />
                {errors.stock && <p className="form-error">{errors.stock.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select {...register("categoryId")}>
                <option value="">Selecciona una categoría</option>
                <option value="1">Amigurumis</option>
                <option value="2">Accesorios</option>
                <option value="3">Decoración</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  {...register("isMadeToOrder")}
                  style={{ width: "auto" }}
                />
                <span>Elaborado bajo pedido</span>
              </label>
            </div>

            <div className="form-group">
              <label>Partes personalizables de colores</label>
              <PartsEditor parts={parts} onChange={setParts} />
            </div>

            {mensaje && <div className={`form-message ${tipo}`}>{mensaje}</div>}

            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Crear Producto
            </button>
          </form>
        </div>

        {/* Imagen */}
        <div className="card" style={{ flex: 1 }}>
          <label style={{ marginBottom: 12, display: "block" }}>Imagen del producto</label>
          <div
            style={{
              ...styles.imageBox,
              borderColor: preview ? "var(--green)" : "var(--border)",
            }}
            onClick={() => document.getElementById("imgInput").click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.placeholder}>
                <span style={{ fontSize: 36 }}>🖼️</span>
                <p style={{ color: "var(--gray)", fontSize: 13, margin: "8px 0 0" }}>
                  Haz clic para seleccionar
                </p>
              </div>
            )}
          </div>
          <input
            id="imgInput"
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
          />
          {preview && (
            <button
              type="button"
              className="btn-outline"
              style={{ width: "100%", marginTop: 10 }}
              onClick={() => { setImagen(null); setPreview(null); }}
            >
              Quitar imagen
            </button>
          )}
          <p style={{ color: "var(--gray)", fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Opcional. Formatos: JPG, PNG, WEBP
          </p>
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
  grid: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
  },
  imageBox: {
    border: "2px dashed",
    borderRadius: 12,
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  preview: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  placeholder: {
    textAlign: "center",
    padding: 20,
  },
};
