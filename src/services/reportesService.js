import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Descarga un blob y lo guarda con el nombre dado. */
const descargarBlob = (blob, nombre) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const descargarVentasExcel = async (fechaInicio, fechaFin) => {
  const { data } = await axios.get(`${API_URL}/Admin/reportes/ventas/excel`, {
    headers: authHeader(),
    params: { fechaInicio, fechaFin },
    responseType: "blob",
  });
  descargarBlob(data, `Ventas_${fechaInicio}_${fechaFin}.xlsx`);
};

export const descargarVentasPdf = async (fechaInicio, fechaFin) => {
  const { data } = await axios.get(`${API_URL}/Admin/reportes/ventas/pdf`, {
    headers: authHeader(),
    params: { fechaInicio, fechaFin },
    responseType: "blob",
  });
  descargarBlob(data, `Ventas_${fechaInicio}_${fechaFin}.pdf`);
};

export const descargarProductosExcel = async (top) => {
  const { data } = await axios.get(`${API_URL}/Admin/reportes/productos/excel`, {
    headers: authHeader(),
    params: { top },
    responseType: "blob",
  });
  descargarBlob(data, `ProductosMasVendidos_Top${top}.xlsx`);
};

export const descargarProductosPdf = async (top) => {
  const { data } = await axios.get(`${API_URL}/Admin/reportes/productos/pdf`, {
    headers: authHeader(),
    params: { top },
    responseType: "blob",
  });
  descargarBlob(data, `ProductosMasVendidos_Top${top}.pdf`);
};
