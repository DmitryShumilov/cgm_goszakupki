"""
Утилиты для обработки названий организаций.

Функции для сокращения организационно-правовых форм в названиях:
- "Общество с ограниченной ответственностью 'БСС'" → "ООО 'БСС'"
- "Акционерное общество 'Губернские аптеки'" → "АО 'Губернские аптеки'"
"""

import re
from functools import lru_cache
from organization_forms import ORG_FORMS_MAPPING


def shorten_organization_name(full_name: str) -> str:
    """
    Сокращает организационно-правовую форму в названии организации.
    
    Args:
        full_name: Полное название организации (например, "Общество с ограниченной 
                   ответственностью 'БСС'")
    
    Returns:
        Сокращённое название (например, "ООО 'БСС'")
    
    Examples:
        >>> shorten_organization_name('Общество с ограниченной ответственностью "БСС"')
        'ООО "БСС"'
        
        >>> shorten_organization_name('Акционерное общество "Губернские аптеки"')
        'АО "Губернские аптеки"'
        
        >>> shorten_organization_name('Индивидуальный предприниматель Иванов А.А.')
        'ИП Иванов А.А.'
    """
    if not full_name or not isinstance(full_name, str):
        return full_name
    
    result = full_name
    
    # Сортируем по длине (сначала самые длинные названия для корректной замены)
    sorted_forms = sorted(
        ORG_FORMS_MAPPING.items(),
        key=lambda x: len(x[0]),
        reverse=True
    )
    
    for full_form, short_form in sorted_forms:
        # Поиск без кавычек (общество с ограниченной ответственностью "БСС")
        pattern = re.compile(
            rf'\b{re.escape(full_form)}\b',
            re.IGNORECASE
        )
        result = pattern.sub(short_form, result, count=1)
    
    # Нормализация регистра первой буквы
    if result:
        result = result[0].upper() + result[1:]
    
    return result


@lru_cache(maxsize=1000)
def shorten_organization_name_cached(full_name: str) -> str:
    """
    Кэшированная версия функции сокращения названия организации.
    
    Использует lru_cache для повышения производительности при обработке
    повторяющихся названий.
    
    Args:
        full_name: Полное название организации
    
    Returns:
        Сокращённое название
    """
    return shorten_organization_name(full_name)


def normalize_organization_name(full_name: str) -> str:
    """
    Нормализует название организации: сокращает ОПФ и приводит к единому формату.
    
    Отличия от shorten_organization_name:
    - Дополнительно удаляет лишние пробелы
    - Заменяет несколько пробелов на один
    - Убирает пробелы перед кавычками
    
    Args:
        full_name: Полное название организации
    
    Returns:
        Нормализованное название
    """
    # Сокращаем ОПФ
    result = shorten_organization_name(full_name)
    
    # Удаляем лишние пробелы
    result = re.sub(r'\s+', ' ', result)
    
    # Убираем пробелы перед кавычками
    result = re.sub(r'\s+["«»\'"]', r'"', result)
    
    # Убираем пробелы после открывающих кавычек
    result = re.sub(r'["«»\'"]\s+', r'"', result)
    
    return result.strip()
