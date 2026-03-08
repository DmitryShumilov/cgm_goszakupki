import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response;
      
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
          console.error(`HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответа не было
      console.error('Network error: Backend недоступен');
    } else {
      // Ошибка при настройке запроса
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
