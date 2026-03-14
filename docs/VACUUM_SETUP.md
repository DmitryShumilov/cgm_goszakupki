# 📅 Настройка авто-VACUUM для PostgreSQL

## Обзор

Этот документ описывает настройку автоматического выполнения VACUUM ANALYZE для базы данных PostgreSQL проекта CGM Dashboard.

---

## 📋 Содержание

1. [Быстрая настройка](#быстрая-настройка)
2. [Настройка через Планировщик заданий Windows](#настройка-через-планировщик-заданий-windows)
3. [Настройка через pg_cron (расширение)](#настройка-через-pg_cron-расширение)
4. [Мониторинг и логи](#мониторинг-и-логи)
5. [Рекомендации](#рекомендации)

---

## Быстрая настройка

### Вариант 1: Планировщик заданий Windows (рекомендуется)

**Время настройки:** 5 минут

1. Откройте **Планировщик заданий** (Task Scheduler)
2. Создайте простую задачу:
   - **Имя:** `CGM Dashboard - PostgreSQL VACUUM`
   - **Триггер:** Еженедельно, воскресенье, 03:00
   - **Действие:** Запуск программы
   - **Программа:** `powershell.exe`
   - **Аргументы:** `-ExecutionPolicy Bypass -File "C:\Dashboards\cgm_goszakupki\run_vacuum.ps1"`
   - **Рабочая папка:** `C:\Dashboards\cgm_goszakupki`

### Вариант 2: pg_cron расширение

**Время настройки:** 15 минут

1. Установите расширение pg_cron:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. Создайте задачу VACUUM:
   ```sql
   SELECT cron.schedule(
     'weekly-vacuum',        -- имя задачи
     '0 3 * * 0',            -- каждое воскресенье в 03:00
     'VACUUM ANALYZE'        -- команда
   );
   ```

3. Проверьте расписание:
   ```sql
   SELECT * FROM cron.job;
   ```

---

## Настройка через Планировщик заданий Windows

### Пошаговая инструкция

#### Шаг 1: Открытие Планировщика заданий

1. Нажмите `Win + R`
2. Введите `taskschd.msc`
3. Нажмите Enter

#### Шаг 2: Создание задачи

1. В правой панели выберите **"Создать простую задачу..."**
2. Введите имя: `CGM Dashboard - PostgreSQL VACUUM`
3. Нажмите **Далее**

#### Шаг 3: Настройка триггера

1. Выберите **"Еженедельно"**
2. Нажмите **Далее**
3. Выберите:
   - **День:** Воскресенье
   - **Время:** 03:00
4. Нажмите **Далее**

#### Шаг 4: Настройка действия

1. Выберите **"Запустить программу"**
2. Нажмите **Далее**
3. Заполните поля:
   - **Программа или сценарий:** `powershell.exe`
   - **Добавить аргументы:** `-ExecutionPolicy Bypass -File "C:\Dashboards\cgm_goszakupki\run_vacuum.ps1"`
   - **Начать в:** `C:\Dashboards\cgm_goszakupki`
4. Нажмите **Далее**

#### Шаг 5: Дополнительные настройки

1. Откройте свойства созданной задачи
2. На вкладке **"Общие"**:
   - ✅ **"Выполнять вне зависимости от входа пользователя в систему"**
   - ✅ **"Выполнять с наивысшими правами"**
3. На вкладке **"Условия"**:
   - ❌ Снимите галочку **"Запускать только при питании от электросети"** (для серверов)
4. На вкладке **"Параметры"**:
   - ✅ **"Разрешить запуск задачи по требованию"**
   - ✅ **"Если задача не была запущена..."** установите 1 час

---

## Настройка через pg_cron (расширение)

### Требования

- PostgreSQL 10+
- Права суперпользователя
- Расширение pg_cron

### Установка pg_cron

#### Windows

1. Скачайте pg_cron для вашей версии PostgreSQL:
   - https://github.com/citusdata/pg_cron/releases

2. Скопируйте файлы в директорию PostgreSQL:
   ```
   C:\Program Files\PostgreSQL\17\
   ```

3. Добавьте в `postgresql.conf`:
   ```conf
   shared_preload_libraries = 'pg_cron'
   cron.database_name = 'postgres'
   ```

4. Перезапустите PostgreSQL:
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" restart -D "C:\pg_data"
   ```

### Создание задачи VACUUM

```sql
-- Подключение к базе данных
\c cgm_dashboard

-- Создание расширения (если не создано)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Планирование еженедельного VACUUM
SELECT cron.schedule(
  'weekly-vacuum',        -- Уникальное имя задачи
  '0 3 * * 0',            -- Cron выражение: каждое воскресенье в 03:00
  'VACUUM ANALYZE'        -- SQL команда
);

-- Проверка расписания
SELECT * FROM cron.job;

-- Проверка истории выполнения
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Управление задачами

```sql
-- Отменить задачу
SELECT cron.unschedule('weekly-vacuum');

-- Изменить расписание (удалить и создать заново)
SELECT cron.unschedule('weekly-vacuum');
SELECT cron.schedule(
  'weekly-vacuum',
  '0 2 * * *',            -- Каждый день в 02:00
  'VACUUM ANALYZE'
);

-- Просмотр всех задач
SELECT * FROM cron.job;

-- Просмотр логов выполнения
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-vacuum')
ORDER BY start_time DESC;
```

---

## Мониторинг и логи

### Логи скрипта

Скрипт `run_vacuum.ps1` создаёт логи в папке `logs/`:

```
logs/
├── vacuum_20260314_030000.log
├── vacuum_20260321_030000.log
└── ...
```

### Проверка выполнения VACUUM

```sql
-- Проверка последнего VACUUM
SELECT 
    schemaname,
    relname,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
```

### Статистика по таблицам

```sql
-- Размер таблиц до и после VACUUM
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS data_size,
    n_dead_tup AS dead_tuples,
    n_live_tup AS live_tuples
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## Рекомендации

### Частота выполнения

| Размер БД | Частота | Время |
|-----------|---------|-------|
| < 1 GB | Еженедельно | Воскресенье 03:00 |
| 1-10 GB | 2 раза в неделю | Среда, Воскресенье 03:00 |
| > 10 GB | Ежедневно | 03:00 |

### Для проекта CGM Dashboard

**Текущий размер БД:** ~5-10 MB  
**Прогноз роста:** 50-100 записей/месяц  
**Рекомендация:** **Еженедельный VACUUM** (воскресенье 03:00)

### Автоматический VACUUM PostgreSQL

PostgreSQL имеет встроенный авто-VACUUM:

```sql
-- Проверка настроек авто-VACUUM
SHOW autovacuum;
SHOW autovacuum_vacuum_threshold;
SHOW autovacuum_analyze_threshold;
```

**Настройки по умолчанию:**
- `autovacuum = on`
- `autovacuum_vacuum_threshold = 50`
- `autovacuum_analyze_threshold = 50`

Для небольших БД (< 1 GB) встроенного авто-VACUUM достаточно.

### Когда нужен дополнительный VACUUM

- ✅ После массового импорта данных
- ✅ После удаления большого количества записей
- ✅ Перед созданием резервной копии
- ✅ Для оптимизации производительности

---

## Скрипты

### run_vacuum.ps1

Скрипт для выполнения VACUUM ANALYZE.

**Использование:**
```powershell
.\run_vacuum.ps1
```

**Параметры:**
- `-host` — хост PostgreSQL (по умолчанию: localhost)
- `-port` — порт PostgreSQL (по умолчанию: 5432)
- `-user` — пользователь (по умолчанию: postgres)
- `-database` — база данных (по умолчанию: cgm_dashboard)

### Проверка работы

```powershell
# Ручной запуск
.\run_vacuum.ps1

# Проверка логов
Get-Content logs\vacuum_*.log -Tail 20
```

---

## Контакты

По вопросам настройки обращайтесь к команде разработки.

**Последнее обновление:** 14 марта 2026
