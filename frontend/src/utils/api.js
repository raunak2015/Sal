import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('sal_library_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export const loginApi = async (email, password, role) => {
  const response = await api.post('/auth/login', { email, password, role });
  return response.data;
};

export const registerApi = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

// Books
export const fetchBooksApi = async () => {
  const response = await api.get('/books');
  return response.data;
};

export const createBookApi = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

export const updateBookApi = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

export const deleteBookApi = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};

// Requests
export const fetchRequestsApi = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const createRequestApi = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

export const updateRequestApi = async (id, data) => {
  const response = await api.put(`/requests/${id}`, data);
  return response.data;
};

export default api;
