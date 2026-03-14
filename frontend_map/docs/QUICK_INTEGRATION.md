# ⚡ Быстрая интеграция frontend_map с backend
## Экспресс-руководство (15 минут)

---

## 📋 Шаг 1: Backend (5 минут)

### 1.1 Добавить endpoint

**Файл:** `backend/main.py` (после строки 817)

```python
@app.get("/api/map/regions")
@limiter.limit("60/minute")
async def get_map_regions(
    request: Request,
    years: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
    suppliers: Optional[str] = Query(None),
    products: Optional[str] = Query(None)
):
    """Получение данных для карты регионов"""
    logger.info(f"Fetching map regions data")
    
    start_time = time.time()
    
    try:
        # Парсинг параметров
        year_list = [int(y.strip()) for y in years.split(',')] if years else None
        region_list = [r.strip() for r in regions.split(',')] if regions else None
        
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = """
                    SELECT 
                        region,
                        SUM(amount_rub) as sum,
                        COUNT(*) as count,
                        SUM(quantity) as quantity,
                        AVG(amount_rub) as avg_price
                    FROM purchases
                    WHERE 1=1
                """
                
                conditions = []
                params = {}
                
                if year_list:
                    conditions.append("year = ANY(%(years)s)")
                    params['years'] = year_list
                
                if region_list:
                    conditions.append("region = ANY(%(regions)s)")
                    params['regions'] = region_list
                
                if conditions:
                    query += " AND " + " AND ".join(conditions)
                
                query += " GROUP BY region ORDER BY sum DESC"
                
                cur.execute(query, params)
                results = cur.fetchall()
                
                regions_data = []
                for row in results:
                    regions_data.append({
                        "region": row['region'],
                        "sum": float(row['sum']) if row['sum'] else 0,
                        "count": int(row['count']) if row['count'] else 0,
                        "quantity": int(row['quantity']) if row['quantity'] else 0,
                        "avg_price": float(row['avg_price']) if row['avg_price'] else 0
                    })
                
                elapsed = time.time() - start_time
                logger.info(f"Map regions fetched in {elapsed:.3f}s")
                
                return regions_data
                
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 1.2 Проверить CORS

**Файл:** `backend/main.py` (строка 127)

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",  # ✅ Убедиться, что есть
]
```

### 1.3 Запустить backend

```bash
cd C:\Dashboards\cgm_goszakupki\backend
python main.py
```

**Проверка:**
```bash
curl http://localhost:8000/api/map/regions
```

---

## 📋 Шаг 2: Frontend (5 минут)

### 2.1 Создать .env

**Файл:** `frontend_map/.env`

```env
VITE_API_URL=http://localhost:8000
```

### 2.2 Обновить API client

**Файл:** `frontend_map/src/api/client.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default apiClient;
```

### 2.3 Обновить mapApi.ts

**Файл:** `frontend_map/src/api/mapApi.ts`

Заменить все mock функции на:

```typescript
export const mapApi = {
  getRegions: async (params?: FilterParams): Promise<RegionData[]> => {
    const response = await apiClient.get<RegionData[]>('/api/map/regions', { params });
    return response.data;
  },

  getYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/api/filters/years');
    return response.data;
  },

  getRegionsList: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/filters/regions');
    return response.data;
  },

  getSuppliers: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/filters/suppliers');
    return response.data;
  },

  getProducts: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/filters/products');
    return response.data;
  },
};
```

### 2.4 Запустить frontend

```bash
cd C:\Dashboards\cgm_goszakupki\frontend_map
npm run dev
```

---

## 📋 Шаг 3: Проверка (5 минут)

### 3.1 Открыть дашборд

**URL:** http://localhost:5174

### 3.2 Проверить

- [ ] Карта загрузилась (85 регионов)
- [ ] Регионы окрашиваются
- [ ] Tooltip работает
- [ ] Клик на регион открывает панель
- [ ] Фильтры загружаются
- [ ] Выбор фильтров обновляет карту

### 3.3 Проверить консоль

**Ожидается:**
```
✅ Map data loaded: 85 regions
✅ GeoJSON loaded: 85 features
```

---

## ✅ Готово!

### Что работает:
- ✅ Backend endpoint `/api/map/regions`
- ✅ Frontend подключён к backend
- ✅ Фильтры работают
- ✅ Данные обновляются

### Следующие шаги:
1. Production сборка: `npm run build`
2. Развёртывание на сервере
3. Проверка HTTPS

---

**Время:** 15 минут  
**Статус:** ✅ Готово
