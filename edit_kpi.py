# -*- coding: utf-8 -*-
"""Скрипт для замены функции get_kpi в main.py"""

import re

# Новая реализация функции
new_function = '''@app.post("/api/kpi")
def get_kpi(filters: FilterParams = None):
    """
    Получить KPI карточки (POST для поддержки больших фильтров)
    """
    if filters is None:
        filters = FilterParams()

    filter_dict = filters.dict() if hasattr(filters, 'dict') else {}
    cache_key = get_cache_key("kpi", filter_dict)

    # Проверка кэша
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result

    where_clause, params = build_filter_clause(filter_dict)

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = f"""
        SELECT
            COALESCE(SUM(amount_rub), 0) as total_amount,
            COUNT(*) as contract_count,
            COALESCE(AVG(amount_rub), 0) as avg_contract_amount,
            COALESCE(SUM(quantity), 0) as total_quantity,
            CASE
                WHEN COALESCE(SUM(quantity), 0) = 0 THEN 0
                ELSE COALESCE(SUM(amount_rub), 0) / SUM(quantity)
            END as avg_price_per_unit,
            COUNT(DISTINCT customer_name) as customer_count
        FROM purchases
        {where_clause}
        """

        cur.execute(query, params)
        result = cur.fetchone()

        response = {
            "total_amount": float(result['total_amount']),
            "contract_count": int(result['contract_count']),
            "avg_contract_amount": float(result['avg_contract_amount']),
            "total_quantity": float(result['total_quantity']),
            "avg_price_per_unit": float(result['avg_price_per_unit']),
            "customer_count": int(result['customer_count'])
        }

        # Сохранение в кэш
        cache.set(cache_key, response)

        return response
    except ValueError as e:
        logger.error(f"Validation error in get_kpi: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_kpi: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()'''

# Чтение файла
with open(r'C:\Users\Дмитрий\Dashboards\cgm_goszakupki\backend\main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Старая функция (ищем по началу и концу)
old_pattern = r'@app\.post\("/api/kpi"\)\s*def get_kpi\(filters: FilterParams = None\):.*?return response\s*\n'

# Замена
new_content = re.sub(old_pattern, new_function + '\n', content, flags=re.DOTALL)

# Запись файла
with open(r'C:\Users\Дмитрий\Dashboards\cgm_goszakupki\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Функция get_kpi успешно обновлена!")
