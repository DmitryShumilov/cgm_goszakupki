# 📊 Comparison Dashboard API

**Версия:** 1.0.0  
**Дата:** 19 марта 2026  
**Статус:** ✅ Production Ready

---

## 🎯 Обзор

API для сравнения показателей госзакупок между двумя независимыми периодами.

**Базовый URL:** `http://localhost:8000/api`

---

## 🔌 Endpoints

### Сравнение KPI

**POST** `/compare/kpi`

Сравнение KPI метрик двух периодов.

**Запрос:**
```json
{
  "periodA": {
    "years": [2024],
    "regions": ["Москва"],
    "products": ["Freestyle Libre"]
  },
  "periodB": {
    "years": [2025],
    "regions": ["Москва"],
    "products": ["Freestyle Libre"]
  }
}
```

**Ответ:**
```json
{
  "periodA": {
    "total_amount": 8968081000.0,
    "contract_count": 742,
    "avg_contract_amount": 12086357.93,
    "total_quantity": 1654628.6,
    "avg_price_per_unit": 5419.99,
    "customer_count": 196
  },
  "periodB": {
    "total_amount": 9594873000.0,
    "contract_count": 743,
    "avg_contract_amount": 12913684.28,
    "total_quantity": 2609981.0,
    "avg_price_per_unit": 3676.22,
    "customer_count": 197
  },
  "changes": {
    "total_amount": {
      "absolute": 626792000.0,
      "percent": 6.99,
      "trend": "growth"
    },
    "contract_count": {
      "absolute": 1,
      "percent": 0.13,
      "trend": "stable"
    },
    "avg_contract_amount": {
      "absolute": 827326.35,
      "percent": 6.85,
      "trend": "growth"
    },
    "total_quantity": {
      "absolute": 955352.4,
      "percent": 57.74,
      "trend": "growth"
    },
    "avg_price_per_unit": {
      "absolute": -1743.77,
      "percent": -32.17,
      "trend": "decline"
    }
  }
}
```

**Тренды:**
- `"growth"` — Рост (>5%)
- `"decline"` — Падение (<-5%)
- `"stable"` — Стабильно (±5%)

---

### Сравнение динамики

**POST** `/compare/dynamics`

Сравнение динамики закупок по месяцам.

**Запрос:**
```json
{
  "periodA": {"years": [2024]},
  "periodB": {"years": [2025]}
}
```

**Ответ:**
```json
{
  "labels": ["2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10"],
  "periodA": {
    "amounts": [0, 0, 0, 0, 0, 0, 0],
    "quantities": [0, 0, 0, 0, 0, 0, 0]
  },
  "periodB": {
    "amounts": [110229936.0, 341749500.0, 345866940.0, 33912432.0, 32362592.0, 6770316.0, 2878800.0],
    "quantities": [25301.0, 86120.0, 130568.0, 6719.0, 5855.0, 2350.0, 906.0]
  }
}
```

**Примечание:** Если в одном из периодов нет данных, возвращаются нулевые значения для всех меток.

---

### Сравнение регионов

**POST** `/compare/regions`

Сравнение топ-10 регионов.

**Запрос:**
```json
{
  "periodA": {"years": [2024]},
  "periodB": {"years": [2025]}
}
```

**Ответ:**
```json
{
  "labels": ["Москва", "Санкт-Петербург", "Казань", ...],
  "periodA": {
    "amounts": [5000000000, 3000000000, 2000000000],
    "counts": [50, 30, 20]
  },
  "periodB": {
    "amounts": [6000000000, 3500000000, 2500000000],
    "counts": [60, 35, 25]
  }
}
```

**Примечание:** Возвращаются все регионы из обоих периодов (объединение).

---

### Сравнение поставщиков

**POST** `/compare/suppliers`

Данные для scatter plot поставщиков.

**Запрос:**
```json
{
  "periodA": {"years": [2024]},
  "periodB": {"years": [2025]}
}
```

**Ответ:**
```json
{
  "points": [
    {
      "supplier": "ООО \"БСС\"",
      "periodA": 1988918500.0,
      "periodB": 2197211000.0
    },
    ...
  ]
}
```

---

### Таблица сравнения

**POST** `/compare/table`

Детальная таблица сравнения по регионам.

**Запрос:**
```json
{
  "periodA": {"years": [2024]},
  "periodB": {"years": [2025]}
}
```

**Ответ:**
```json
{
  "rows": [
    {
      "region": "Москва",
      "periodA_amount": 5000000000,
      "periodB_amount": 6000000000,
      "periodA_count": 50,
      "periodB_count": 60,
      "absoluteDiff": 1000000000,
      "percentDiff": 20.0,
      "trend": "growth"
    },
    ...
  ]
}
```

**Сортировка:** По умолчанию по абсолютному изменению (по убыванию).

---

## 📋 Фильтры (справочники)

### GET `/filters/years`

Список доступных лет.

**Ответ:**
```json
[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034]
```

---

### GET `/filters/months`

Список месяцев.

**Ответ:**
```json
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

---

### GET `/filters/regions`

Список регионов.

**Ответ:**
```json
["Москва", "Санкт-Петербург", "Казань", ...]
```

---

### GET `/filters/products`

Список продуктов.

**Ответ:**
```json
["Freestyle Libre", "Lumiflex Linx", ...]
```

---

## 🔒 Rate Limiting

| Endpoint | Лимит |
|----------|-------|
| `/compare/*` | 60 запросов/мин |
| `/filters/*` | 60 запросов/мин |

---

## ⚠️ Обработка ошибок

### 422 Unprocessable Entity

**Причина:** Ошибка валидации входных данных

**Пример:**
```json
{
  "detail": "Invalid year format"
}
```

### 500 Internal Server Error

**Причина:** Ошибка сервера

**Пример:**
```json
{
  "detail": "Database connection error"
}
```

---

## 📊 Примеры использования

### cURL

```bash
# Сравнение KPI
curl -X POST http://localhost:8000/api/compare/kpi \
  -H "Content-Type: application/json" \
  -d '{
    "periodA": {"years": [2024]},
    "periodB": {"years": [2025]}
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('/api/compare/kpi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    periodA: { years: [2024] },
    periodB: { years: [2025] }
  })
});

const data = await response.json();
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:8000/api/compare/kpi',
    json={
        'periodA': {'years': [2024]},
        'periodB': {'years': [2025]}
    }
)

data = response.json()
```

---

## 📝 Примечания

### Обработка пустых периодов

Если в одном из периодов нет данных (например, продукт не поставлялся в 2024 году), API возвращает:

- Все метки из обоих периодов (объединение)
- Нулевые значения для отсутствующих данных

**Пример:**
```json
{
  "labels": ["2025-04", "2025-05", ...],
  "periodA": {"amounts": [0, 0, ...], "quantities": [0, 0, ...]},
  "periodB": {"amounts": [110229936.0, ...], "quantities": [25301.0, ...]}
}
```

### Тренды

| Значение | Порог | Иконка |
|----------|-------|--------|
| `growth` | > +5% | 📈 |
| `decline` | < -5% | 📉 |
| `stable` | ±5% | ➡️ |

---

**Последнее обновление:** 19 марта 2026  
**Статус:** ✅ Production Ready
