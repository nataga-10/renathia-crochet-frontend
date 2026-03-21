import { useEffect, useState } from "react";
import { getProducts, getProductsByCategory } from "../../services/productService";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");

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

  const filterByCategory = async (categoryId) => {
    try {
      const result = await getProductsByCategory(categoryId);
      if (result.message) {
        setMensaje(result.message);
        setProducts([]);
      } else {
        setProducts(result);
        setMensaje("");
      }
    } catch (error) {
      setMensaje("Error al filtrar productos");
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "20px" }}>
      <h2>Catálogo - RENATHIA CROCHET</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={loadProducts} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}>
          Todos
        </button>
        <button onClick={() => filterByCategory(1)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}>
          Amigurumis
        </button>
        <button onClick={() => filterByCategory(2)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}>
          Accesorios
        </button>
        <button onClick={() => filterByCategory(3)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}>
          Decoración
        </button>
      </div>

      {mensaje && <p style={{ color: "gray" }}>{mensaje}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map(product => (
          <div key={product.productId} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
            {product.primaryImageUrl && (
              <img src={product.primaryImageUrl} alt={product.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p style={{ fontWeight: "bold" }}>$ {product.basePrice.toLocaleString()}</p>
            {product.colors.length > 0 && (
              <p>Colores: {product.colors.join(", ")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}