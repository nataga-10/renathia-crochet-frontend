import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5098/api";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getApprovedGallery = async () => {
  const response = await axios.get(`${API_URL}/gallery`);
  return response.data;
};

export const uploadGalleryPhoto = async (formData) => {
  const response = await axios.post(`${API_URL}/gallery`, formData, {
    headers: { "Content-Type": "multipart/form-data", ...authHeader() }
  });
  return response.data;
};

export const approveGalleryPhoto = async (id) => {
  const response = await axios.put(`${API_URL}/gallery/${id}/approve`, {}, {
    headers: authHeader()
  });
  return response.data;
};

export const deleteGalleryPhoto = async (id) => {
  const response = await axios.delete(`${API_URL}/gallery/${id}`, {
    headers: authHeader()
  });
  return response.data;
};
