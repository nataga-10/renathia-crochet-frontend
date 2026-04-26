import { useForm } from "react-hook-form";
import { getProductById, updateProduct, setProductParts } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PartsEditor from "../../components/admin/PartsEditor";

export default function EditProductPage() {
  const { id } = useParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [parts, setParts] = useState([]);

  useEffect(() => { loadProduct(); }, []);

  const loadProduct = async () => {
    try {
      const product = await getProductById(id);
      setValue("name", product.name);
      setValue("description", product.description || "");
      setValue("basePrice", product.basePrice);
      setValue("stock", product.stock);
      setValue("isMadeToOrder", product.isMadeToOrder);
      setValue("isActive", product.isActive ?? true);
      setValue("categoryId", product.categoryId ?? "");
      // Cargar partes existentes en el formato del editor
      if (product.parts && product.parts.length > 0) {
        setParts(product.parts.map(p => ({
          partName: p.partName,
          colors: p.colors.map(c => ({ colorName: c.colorName, colorHex: c.colorHex || "#f9a8c9" }))
        })));
      }
    } catch {
      setTipo("error");
      setMensaje("Error al cargar el producto");
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        basePrice: parseFloat(data.basePrice),
        stock: parseInt(data.stock),
        isMadeToOrder: !!data.isMadeToOrder,
        isActive: !!data.isActive,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      };
      await updateProduct(id, payload);
      await setProductParts(id, parts);
      setTipo("success");
      setMensaje("¡Producto actualizado exitosamente!");
      setTimeout(() => navigate("/admin/productos"), 2000);
    } catch {
      setTipo("error");
      setMensaje("Error al actualizar el producto. Verifica que estás autenticada.");
    }
  };

  if (cargando) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 60 }}>
        <p style={{ color: "var(--gray)" }}>Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Editar Producto</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            Modifica los datos del producto
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

            <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 400 }}>
                <input type="checkbox" {...register("isMadeToOrder")} style={{ width: "auto" }} />
                <span>Elaborado bajo pedido</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 400 }}>
                <input type="checkbox" {...register("isActive")} style={{ width: "auto" }} />
                <span>Producto activo</span>
              </label>
            </div>

            <div className="form-group">
              <label>Partes personalizables de colores</label>
              <PartsEditor parts={parts} onChange={setParts} />
            </div>

            {mensaje && <div className={`form-message ${tipo}`}>{mensaje}</div>}

            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Guardar cambios
            </button>
          </form>
        </div>

        {/* Info lateral */}
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: "var(--gray)", fontSize: 13, marginBottom: 12 }}>
            <strong style={{ color: "var(--gray-dark)" }}>Producto #{id}</strong>
          </p>
          <div style={styles.infoBox}>
            <span style={{ fontSize: 32 }}>🖼️</span>
            <p style={{ color: "var(--gray)", fontSize: 13, margin: "8px 0 0", textAlign: "center" }}>
              La edición de imagen estará disponible cuando Azure Storage esté configurado.
            </p>
          </div>
          <div style={styles.tipBox}>
            <p style={styles.tipTitle}>💡 Recordatorio</p>
            <p style={styles.tipText}>
              Si desactivas el producto, dejará de aparecer en el catálogo para los clientes.
            </p>
          </div>
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
  infoBox: {
    border: "2px dashed var(--border)",
    borderRadius: 12,
    minHeight: 160,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 16,
  },
  tipBox: {
    background: "var(--pink-light)",
    borderRadius: 10,
    padding: "12px 14px",
  },
  tipTitle: {
    margin: "0 0 4px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--pink-dark)",
  },
  tipText: {
    margin: 0,
    fontSize: 12,
    color: "var(--gray)",
  },
};
