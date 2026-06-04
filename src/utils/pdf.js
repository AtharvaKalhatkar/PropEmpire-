import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdfBlobFromElement = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }
  
  // Create a high-quality canvas from the DOM element
  // Use scale 2 for crisp text, but save as JPEG to reduce PDF file size drastically
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  return pdf.output('blob');
};

export const downloadPdfBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
