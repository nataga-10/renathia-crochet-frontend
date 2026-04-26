import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../services/productService";
import { useNavigate } from "react-router-dom";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      if (result.message) {
        setMensaje(result.message);
        setProducts([]);
      } else {
        setProducts(result);
      }
    } catch {
      setMensaje("Error al cargar los productos");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este producto?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch {
        setMensaje("Error al eliminar el producto");
      }
    }
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Gestión de Productos</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            {products.length} producto{products.length !== 1 ? "s" : ""} en catálogo
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/admin/productos/crear")}>
          + Nuevo producto
        </button>
      </div>

      {mensaje && products.length === 0 && (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>🧶</span>
          <p style={{ color: "var(--gray)", marginTop: 12 }}>{mensaje}</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/admin/productos/crear")}>
            Crear primer producto
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.productId} style={{ background: i % 2 === 0 ? "var(--white)" : "var(--pink-light)" }}>
                  <td style={styles.td}>#{p.productId}</td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{p.name}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{p.categoryName || "Sin categoría"}</span>
                  </td>
                  <td style={styles.td}>${p.basePrice.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.stockBadge,
                      background: p.stock > 0 ? "var(--green-light)" : "#FDE8EF",
                      color: p.stock > 0 ? "var(--green-dark)" : "var(--pink-dark)",
                    }}>
                      {p.stock > 0 ? p.stock : "Agotado"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => navigate(`/admin/productos/editar/${p.productId}`)}
                      >
                        Editar
                      </button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => handleDelete(p.productId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "linear-gradient(90deg, var(--pink) 0%, var(--green) 100%)",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    color: "white",
    fontWeight: 600,
    fontSize: 14,
  },
  td: {
    padding: "12px 16px",
    fontSize: 14,
    borderBottom: "1px solid var(--border)",
  },
  badge: {
    background: "var(--green-light)",
    color: "var(--green-dark)",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  stockBadge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  btnEdit: {
    background: "var(--pink-light)",
    color: "var(--pink-dark)",
    border: "1px solid var(--pink)",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
  btnDelete: {
    background: "#FDE8EF",
    color: "#C0405A",
    border: "1px solid #F4A7BB",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
};
