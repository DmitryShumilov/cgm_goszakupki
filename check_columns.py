import pandas as pd

xl = pd.ExcelFile(r'database.xlsx')
df = pd.read_excel(xl, xl.sheet_names[0])

print("=== ТОЧНЫЕ НАЗВАНИЯ КОЛОНОК ===")
for i, col in enumerate(df.columns):
    print(f"{i:2}. '{col}'")

# Проверяем колонки с "количество" и "сумма"
print("\n=== КОЛОНКИ СО СЛОВОМ 'КОЛИЧЕСТВО' ИЛИ 'СУММА' ===")
for col in df.columns:
    if 'колич' in col.lower() or 'сумм' in col.lower():
        print(f"  '{col}'")
