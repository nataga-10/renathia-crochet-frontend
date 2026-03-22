import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import RecoverPasswordPage from "./pages/auth/RecoverPasswordPage";
import CatalogPage from "./pages/catalog/CatalogPage";
import ProductsAdminPage from "./pages/admin/ProductsAdminPage";
import CreateProductPage from "./pages/admin/CreateProductPage";
import EditProductPage from "./pages/admin/EditProductPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/admin/productos" element={<ProductsAdminPage />} />
          <Route path="/admin/productos/crear" element={<CreateProductPage />} />
          <Route path="/admin/productos/editar/:id" element={<EditProductPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;