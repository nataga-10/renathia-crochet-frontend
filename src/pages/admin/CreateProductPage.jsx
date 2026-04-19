import { useForm } from "react-hook-form";
import { createProduct } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * Página de creación de producto para el panel de administración.
 * Construye un FormData para enviar datos e imagen en una sola solicitud multipart.
 * Redirige al listado de productos tras la creación exitosa.
 */
export default function CreateProductPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  // Estado separado para el archivo de imagen (no manejado por react-hook-form)
  const [imagen, setImagen] = useState(null);

  /**
   * Construye el FormData con los datos del formulario y la imagen seleccionada,
   * luego envía la solicitud de creación al backend.
   */
  const onSubmit = async (data) => {
    try {
      // Usar FormData porque el endpoint acepta multipart/form-data (imagen incluida)
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("basePrice", data.basePrice);
      formData.append("stock", data.stock);
      formData.append("isMadeToOrder", data.isMadeToOrder || false);
      formData.append("categoryId", data.categoryId || "");
      if (imagen) formData.append("image", imagen); // La imagen es opcional

      await createProduct(formData);
      setMensaje("¡Producto creado exitosamente!");
      setTimeout(() => navigate("/admin/productos"), 2000);
    } catch (error) {
      setMensaje("Error al crear el producto");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px" }}>
      <h2>Crear Producto - RENATHIA CROCHET</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div style={{ marginBottom: "15px" }}>
          <label>Nombre del producto</label>
          <input
            {...register("name", { required: "El nombre es obligatorio" })}
            placeholder="Ej: Amigurumi Oso"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Descripción</label>
          <textarea
            {...register("description")}
            placeholder="Describe el producto..."
            style={{ width: "100%", padding: "8px", height: "80px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Precio (COP)</label>
          <input
            type="number"
            {...register("basePrice", { required: "El precio es obligatorio", min: { value: 1, message: "El precio debe ser mayor a 0" } })}
            placeholder="Ej: 45000"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.basePrice && <p style={{ color: "red" }}>{errors.basePrice.message}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Stock</label>
          <input
            type="number"
            {...register("stock", { required: "El stock es obligatorio", min: { value: 0, message: "El stock no puede ser negativo" } })}
            placeholder="Cantidad disponible"
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
          <label>Imagen del producto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files[0])}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {mensaje && <p style={{ color: "blue" }}>{mensaje}</p>}

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer" }}>
          Crear Producto
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        <a href="/admin/productos">← Volver a productos</a>
      </p>
    </div>
  );
}