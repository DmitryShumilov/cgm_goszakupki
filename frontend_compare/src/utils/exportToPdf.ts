import html2pdf from 'html2pdf.js';

export interface ExportOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  margin?: number;
}

const defaultOptions: ExportOptions = {
  filename: 'cgm_comparison_dashboard.pdf',
  orientation: 'landscape',  // ✅ Альбомная ориентация по умолчанию
  quality: 100,
  margin: 10,  // ✅ Увеличенный отступ для лучшей читаемости
};

export const exportToPdf = async (
  element: HTMLElement,
  options: ExportOptions = defaultOptions
): Promise<void> => {
  // ✅ Сохраняем оригинальный фон
  const originalBackground = element.style.background;
  const originalColor = element.style.color;

  // ✅ Принудительно устанавливаем тёмный фон для экспорта
  element.style.background = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
  element.style.color = '#ffffff';

  const opt = {
    margin: options.margin ?? defaultOptions.margin,
    filename: options.filename ?? defaultOptions.filename,
    image: {
      type: 'jpeg',
      quality: options.quality ?? defaultOptions.quality,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      // ✅ Принудительная отрисовка фона
      backgroundColor: '#0f0c29',
      // ✅ Игнорируем элементы с классом .hide-for-export
      ignoreElements: (element: HTMLElement) => {
        return element.classList?.contains('hide-for-export') ?? false;
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options.orientation ?? defaultOptions.orientation,
    },
    // ✅ Настройки для разделения страниц
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.pdf-page-break-before',
      after: '.pdf-page-break-after',
    },
  };

  try {
    // ✅ Добавляем классы для разделения страниц перед экспортом
    const filtersSection = element.querySelector('.filters-section');
    const kpiSection = element.querySelector('.kpi-section');

    if (filtersSection) {
      filtersSection.classList.add('pdf-page-break-after');
    }
    if (kpiSection) {
      kpiSection.classList.add('pdf-page-break-after');
    }

    await html2pdf().set(opt).from(element).save();
    console.log('✅ PDF exported successfully');

    // ✅ Удаляем классы после экспорта
    if (filtersSection) {
      filtersSection.classList.remove('pdf-page-break-after');
    }
    if (kpiSection) {
      kpiSection.classList.remove('pdf-page-break-after');
    }
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    throw error;
  } finally {
    // ✅ Восстанавливаем оригинальные стили
    element.style.background = originalBackground;
    element.style.color = originalColor;
  }
};

export const exportElementById = (
  elementId: string,
  options: ExportOptions = defaultOptions
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }
  return exportToPdf(element, options);
};
