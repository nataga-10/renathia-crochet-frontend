import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Protege rutas según el rol del usuario.
 * @param {number[]} allowedRoles - Roles permitidos (1=Admin, 2=Client, 3=Seller)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.roleId))
    return <Navigate to="/catalogo" replace />;

  return children;
}
