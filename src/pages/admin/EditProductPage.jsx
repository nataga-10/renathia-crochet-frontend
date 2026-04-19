import { useForm } from "react-hook-form";
import { getProductById, updateProduct } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * Página de edición de producto para el panel de administración.
 * Carga los datos actuales del producto al montar el componente y los inyecta
 * en el formulario usando setValue de react-hook-form.
 * Incluye el campo isActive para activar/desactivar el producto.
 */
export default function EditProductPage() {
  // Obtener el ID del producto desde la URL (/admin/productos/editar/:id)
  const { id } = useParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  // Cargar el producto existente al montar el componente
  useEffect(() => {
    loadProduct();
  }, []);

  /**
   * Obtiene el producto por ID y pre-rellena el formulario con sus datos actuales.
   * Usa setValue para inyectar cada campo individualmente en react-hook-form.
   */
  const loadProduct = async () => {
    try {
      const product = await getProductById(id);
      setValue("name", product.name);
      setValue("description", product.description);
      setValue("basePrice", product.basePrice);
      setValue("stock", product.stock);
      setValue("isMadeToOrder", product.isMadeToOrder);
      setValue("isActive", product.isActive); // Permite activar/desactivar el producto
    } catch (error) {
      setMensaje("Error al cargar el producto");
    }
  };

  /**
   * Envía los datos actualizados al backend usando JSON (sin imagen).
   * Redirige al listado tras la actualización exitosa.
   */
  const onSubmit = async (data) => {
    try {
      await updateProduct(id, data);
      setMensaje("¡Producto actualizado exitosamente!");
      setTimeout(() => navigate("/admin/productos"), 2000);
    } catch (error) {
      setMensaje("Error al actualizar el producto");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
      <h2>Editar Producto - RENATHIA CROCHET</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div style={{ marginBottom: "15px" }}>
          <label>Nombre del producto</label>
          <input
            {...register("name", { required: "El nombre es obligatorio" })}
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Descripción</label>
          <textarea
            {...register("description")}
            style={{ width: "100%", padding: "8px", height: "80px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Precio (COP)</label>
          <input
            type="number"
            {...register("basePrice", { required: "El precio es obligatorio" })}
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.basePrice && <p style={{ color: "red" }}>{errors.basePrice.message}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Stock</label>
          <input
            type="number"
            {...register("stock", { required: "El stock es obligatorio" })}
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.stock && <p style={{ color: "red" }}>{errors.stock.message}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Categoría</label>
          <select {...register("categoryId")} style={{ width: "100%", padding: "8px" }}>
            <option value="">Selecciona una categoría</option>
            <option value="1">Amigurumis</option>
            <option value="2">Accesorios</option>
            <option value="3">Decoración</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <input type="checkbox" {...register("isMadeToOrder")} />
            {" "}Elaborado bajo pedido
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <input type="checkbox" {...register("isActive")} />
            {" "}Producto activo
          </label>
        </div>

        {mensaje && <p style={{ color: "blue" }}>{mensaje}</p>}

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer" }}>
          Guardar cambios
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        <a href="/admin/productos">← Volver a productos</a>
      </p>
    </div>
  );
}