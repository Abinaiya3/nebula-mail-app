import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = 'http://localhost:8000/auth/google/login';
    }
    return Promise.reject(error);
  }
);

export default api;
