import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Check if running inside a native Capacitor app (Android/iOS).
 */
const isNative = () => Capacitor.isNativePlatform();

/**
 * Convert a Blob to a base64 data string (without the data URI prefix).
 */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.split(',')[1];
      if (base64) resolve(base64);
      else reject(new Error('Failed to convert blob to base64'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/**
 * Generate a PDF blob from a DOM element using html2canvas + jsPDF.
 */
export const generatePdfBlobFromElement = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/jpeg', 0.85);

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  return pdf.output('blob');
};

/**
 * Download / save a PDF blob.
 * - On web: creates a temporary <a> link and triggers download.
 * - On native (Capacitor): writes to device storage and opens with Share sheet.
 */
export const downloadPdfBlob = async (blob, fileName) => {
  if (isNative()) {
    try {
      const base64Data = await blobToBase64(blob);
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Open the file using the native share sheet so the user can
      // view it in any PDF reader, save it, or forward it.
      await Share.share({
        title: fileName,
        url: result.uri,
        dialogTitle: 'Open Invoice PDF',
      });
    } catch (err) {
      console.error('Native PDF save/share failed:', err);
      // Fallback: try the web approach anyway
      webDownload(blob, fileName);
    }
  } else {
    webDownload(blob, fileName);
  }
};

/**
 * View a PDF blob (open in new tab or native viewer).
 * - On web: opens a blob URL in a new tab.
 * - On native: writes to cache and opens via Share.
 */
export const viewPdfBlob = async (blob, fileName = 'Invoice.pdf') => {
  if (isNative()) {
    // On native, we reuse the download+share flow since window.open(blobUrl)
    // does not work in Android WebView.
    await downloadPdfBlob(blob, fileName);
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

/**
 * Internal: standard web download via <a> tag.
 */
function webDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
