import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboardResumen  = () =>
  axios.get(`${API_URL}/Admin/dashboard/resumen`,           { headers: authHeader() }).then(r => r.data);

export const getVentasPorDia      = () =>
  axios.get(`${API_URL}/Admin/dashboard/ventas-por-dia`,    { headers: authHeader() }).then(r => r.data);

export const getEstadosPedidos    = () =>
  axios.get(`${API_URL}/Admin/dashboard/estados-pedidos`,   { headers: authHeader() }).then(r => r.data);

export const getProductosVendidos = () =>
  axios.get(`${API_URL}/Admin/dashboard/productos-vendidos`,{ headers: authHeader() }).then(r => r.data);
