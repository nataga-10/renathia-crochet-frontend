import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

/**
 * Decodifica el JWT y extrae los datos del usuario (id, email, nombre, roleId).
 * Retorna null si el token es inválido o está expirado.
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Verificar expiración
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    return {
      userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
      fullName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      roleId: parseInt(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem("token") || null;
  // Restaurar usuario desde el token guardado al iniciar la app
  const [user, setUser] = useState(() => decodeToken(storedToken));
  const [token, setToken] = useState(storedToken);

  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(decodeToken(userToken));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
