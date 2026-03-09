@echo off
chcp 65001 >nul
title Обновление базы данных CGM Dashboard

echo ============================================================
echo           ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ CGM DASHBOARD
echo ============================================================
echo.
echo  Этот скрипт обновит данные в PostgreSQL из файла database.xlsx
echo.
echo  Время начала: %date% %time%
echo.
echo ============================================================
echo.

:: Переход в директорию скрипта
cd /d "%~dp0"

:: Проверка наличия Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Python не найден! Установите Python 3.14+
    echo.
    pause
    exit /b 1
)

:: Проверка наличия Excel файла
if not exist "database.xlsx" (
    echo [ОШИБКА] Файл database.xlsx не найден!
    echo.
    echo  Поместите файл database.xlsx в папку:
    echo  %~dp0
    echo.
    pause
    exit /b 1
)

:: Запуск скрипта импорта
echo [1/3] Запуск скрипта импорта...
echo.

python import_excel_to_pg.py

if errorlevel 1 (
    echo.
    echo ============================================================
    echo [ОШИБКА] Произошла ошибка при импорте данных!
    echo ============================================================
    echo.
    echo  Проверьте:
    echo  1. Закрыт ли файл Excel
    echo  2. Запущен ли PostgreSQL
    echo  3. Правильно ли указаны параметры в .env
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo           ОБНОВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!
echo ============================================================
echo.
echo  Время завершения: %date% %time%
echo.
echo  Данные обновлены в базе данных PostgreSQL.
echo  Откройте дашборд в браузере и обновите страницу (F5).
echo.
echo ============================================================
echo.
pause
