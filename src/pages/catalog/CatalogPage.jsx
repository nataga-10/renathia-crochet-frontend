import { useEffect, useState } from "react";
import { getProducts, getProductsByCategory } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const { agregarAlCarrito, loading } = useCart();
  const { token } = useAuth();
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

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    await agregarAlCarrito(productId, 1);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Catalogo - RENATHIA CROCHET</h2>
        {token && (
          <button
            onClick={() => navigate("/carrito")}
            style={{ padding: "10px 20px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}>
            Ver carrito
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={loadProducts} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer", borderRadius: "5px", border: "1px solid #6B2D8B" }}>Todos</button>
        <button onClick={() => filterByCategory(1)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer", borderRadius: "5px", border: "1px solid #6B2D8B" }}>Amigurumis</button>
        <button onClick={() => filterByCategory(2)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer", borderRadius: "5px", border: "1px solid #6B2D8B" }}>Accesorios</button>
        <button onClick={() => filterByCategory(3)} style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer", borderRadius: "5px", border: "1px solid #6B2D8B" }}>Decoracion</button>
      </div>

      {mensaje && <p style={{ color: "gray" }}>{mensaje}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map(product => (
          <div key={product.productId} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
            {product.primaryImageUrl && (
              <img src={product.primaryImageUrl} alt={product.name}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }} />
            )}
            <h3 style={{ marginBottom: "5px" }}>{product.name}</h3>
            <p style={{ color: "gray", fontSize: "14px" }}>{product.description}</p>
            {token ? (
              <p style={{ fontWeight: "bold", color: "#6B2D8B", fontSize: "18px" }}>
                ${product.basePrice.toLocaleString()}
              </p>
            ) : (
              <p style={{ color: "gray", fontSize: "14px", fontStyle: "italic" }}>
                Inicia sesion para ver el precio
              </p>
            )}
            {product.colors.length > 0 && (
              <p style={{ fontSize: "13px", color: "gray" }}>Colores: {product.colors.join(", ")}</p>
            )}
            <button
              onClick={() => handleAddToCart(product.productId)}
              disabled={loading}
              style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer", borderRadius: "5px", marginTop: "10px" }}>
              {token ? "Agregar al carrito" : "Inicia sesion para comprar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}