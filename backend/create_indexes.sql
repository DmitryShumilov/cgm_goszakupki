-- Индексы для оптимизации запросов дашборда CGM
-- Запуск: psql -U postgres -d cgm_dashboard -f create_indexes.sql

-- Индекс для фильтрации по годам и месяцам
CREATE INDEX IF NOT EXISTS idx_purchase_year
ON purchases(year);

CREATE INDEX IF NOT EXISTS idx_purchase_month
ON purchases(purchase_month);

-- Индекс для фильтрации по дате закупки
CREATE INDEX IF NOT EXISTS idx_purchase_date
ON purchases(purchase_date);

-- Индекс для фильтрации по регионам
CREATE INDEX IF NOT EXISTS idx_region
ON purchases(region);

-- Индекс для фильтрации по заказчикам
CREATE INDEX IF NOT EXISTS idx_customer_name
ON purchases(customer_name);

-- Индекс для фильтрации по поставщикам
CREATE INDEX IF NOT EXISTS idx_distributor
ON purchases(distributor);

-- Индекс для фильтрации по товарам
CREATE INDEX IF NOT EXISTS idx_what_purchased
ON purchases(what_purchased);

-- Комбинированный индекс для частых запросов (регион + сумма)
CREATE INDEX IF NOT EXISTS idx_region_amount
ON purchases(region, amount_rub);

-- Комбинированный индекс для запросов по поставщикам
CREATE INDEX IF NOT EXISTS idx_distributor_amount
ON purchases(distributor, amount_rub);

-- Индекс для группировки по месяцам и годам
CREATE INDEX IF NOT EXISTS idx_purchase_month_year
ON purchases(EXTRACT(YEAR FROM purchase_date), EXTRACT(MONTH FROM purchase_date));

-- Индекс для heat map запроса (топ-20 товаров)
CREATE INDEX IF NOT EXISTS idx_what_purchased_amount
ON purchases(what_purchased, amount_rub);

-- Обновить статистику после создания индексов
ANALYZE purchases;
