# Backend Dockerfile для CGM Dashboard
# Multi-stage build для уменьшения размера образа

# Stage 1: Build
FROM python:3.14-slim as builder

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .

RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production
FROM python:3.14-slim

WORKDIR /app

# Создание пользователя для безопасности
RUN useradd --create-home --shell /bin/bash appuser

# Копирование зависимостей из builder
COPY --from=builder /root/.local /home/appuser/.local

# Копирование кода приложения
COPY . .

# Установка переменных окружения
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Создание директории для логов
RUN mkdir -p logs && chown -R appuser:appuser /app

# Переключение на не-root пользователя
USER appuser

# Экспозиция порта
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

# Запуск приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
