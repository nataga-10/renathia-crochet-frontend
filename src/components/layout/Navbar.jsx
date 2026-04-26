import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/renathia_logo.png";

const ROLE_LABELS = { 1: "Administrador", 2: "Cliente", 3: "Vendedor" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* Logo */}
        <div style={styles.logoWrap} onClick={() => navigate("/catalogo")}>
          <img src={logo} alt="Renathia Crochet" style={styles.logo} />
          <div>
            <div style={styles.brandName}>Renathia</div>
            <div style={styles.brandSub}>Crochet</div>
          </div>
        </div>

        {/* Links centrales */}
        <div style={styles.links}>
          {/* Siempre visible */}
          <NavLink href="/catalogo" active={isActive("/catalogo")}>Catálogo</NavLink>

          {/* Solo clientes */}
          {user?.roleId === 2 && (
            <>
              <NavLink href="/carrito" active={isActive("/carrito")}>🛒 Carrito</NavLink>
              <NavLink href="/mis-pedidos" active={isActive("/mis-pedidos")}>Mis pedidos</NavLink>
            </>
          )}

          {/* Admin y Seller */}
          {(user?.roleId === 1 || user?.roleId === 3) && (
            <NavLink href="/admin/productos" active={isActive("/admin/productos")}>
              Gestión de productos
            </NavLink>
          )}
        </div>

        {/* Perfil / acciones */}
        <div style={styles.actions}>
          {user ? (
            <div style={styles.profileWrap}>
              <button style={styles.profileBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <div style={styles.avatar}>
                  {user.fullName?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div style={styles.profileInfo}>
                  <span style={styles.profileName}>{user.fullName}</span>
                  <span style={styles.profileRole}>{ROLE_LABELS[user.roleId]}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--gray)", marginLeft: 4 }}>▾</span>
              </button>

              {menuOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <span style={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <button style={styles.dropdownItem} onClick={() => { setMenuOpen(false); navigate("/perfil"); }}>
                    <span>👤</span> Mi perfil
                  </button>
                  <button style={styles.dropdownItem} onClick={() => { setMenuOpen(false); handleLogout(); }}>
                    <span>🚪</span> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline" onClick={() => navigate("/login")}>
                Iniciar sesión
              </button>
              <button className="btn-primary" onClick={() => navigate("/registro")}>
                Registrarse
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

function NavLink({ href, active, children }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      style={{
        ...styles.navLink,
        background: active ? "var(--pink-light)" : "transparent",
        color: active ? "var(--pink-dark)" : "var(--gray-dark)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  nav: {
    background: "var(--white)",
    borderBottom: "2px solid var(--pink-light)",
    boxShadow: "0 2px 12px rgba(212,132,154,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
    height: 66,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    flexShrink: 0,
  },
  logo: {
    height: 44,
    width: 44,
    objectFit: "contain",
    borderRadius: 8,
  },
  brandName: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--pink-dark)",
    lineHeight: 1.1,
    letterSpacing: "-0.3px",
  },
  brandSub: {
    fontSize: 12,
    color: "var(--green-dark)",
    fontWeight: 500,
  },
  links: {
    display: "flex",
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  navLink: {
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  actions: {
    flexShrink: 0,
    position: "relative",
  },
  profileWrap: {
    position: "relative",
  },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--pink-light)",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    padding: "6px 12px 6px 6px",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    fontFamily: "inherit",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--pink), var(--green))",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  profileName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--gray-dark)",
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: 11,
    color: "var(--green-dark)",
    fontWeight: 500,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    background: "var(--white)",
    border: "1.5px solid var(--border)",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    minWidth: 200,
    overflow: "hidden",
    zIndex: 200,
  },
  dropdownHeader: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--pink-light)",
  },
  dropdownEmail: {
    fontSize: 12,
    color: "var(--gray)",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    fontSize: 14,
    color: "var(--gray-dark)",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "background 0.15s",
  },
};
