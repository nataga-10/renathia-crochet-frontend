import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import CartDrawer from "./components/common/CartDrawer";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import RecoverPasswordPage from "./pages/auth/RecoverPasswordPage";
import CatalogPage from "./pages/catalog/CatalogPage";
import ProductsAdminPage from "./pages/admin/ProductsAdminPage";
import CreateProductPage from "./pages/admin/CreateProductPage";
import EditProductPage from "./pages/admin/EditProductPage";
import CartPage from "./pages/cart/CartPage";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ProfilePage from "./pages/auth/ProfilePage";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Autenticación */}
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />

              {/* Catálogo público */}
              <Route path="/catalogo" element={<CatalogPage />} />

              {/* Perfil — cualquier usuario autenticado */}
              <Route path="/perfil" element={
                <ProtectedRoute allowedRoles={[1, 2, 3]}><ProfilePage /></ProtectedRoute>
              } />

              {/* Solo clientes - rol 2 */}
              <Route path="/carrito" element={
                <ProtectedRoute allowedRoles={[2]}><CartPage /></ProtectedRoute>
              } />
              <Route path="/mis-pedidos" element={
                <ProtectedRoute allowedRoles={[2]}><MyOrdersPage /></ProtectedRoute>
              } />
              <Route path="/mis-pedidos/:orderId" element={
                <ProtectedRoute allowedRoles={[2]}><OrderDetailPage /></ProtectedRoute>
              } />

              {/* Solo administrador (1) y vendedor (3) */}
              <Route path="/admin/productos" element={
                <ProtectedRoute allowedRoles={[1, 3]}><ProductsAdminPage /></ProtectedRoute>
              } />
              <Route path="/admin/productos/crear" element={
                <ProtectedRoute allowedRoles={[1, 3]}><CreateProductPage /></ProtectedRoute>
              } />
              <Route path="/admin/productos/editar/:id" element={
                <ProtectedRoute allowedRoles={[1, 3]}><EditProductPage /></ProtectedRoute>
              } />

              <Route path="/" element={<CatalogPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
