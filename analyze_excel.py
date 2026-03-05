import pandas as pd
import sys
from datetime import datetime

# Устанавливаем UTF-8 вывод
sys.stdout.reconfigure(encoding='utf-8')

# Загрузка данных
xl = pd.ExcelFile('database.xlsx')
df = pd.read_excel(xl, xl.sheet_names[0])

# Переименовываем колонки для удобства работы
col_mapping = {}
for i, col in enumerate(df.columns):
    if 'Заказчик' in col and 'наименование' in col:
        col_mapping[col] = 'customer_name'
    elif 'Регион' in col:
        col_mapping[col] = 'region'
    elif 'Контракт' in col and 'дата' in col and 'Контракт:' in col:
        col_mapping[col] = 'contract_date'
    elif 'Год' in col:
        col_mapping[col] = 'year'
    elif 'сумма' in col.lower() and 'руб' in col.lower():
        col_mapping[col] = 'amount_rub'
    elif 'цена' in col.lower() and 'контракта' in col.lower():
        col_mapping[col] = 'contract_price'
    elif 'цена, руб' in col.lower():
        col_mapping[col] = 'price_rub'
    elif 'количество' in col.lower():
        col_mapping[col] = 'quantity'
    elif 'Дистрибьютор' in col:
        col_mapping[col] = 'distributor'
    elif 'Способ' in col and 'размещения' in col:
        col_mapping[col] = 'procurement_method'
    elif 'ИНН' in col:
        col_mapping[col] = 'inn'
    elif 'КПП' in col:
        col_mapping[col] = 'kpp'
    elif 'Предмет' in col:
        col_mapping[col] = 'subject'
    elif 'Объект закупки' in col and 'наименование' in col:
        col_mapping[col] = 'product_name'
    elif 'Что закупали' in col:
        col_mapping[col] = 'what_purchased'
    elif 'Для кого' in col:
        col_mapping[col] = 'for_whom'
    else:
        col_mapping[col] = f'col_{i}'

df_renamed = df.rename(columns=col_mapping)

# Формирование отчёта
report = []
report.append("=" * 70)
report.append("АНАЛИЗ EXCEL ФАЙЛА: database.xlsx")
report.append("=" * 70)
report.append(f"Дата анализа: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
report.append("")

# Общая информация
report.append("[ОБЩАЯ ИНФОРМАЦИЯ]")
report.append("-" * 50)
report.append(f"Строк данных: {len(df):,}")
report.append(f"Колонок: {len(df.columns)}")
report.append(f"Листов в файле: {xl.sheet_names}")
report.append("")

# Оригинальные названия колонок
report.append("[ОРИГИНАЛЬНЫЕ НАЗВАНИЯ КОЛОНОК (28)]")
report.append("-" * 50)
for i, col in enumerate(df.columns, 1):
    report.append(f"{i:2}. {col}")
report.append("")

# Сопоставление с новыми именами
report.append("[СОПОСТАВЛЕНИЕ КОЛОНОК]")
report.append("-" * 50)
for old, new in col_mapping.items():
    report.append(f"{new:<25} <- {old}")
report.append("")

# Ключевые метрики
report.append("[КЛЮЧЕВЫЕ МЕТРИКИ]")
report.append("-" * 50)

if 'region' in df_renamed.columns:
    report.append(f"Регионы: {df_renamed['region'].nunique()} уникальных")
    
if 'year' in df_renamed.columns:
    years = sorted(df_renamed['year'].dropna().unique())
    report.append(f"Годы в данных: {years}")
    
if 'contract_date' in df_renamed.columns:
    min_date = df_renamed['contract_date'].min()
    max_date = df_renamed['contract_date'].max()
    report.append(f"Диапазон дат контрактов: {min_date} — {max_date}")
    
if 'customer_name' in df_renamed.columns:
    report.append(f"Заказчиков: {df_renamed['customer_name'].nunique()}")
    
if 'distributor' in df_renamed.columns:
    report.append(f"Дистрибьюторов: {df_renamed['distributor'].nunique()}")
    
if 'procurement_method' in df_renamed.columns:
    report.append(f"Способов размещения заказа: {df_renamed['procurement_method'].nunique()}")
report.append("")

# Статистика по числовым полям
report.append("[ЧИСЛОВЫЕ ПОЛЯ - СТАТИСТИКА]")
report.append("-" * 50)
num_cols_map = {
    'contract_price': 'Цена контракта',
    'price_rub': 'цена, руб',
    'quantity': 'количество',
    'amount_rub': 'сумма, руб'
}
for col, desc in num_cols_map.items():
    if col in df_renamed.columns:
        non_null = df_renamed[col].dropna()
        if len(non_null) > 0:
            report.append(f"{desc} ({col}):")
            report.append(f"    min: {non_null.min():,.2f}")
            report.append(f"    max: {non_null.max():,.2f}")
            report.append(f"    mean: {non_null.mean():,.2f}")
            report.append(f"    sum: {non_null.sum():,.2f}")
report.append("")

# Топ заказчиков
if 'customer_name' in df_renamed.columns and 'amount_rub' in df_renamed.columns:
    report.append("[ТОП-10 ЗАКАЗЧИКОВ ПО СУММЕ КОНТРАКТОВ]")
    report.append("-" * 50)
    top_customers = df_renamed.groupby('customer_name')['amount_rub'].sum().nlargest(10)
    for name, value in top_customers.items():
        report.append(f"{value:>15,.2f} ₽ | {name[:60]}")
    report.append("")

# Топ регионов
if 'region' in df_renamed.columns and 'amount_rub' in df_renamed.columns:
    report.append("[ТОП-10 РЕГИОНОВ ПО СУММЕ КОНТРАКТОВ]")
    report.append("-" * 50)
    top_regions = df_renamed.groupby('region')['amount_rub'].sum().nlargest(10)
    for name, value in top_regions.items():
        report.append(f"{value:>15,.2f} ₽ | {name[:50]}")
    report.append("")

# Топ дистрибьюторов
if 'distributor' in df_renamed.columns and 'amount_rub' in df_renamed.columns:
    report.append("[ТОП-10 ДИСТРИБЬЮТОРОВ ПО СУММЕ]")
    report.append("-" * 50)
    top_dist = df_renamed.groupby('distributor')['amount_rub'].sum().nlargest(10)
    for name, value in top_dist.items():
        report.append(f"{value:>15,.2f} ₽ | {name[:50]}")
    report.append("")

# Способ размещения заказа
if 'procurement_method' in df_renamed.columns:
    report.append("[СПОСОБЫ РАЗМЕЩЕНИЯ ЗАКАЗА]")
    report.append("-" * 50)
    ways = df_renamed['procurement_method'].value_counts()
    for way, count in ways.items():
        report.append(f"{count:>6} ({count/len(df_renamed)*100:.1f}%) | {way[:50]}")
    report.append("")

# Динамика по годам
if 'year' in df_renamed.columns and 'amount_rub' in df_renamed.columns:
    report.append("[ДИНАМИКА ПО ГОДАМ]")
    report.append("-" * 50)
    yearly = df_renamed.groupby('year').agg({
        'amount_rub': 'sum',
        'contract_date': 'count'
    }).rename(columns={'contract_date': 'contract_count'})
    for year, row in yearly.iterrows():
        report.append(f"{int(year)}: {row['amount_rub']:>15,.2f} ₽ | {int(row['contract_count']):>4} контрактов")
    report.append("")

# Пропущенные значения
report.append("[ПРОПУЩЕННЫЕ ЗНАЧЕНИЯ >10%]")
report.append("-" * 50)
null_counts = df.isnull().sum()
for col, count in null_counts.items():
    pct = count/len(df)*100
    if pct > 10:
        report.append(f"{count:>6} ({pct:.1f}%) | {col[:50]}")
report.append("")

# Рекомендации для дашборда
report.append("[РЕКОМЕНДАЦИИ ДЛЯ ДАШБОРДА]")
report.append("-" * 50)
report.append("Возможные KPI:")
report.append("  - Общая сумма контрактов")
report.append("  - Количество контрактов")
report.append("  - Средняя цена контракта")
report.append("  - Количество заказчиков")
report.append("  - Количество поставщиков")
report.append("")
report.append("Возможные фильтры:")
report.append("  - По году (year)")
report.append("  - По региону (region)")
report.append("  - По заказчику (customer_name)")
report.append("  - По дистрибьютору (distributor)")
report.append("  - По способу размещения (procurement_method)")
report.append("  - По диапазону дат (contract_date)")
report.append("")
report.append("Возможные графики:")
report.append("  - Динамика контрактов по месяцам/годам")
report.append("  - Топ регионов по сумме")
report.append("  - Топ заказчиков по сумме")
report.append("  - Распределение по способам размещения")
report.append("  - Доля дистрибьюторов на рынке")
report.append("")

report.append("=" * 70)
report.append("КОНЕЦ ОТЧЁТА")
report.append("=" * 70)

# Вывод и сохранение
output = '\n'.join(report)

# Сохраняем в файл
with open('excel_analysis_report.txt', 'w', encoding='utf-8') as f:
    f.write(output)

print(output)
print("\n[OK] Отчёт сохранён в excel_analysis_report.txt")
