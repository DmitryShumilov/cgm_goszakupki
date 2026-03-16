"""
Чтение логов backend
"""
with open('backend/logs/app.log', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("📊 Последние 50 строк лога:\n")
for line in lines[-50:]:
    print(line.rstrip())
