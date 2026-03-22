import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../services/productService";
import { useNavigate } from "react-router-dom";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      if (result.message) {
        setMensaje(result.message);
      } else {
        setProducts(result);
      }
    } catch (error) {
      setMensaje("Error al cargar los productos");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este producto?")) {
      try {
        await deleteProduct(id);
        setMensaje("Producto eliminado correctamente");
        loadProducts();
      } catch (error) {
        setMensaje("Error al eliminar el producto");
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestión de Productos - RENATHIA CROCHET</h2>
        <button
          onClick={() => navigate("/admin/productos/crear")}
          style={{ padding: "10px 20px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}>
          + Nuevo Producto
        </button>
      </div>

      {mensaje && <p style={{ color: "gray" }}>{mensaje}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#6B2D8B", color: "white" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Nombre</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Categoría</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Precio</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Stock</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr key={product.productId} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f5f5f5" }}>
              <td style={{ padding: "10px" }}>{product.productId}</td>
              <td style={{ padding: "10px" }}>{product.name}</td>
              <td style={{ padding: "10px" }}>{product.categoryName || "Sin categoría"}</td>
              <td style={{ padding: "10px" }}>${product.basePrice.toLocaleString()}</td>
              <td style={{ padding: "10px" }}>{product.stock}</td>
              <td style={{ padding: "10px" }}>
                <button
                  onClick={() => navigate(`/admin/productos/editar/${product.productId}`)}
                  style={{ marginRight: "8px", padding: "6px 12px", backgroundColor: "#1A4A8A", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.productId)}
                  style={{ padding: "6px 12px", backgroundColor: "#A00000", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}