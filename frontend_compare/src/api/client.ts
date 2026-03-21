import axios from 'axios';

// API client для comparison dashboard
const apiClient = axios.create({
  baseURL: '/api',  // Proxy через Vite на http://localhost:8000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          console.error('404: Данные не найдены');
          break;
        case 422:
          console.error('422: Ошибка валидации');
          break;
        case 500:
          console.error('500: Ошибка сервера');
          break;
        default:
          console.error(`Error ${error.response.status}: ${error.response.statusText}`);
      }
    } else if (error.request) {
      console.error('Network error: Backend недоступен на http://localhost:8000');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
