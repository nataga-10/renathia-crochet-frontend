/**
 * Contexto global de autenticación.
 * Provee el estado del usuario y token JWT, y las funciones login/logout
 * a todos los componentes de la aplicación mediante React Context.
 */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación.
 * El token se persiste en localStorage para sobrevivir recargas de página.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Restaurar el token del localStorage al iniciar la app (sesión persistente)
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  /**
   * Guarda los datos del usuario y el JWT en estado y localStorage.
   * @param {object} userData - Objeto de respuesta del login (incluye token, message, success)
   * @param {string} userToken - JWT retornado por el backend
   */
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  /**
   * Limpia el estado de autenticación y elimina el token del localStorage.
   */
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

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * Usar dentro de componentes envueltos por AuthProvider.
 */
export function useAuth() {
  return useContext(AuthContext);
}