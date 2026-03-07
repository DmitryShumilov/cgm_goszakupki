-- Индексы для оптимизации производительности CGM Dashboard
-- Дата: 6 марта 2026

-- 1. Индекс для фильтрации по purchase_date
CREATE INDEX IF NOT EXISTS idx_purchase_date
ON purchases(purchase_date);

-- 2. Комбинированный индекс: регион + сумма
CREATE INDEX IF NOT EXISTS idx_region_amount
ON purchases(region, amount_rub);

-- 3. Комбинированный индекс: поставщик + сумма
CREATE INDEX IF NOT EXISTS idx_distributor_amount
ON purchases(distributor, amount_rub);

-- 4. Комбинированный индекс: товар + сумма
CREATE INDEX IF NOT EXISTS idx_what_purchased_amount
ON purchases(what_purchased, amount_rub);

-- 5. Индекс для amount_rub (KPI запросы)
CREATE INDEX IF NOT EXISTS idx_amount_rub
ON purchases(amount_rub);

-- 6. Индекс для quantity (KPI запросы)
CREATE INDEX IF NOT EXISTS idx_quantity
ON purchases(quantity);

-- Обновить статистику
ANALYZE purchases;
