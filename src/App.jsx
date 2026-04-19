import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas de autenticación */}
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />

            {/* Catálogo público */}
            <Route path="/catalogo" element={<CatalogPage />} />

            {/* Carrito */}
            <Route path="/carrito" element={<CartPage />} />

            {/* Pedidos */}
            <Route path="/mis-pedidos" element={<MyOrdersPage />} />
            <Route path="/mis-pedidos/:orderId" element={<OrderDetailPage />} />

            {/*  Panel de administración de productos */}
            <Route path="/admin/productos" element={<ProductsAdminPage />} />
            <Route path="/admin/productos/crear" element={<CreateProductPage />} />
            <Route path="/admin/productos/editar/:id" element={<EditProductPage />} />

            {/* Ruta por defecto redirige al login */}
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;