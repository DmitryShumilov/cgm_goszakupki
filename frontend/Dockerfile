# Frontend Dockerfile для CGM Dashboard
# Multi-stage build для сборки и production

# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Stage 2: Production с nginx
FROM nginx:alpine

# Копирование кастомной nginx конфигурации
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранного приложения
COPY --from=builder /app/dist /usr/share/nginx/html

# Экспозиция порта
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
