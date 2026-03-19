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
  margin: 5,
};

export const exportToPdf = async (
  element: HTMLElement,
  options: ExportOptions = defaultOptions
): Promise<void> => {
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
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: options.orientation ?? defaultOptions.orientation,
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    console.log('✅ PDF exported successfully');
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    throw error;
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
