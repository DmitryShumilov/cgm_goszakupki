import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 404:
          console.error('404: Данные не найдены');
          break;
        case 422:
          console.error('422: Ошибка валидации данных');
          break;
        case 500:
          console.error('500: Ошибка сервера');
          break;
        default:
          console.error(`HTTP Error ${status}`);
      }
    } else if (error.request) {
      console.error('Network error: Backend недоступен');
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
