# Redis кэш для CGM Dashboard (опционально)

## Установка Redis на Windows

### Вариант 1: Docker (рекомендуется)

```bash
docker run -d -p 6379:6379 --name redis-cgm redis:latest
```

### Вариант 2: WSL2

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

### Вариант 3: Memurai (для разработки)
Скачать с https://www.memurai.com/

## Интеграция с backend

### 1. Установка зависимостей

```bash
pip install redis
```

### 2. Обновление main.py

```python
import redis
import json

# Подключение к Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

class RedisCache:
    """Redis кэш с TTL"""
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds

    def get(self, key: str):
        data = redis_client.get(key)
        return json.loads(data) if data else None

    def set(self, key: str, value):
        redis_client.setex(key, self.ttl, json.dumps(value))

    def clear(self):
        # Очистка ключей с префиксом
        for key in redis_client.scan_iter("cgm:*"):
            redis_client.delete(key)

# Глобальный кэш
cache = RedisCache(ttl_seconds=300)

def get_cache_key(prefix: str, filters: dict) -> str:
    filter_str = json.dumps(filters, sort_keys=True, default=str)
    hash_key = hashlib.md5(filter_str.encode()).hexdigest()
    return f"cgm:{prefix}:{hash_key}"
```

### 3. Переменные окружения

Добавьте в `.env`:

```
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Преимущества Redis перед SimpleCache

| Характеристика | SimpleCache | Redis |
|---------------|-------------|-------|
| Хранение | In-memory | Отдельный сервер |
| Персистентность | Нет | Да (AOF/RDB) |
| Масштабирование | Нет | Да (репликация) |
| Общий кэш | Нет (на процесс) | Да (между процессами) |
| TTL | Есть | Есть + LRU eviction |
| Мониторинг | Нет | Redis CLI, Sentinel |

## Тестирование подключения

```bash
redis-cli ping
# Ответ: PONG
```

## Мониторинг

```bash
redis-cli info memory
redis-cli info stats
redis-cli monitor  # Real-time мониторинг команд
```
