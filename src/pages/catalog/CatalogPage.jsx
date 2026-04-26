import { useEffect, useState } from "react";
import { getProducts, getProductsByCategory } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PersonalizacionModal from "../../components/common/PersonalizacionModal";

const CATEGORIAS = [
  { id: null, label: "Todos" },
  { id: 1, label: "Amigurumis" },
  { id: 2, label: "Accesorios" },
  { id: 3, label: "Decoración" },
];

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [productoModal, setProductoModal] = useState(null); // amigurumi abierto en modal
  const { agregarAlCarrito, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      setProducts(Array.isArray(result) ? result : []);
      setMensaje(Array.isArray(result) ? "" : result.message || "");
    } catch {
      setMensaje("Error al cargar los productos");
    }
  };

  const filterByCategory = async (catId) => {
    setCategoriaActiva(catId);
    if (!catId) { loadProducts(); return; }
    try {
      const result = await getProductsByCategory(catId);
      setProducts(Array.isArray(result) ? result : []);
      setMensaje(Array.isArray(result) ? "" : result.message || "");
    } catch {
      setMensaje("Error al filtrar productos");
    }
  };

  const tienePartes = (product) => product.parts && product.parts.length > 0;

  const handleAddToCart = (product) => {
    if (!user) { navigate("/login"); return; }
    if (user.roleId !== 2) return;
    if (tienePartes(product)) {
      setProductoModal(product);
    } else {
      agregarAlCarrito(product.productId, 1);
    }
  };

  const handlePersonalizacionConfirm = (customPrice, notes) => {
    agregarAlCarrito(productoModal.productId, 1, null, customPrice, notes);
    setProductoModal(null);
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Catálogo</h2>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        {CATEGORIAS.map(cat => (
          <button
            key={cat.id}
            onClick={() => filterByCategory(cat.id)}
            style={{
              ...styles.filterBtn,
              background: categoriaActiva === cat.id ? "var(--pink)" : "var(--white)",
              color: categoriaActiva === cat.id ? "white" : "var(--gray-dark)",
              borderColor: categoriaActiva === cat.id ? "var(--pink)" : "var(--border)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {mensaje && (
        <div style={styles.empty}>
          <span style={{ fontSize: 40 }}>🧶</span>
          <p style={{ color: "var(--gray)", marginTop: 10 }}>{mensaje}</p>
        </div>
      )}

      {/* Grid de productos */}
      <div style={styles.grid}>
        {products.map(product => (
          <div key={product.productId} style={styles.card}>
            <div style={styles.imgWrap}>
              {product.primaryImageUrl ? (
                <img src={product.primaryImageUrl} alt={product.name} style={styles.img} />
              ) : (
                <div style={styles.imgPlaceholder}>🧶</div>
              )}
              {product.isMadeToOrder && (
                <span style={styles.badgePedido}>Bajo pedido</span>
              )}
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.productName}>{product.name}</h3>
              {product.description && (
                <p style={styles.productDesc}>{product.description}</p>
              )}
              {product.categoryName && (
                <span style={styles.categoryBadge}>{product.categoryName}</span>
              )}

              <div style={styles.cardFooter}>
                {user ? (
                  <span style={styles.productPrice}>
                    ${product.basePrice.toLocaleString()}
                  </span>
                ) : (
                  <span style={styles.priceHidden}>Inicia sesión para ver el precio</span>
                )}

                {user?.roleId === 2 && (
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={loading}
                    style={styles.addBtn}
                  >
                    {tienePartes(product) ? "🎨 Personalizar" : "Agregar"}
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => navigate("/login")}
                    style={styles.loginBtn}
                  >
                    Inicia sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal personalización amigurumi */}
      {productoModal && (
        <PersonalizacionModal
          product={productoModal}
          onConfirm={handlePersonalizacionConfirm}
          onClose={() => setProductoModal(null)}
        />
      )}
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 20,
  },
  filters: {
    display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24,
  },
  filterBtn: {
    padding: "8px 18px", borderRadius: 20,
    border: "1.5px solid", cursor: "pointer",
    fontSize: 14, fontWeight: 500, fontFamily: "inherit",
    transition: "all 0.15s",
  },
  empty: {
    textAlign: "center", padding: "60px 20px",
    background: "var(--white)", borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
  },
  card: {
    background: "var(--white)",
    borderRadius: 14,
    boxShadow: "var(--shadow)",
    overflow: "hidden",
    transition: "box-shadow 0.2s",
    display: "flex", flexDirection: "column",
  },
  imgWrap: {
    position: "relative",
  },
  img: {
    width: "100%", height: 200,
    objectFit: "cover",
  },
  imgPlaceholder: {
    width: "100%", height: 200,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--pink-light)", fontSize: 48,
  },
  badgePedido: {
    position: "absolute", top: 10, right: 10,
    background: "var(--green)",
    color: "white", fontSize: 11,
    padding: "3px 10px", borderRadius: 20, fontWeight: 600,
  },
  cardBody: {
    padding: "14px 16px 16px",
    display: "flex", flexDirection: "column", flex: 1,
  },
  productName: {
    margin: "0 0 4px", fontSize: 16, fontWeight: 700,
    color: "var(--gray-dark)",
  },
  productDesc: {
    margin: "0 0 8px", fontSize: 13, color: "var(--gray)",
    display: "-webkit-box", WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  categoryBadge: {
    display: "inline-block",
    background: "var(--green-light)", color: "var(--green-dark)",
    fontSize: 11, padding: "2px 10px", borderRadius: 20,
    fontWeight: 500, marginBottom: 10,
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: "auto",
  },
  productPrice: {
    fontSize: 18, fontWeight: 700, color: "var(--pink-dark)",
  },
  priceHidden: {
    fontSize: 12, color: "var(--gray)", fontStyle: "italic",
  },
  addBtn: {
    background: "var(--pink)", color: "white",
    border: "none", borderRadius: 8,
    padding: "8px 14px", fontSize: 13,
    cursor: "pointer", fontWeight: 600,
    fontFamily: "inherit",
  },
  loginBtn: {
    background: "transparent", color: "var(--pink-dark)",
    border: "1.5px solid var(--pink)", borderRadius: 8,
    padding: "7px 14px", fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
};
