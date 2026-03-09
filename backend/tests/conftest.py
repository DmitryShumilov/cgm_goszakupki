"""
Фикстуры для тестирования API
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from contextlib import contextmanager
import sys
import os

# Добавляем backend в path для импорта
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, cache


@pytest.fixture
def client():
    """Создаёт тестовый клиент FastAPI"""
    # Отключаем shutdown handler для тестов
    with patch('main.connection_pool', None):
        with TestClient(app) as client:
            yield client


@pytest.fixture
def mock_db_cursor():
    """Фикстура для мока курсора БД через patch get_db_cursor"""
    with patch('main.get_db_cursor') as mock_get_cursor:
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = {}
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_get_cursor.return_value = mock_cursor
        yield mock_get_cursor, mock_cursor


@pytest.fixture
def mock_db_with_data():
    """Фикстура для мока БД с тестовыми данными"""
    with patch('main.get_db_cursor') as mock_get_cursor:
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = {}
        mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
        mock_cursor.__exit__ = MagicMock(return_value=False)
        mock_get_cursor.return_value = mock_cursor
        yield mock_get_cursor, mock_cursor


@pytest.fixture
def clear_cache():
    """Фикстура для очистки кэша перед тестом"""
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def sample_kpi_data():
    """Пример данных KPI для тестов"""
    return {
        'total_amount': 15000000000.0,
        'contract_count': 1250,
        'avg_contract_amount': 12000000.0,
        'total_quantity': 50000.0,
        'avg_price_per_unit': 300000.0,
        'customer_count': 45
    }


@pytest.fixture
def sample_dynamics_data():
    """Пример данных динамики для тестов"""
    return [
        {'purchase_month': '2024-01', 'amount': 1000000.0, 'quantity': 100},
        {'purchase_month': '2024-02', 'amount': 1500000.0, 'quantity': 150},
        {'purchase_month': '2024-03', 'amount': 2000000.0, 'quantity': 200},
    ]


@pytest.fixture
def sample_regions_data():
    """Пример данных регионов для тестов"""
    return [
        {'region': 'Москва', 'amount': 5000000.0, 'count': 100},
        {'region': 'Санкт-Петербург', 'amount': 3000000.0, 'count': 75},
        {'region': 'Казань', 'amount': 2000000.0, 'count': 50},
    ]


@pytest.fixture
def sample_suppliers_data():
    """Пример данных поставщиков для тестов"""
    return [
        {'distributor': 'Поставщик 1', 'amount': 4000000.0},
        {'distributor': 'Поставщик 2', 'amount': 3000000.0},
        {'distributor': 'Поставщик 3', 'amount': 2000000.0},
        {'distributor': 'Поставщик 4', 'amount': 1000000.0},
        {'distributor': 'Поставщик 5', 'amount': 500000.0},
    ]
