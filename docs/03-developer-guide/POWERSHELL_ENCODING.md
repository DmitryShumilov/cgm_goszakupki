# 🔧 Настройка кодировки UTF-8 для PowerShell 7

## Проблема

При запуске PowerShell скриптов с русским текстом возникают ошибки кодировки:
```
РўРµСЃС‚ РєРѕРґРёСЂРѕРІРєРё UTF-8  ← вместо "Тест кодировки UTF-8"
```

## Причина

1. **Qwen Code** записывает файлы в UTF-8 без BOM
2. **PowerShell 7** может неправильно интерпретировать UTF-8 без BOM
3. **Консоль Windows** использует другую кодовую страницу (866 или 1251)

---

## ✅ Решение для разработчиков

### Шаг 1: Настройте PowerShell 7

Откройте профиль PowerShell:
```powershell
notepad $PROFILE
```

Добавьте следующие строки:

```powershell
# Принудительная UTF-8 кодировка для консоли
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Кодировка по умолчанию для команд записи
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Get-Content:Encoding'] = 'utf8'

# Установить кодовую страницу UTF-8 для консоли
chcp 65001 | Out-Null
```

### Шаг 2: Используйте UTF-8 с BOM для .ps1 файлов

Для создания скрипта с правильной кодировкой:

```powershell
# Способ 1: Через Out-File с BOM
$content = @"
Write-Host "Привет, мир!"
"@
$content | Out-File -FilePath "script.ps1" -Encoding utf8BOM

# Способ 2: Через .NET с BOM
$content = "Write-Host `"Привет, мир!`""
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("$PWD\script.ps1", $content, $utf8BOM)
```

### Шаг 3: Проверка кодировки файла

```powershell
# Проверка кодировки файла
function Get-FileEncoding {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        return "UTF-8 with BOM"
    } elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        return "UTF-16 LE"
    } else {
        return "UTF-8 without BOM (or other)"
    }
}

Get-FileEncoding "script.ps1"
```

---

## 🛠 Решение для Qwen Code (ИИ-ассистента)

При создании PowerShell скриптов с русским текстом:

### Вариант 1: Избегать русских символов в строковых литералах

```powershell
# ✅ Хорошо - английский текст
Write-Host "[OK] Success" -ForegroundColor Green
Write-Host "[FAIL] Error" -ForegroundColor Red

# ❌ Плохо - русский текст (может вызвать проблемы)
Write-Host "[OK] Успех" -ForegroundColor Green
```

### Вариант 2: Использовать скрипт конвертации

После создания файлов запустите:

```powershell
.\convert_to_utf8bom.ps1
```

Этот скрипт конвертирует все .ps1 файлы в UTF-8 с BOM.

---

## 📋 Чеклист для проекта

При создании/редактировании PowerShell скриптов:

- [ ] Скрипт сохранён в **UTF-8 с BOM**
- [ ] В профиле PowerShell настроена UTF-8 кодировка
- [ ] Консоль использует кодовую страницу 65001 (UTF-8)
- [ ] Тестовый запуск показывает русский текст корректно

---

## 🔍 Быстрая диагностика

```powershell
# 1. Проверка кодировки консоли
chcp
# Должно быть: 65001 (UTF-8)

# 2. Проверка OutputEncoding
[Console]::OutputEncoding
# Должно быть: System.Text.UTF8Encoding

# 3. Проверка файла на BOM
$bytes = [System.IO.File]::ReadAllBytes("script.ps1")
$bytes[0..2] -join ","
# Должно быть: 239,187,191 (EF BB BF в hex)
```

---

## 📌 Рекомендации для команды

1. **Все .ps1 файлы** должны быть в UTF-8 с BOM
2. **Настройте VS Code** на сохранение с BOM:
   ```json
   "files.encoding": "utf8bom"
   ```
3. **Добавьте .editorconfig** в проект:
   ```editorconfig
   [*.ps1]
   charset = utf-8-bom
   ```
4. **Используйте `convert_to_utf8bom.ps1`** после создания файлов через ИИ

---

## 🚀 Быстрое исправление для текущих файлов

```powershell
# Конвертировать все .ps1 файлы в UTF-8 с BOM
.\convert_to_utf8bom.ps1
```

---

## 📚 Полезные ссылки

- [PowerShell Encoding Parameters](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding)
- [UTF-8 BOM Explanation](https://en.wikipedia.org/wiki/Byte_order_mark)
- [PowerShell 7 Breaking Changes](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/breaking-changes-ps7?view=powershell-7.4)
