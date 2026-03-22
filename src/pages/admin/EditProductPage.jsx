import { useForm } from "react-hook-form";
import { getProductById, updateProduct } from "../../services/productService";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EditProductPage() {
  const { id } = useParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const product = await getProductById(id);
      setValue("name", product.name);
      setValue("description", product.description);
      setValue("basePrice", product.basePrice);
      setValue("stock", product.stock);
      setValue("isMadeToOrder", product.isMadeToOrder);
      setValue("isActive", product.isActive);
    } catch (error) {
      setMensaje("Error al cargar el producto");
    }
  };

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