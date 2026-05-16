import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/Admin/users`, { headers: authHeader() });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_URL}/Admin/users/${id}`, { headers: authHeader() });
  return response.data;
};

export const createUser = async (data) => {
  const response = await axios.post(`${API_URL}/Admin/users`, data, { headers: authHeader() });
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axios.put(`${API_URL}/Admin/users/${id}`, data, { headers: authHeader() });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/Admin/users/${id}`, { headers: authHeader() });
  return response.data;
};
