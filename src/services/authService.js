/**
 * Servicio de autenticación. Encapsula las llamadas a la API del backend
 * para registro, login y recuperación de contraseña.
 * La URL base se configura con la variable de entorno VITE_API_URL.
 */
import axios from "axios";

// URL base de la API. Usar .env para cambiarla en producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

/**
 * Registra un nuevo usuario.
 * @param {object} data - { fullName, email, password, phone? }
 */
export const register = async (data) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

/**
 * Inicia sesión con correo y contraseña.
 * @param {object} data - { email, password }
 * @returns {object} - { success, message, token }
 */
export const login = async (data) => {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  return response.data;
};

/**
 * Solicita el envío de instrucciones de recuperación de contraseña al correo indicado.
 * @param {string} email - Correo del usuario
 */
export const recoverPassword = async (email) => {
  const response = await axios.post(`${API_URL}/auth/recover-password`, { email });
  return response.data;
};

export const getProfile = async (token) => {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (token, data) => {
  const response = await axios.put(`${API_URL}/auth/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};