/**
 * Форматирование денежного значения
 * @param value - Значение в рублях
 * @returns Отформатированная строка (млрд, млн, тыс)
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} млрд ₽`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} млн ₽`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} тыс ₽`;
  }
  return `${value.toFixed(0)} ₽`;
}

/**
 * Форматирование числа с разделителями
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU');
}

/**
 * Форматирование процента
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Форматирование абсолютного изменения
 */
export function formatAbsoluteChange(value: number, isMoney = false): string {
  const sign = value > 0 ? '+' : '';
  if (isMoney) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${sign}${(Math.abs(value) / 1_000_000_000).toFixed(2)} млрд`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${sign}${(Math.abs(value) / 1_000_000).toFixed(2)} млн`;
    }
    return `${sign}${formatNumber(Math.abs(value))}`;
  }
  return `${sign}${formatNumber(Math.abs(value))}`;
}

/**
 * Получение иконки тренда
 */
export function getTrendIcon(trend: 'growth' | 'decline' | 'stable'): string {
  switch (trend) {
    case 'growth':
      return '📈';
    case 'decline':
      return '📉';
    case 'stable':
      return '➡️';
  }
}

/**
 * Получение цвета тренда
 */
export function getTrendColor(trend: 'growth' | 'decline' | 'stable'): string {
  switch (trend) {
    case 'growth':
      return '#38EF7D';  // Зелёный
    case 'decline':
      return '#FF6B6B';  // Красный
    case 'stable':
      return '#FFD93D';  // Жёлтый
  }
}
