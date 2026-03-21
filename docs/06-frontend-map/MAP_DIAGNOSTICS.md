# 🔧 Диагностика карты

**Проблема:** Карта не отображается, виден только фон

---

## ✅ Что исправлено

1. **z-index** — Карта теперь имеет `z-index: 1`, элементы интерфейса `1000+`
2. **position: absolute** — Контейнер карты позиционируется абсолютно
3. **height: 100%** — Все родительские элементы имеют 100% высоту
4. **overflow: hidden** — Предотвращает прокрутку

---

## 🔍 Проверка в браузере

### 1. Откройте консоль разработчика

**Нажмите:** `F12` или `Ctrl+Shift+I`

### 2. Проверьте консоль (Console)

**Ожидаемые сообщения:**
```
GeoJSON loaded: 87 features
Rendering map with 87 features
```

**Если ошибки:**
- `Failed to load GeoJSON` — проверьте наличие файла `simple_map.geojson`
- `L is not defined` — проблема с Leaflet

### 3. Проверьте сеть (Network)

**Вкладка Network → отфильтруйте по "geojson"**

| Файл | Статус | Размер |
|------|--------|--------|
| `simple_map.geojson` | 200 OK | ~50 MB |

**Если 404:** Файл не найден в `public/`

### 4. Проверьте элементы (Elements)

**Вкладка Elements → найдите:**

```html
<div class="map-wrapper">
  <header>...</header>
  <div class="leaflet-container" id="...">
    <div class="leaflet-pane">
      <svg>...</svg>  ← SVG с путями регионов
    </div>
  </div>
  <div class="map-legend">...</div>
</div>
```

**Проверьте стили:**
- `.map-wrapper` → `height: 100vh`
- `.map-container` → `position: absolute; z-index: 1`
- `.leaflet-container` → `height: 100%; width: 100%`

---

## 🎯 Быстрая проверка

### Вставьте в консоль браузера:

```javascript
// Проверка загрузки GeoJSON
fetch('/simple_map.geojson')
  .then(r => r.json())
  .then(d => console.log('GeoJSON features:', d.features?.length))
  .catch(e => console.error('Error:', e));

// Проверка Leaflet контейнера
console.log('Leaflet container:', document.querySelector('.leaflet-container'));
console.log('SVG paths:', document.querySelectorAll('.leaflet-interactive').length);
```

**Ожидаемый результат:**
```
GeoJSON features: 87
Leaflet container: <div class="leaflet-container">
SVG paths: 87
```

---

## ⚠️ Возможные проблемы и решения

### Проблема 1: Карта за пределами видимости

**Симптом:** Видна только надпись "Загрузка карты..."

**Решение:**
```css
/* В browser console */
document.querySelector('.map-container').style.display = 'block';
document.querySelector('.map-container').style.position = 'absolute';
document.querySelector('.map-container').style.top = '0';
document.querySelector('.map-container').style.left = '0';
document.querySelector('.map-container').style.width = '100%';
document.querySelector('.map-container').style.height = '100%';
```

---

### Проблема 2: SVG пути не видны

**Симптом:** Контейнер есть, путей нет

**Причина:** Белый цвет на белом фоне или прозрачность 0

**Проверка:**
```javascript
// В консоли
const paths = document.querySelectorAll('.leaflet-interactive');
paths.forEach(p => {
  console.log('Fill:', p.style.fill);
  console.log('Opacity:', p.style.fillOpacity);
});
```

**Решение:** Убедитесь, что `fillOpacity > 0.2`

---

### Проблема 3: GeoJSON не загружается

**Симптом:** "Не удалось загрузить карту"

**Проверка:**
```powershell
# PowerShell
Invoke-WebRequest -Uri 'http://localhost:5174/simple_map.geojson' -UseBasicParsing | Select-Object StatusCode, ContentLength
```

**Ожидаемый результат:**
```
StatusCode ContentLength
---------- -------------
       200        52608035
```

**Если 404:**
```powershell
# Проверка наличия файла
Test-Path 'C:\Dashboards\cgm_goszakupki\frontend_map\public\simple_map.geojson'
```

---

### Проблема 4: Конфликт z-index

**Симптом:** Карта есть, но перекрыта фоном

**Проверка в консоли:**
```javascript
console.log(
  'Map z-index:', 
  getComputedStyle(document.querySelector('.map-container')).zIndex
);
console.log(
  'Background z-index:', 
  getComputedStyle(document.querySelector('.map-wrapper')).zIndex
);
```

**Решение:**
```css
.map-container {
  z-index: 1 !important;
}
```

---

## 📊 Тестовые данные для проверки

**Проверьте окрашивание регионов:**

| Регион | Ожидаемый цвет |
|--------|----------------|
| Москва | Ярко-синий (1.25 млрд ₽) |
| Санкт-Петербург | Синий (850 млн ₽) |
| Регион с суммой 0 | Серый прозрачный |

---

## 🚀 Если ничего не помогает

### Полная перезагрузка:

```powershell
# 1. Остановите сервер
taskkill /F /IM node.exe

# 2. Очистите кэш Vite
cd C:\Dashboards\cgm_goszakupki\frontend_map
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# 3. Перезапустите
npm run dev
```

### Очистка кэша браузера:

1. `Ctrl+Shift+Delete`
2. Выберите "Кэшированные изображения и файлы"
3. Нажмите "Удалить"
4. Обновите страницу: `Ctrl+F5`

---

## 📞 Контрольный список

- [ ] Сервер запущен (порт 5174 LISTENING)
- [ ] GeoJSON загружается (200 OK, ~50 MB)
- [ ] В консоли нет ошибок
- [ ] `.leaflet-container` существует
- [ ] SVG пути присутствуют (87 штук)
- [ ] z-index карты = 1
- [ ] Высота контейнера = 100vh
- [ ] Регионы окрашены (синие/серые)

---

**Дата:** 10 марта 2026 г.
