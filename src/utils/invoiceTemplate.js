import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export const BASE_WIDTH = 904;
export const BASE_HEIGHT = 1280;
export const invoiceTemplatePdfSrc = new URL('../../Invoice.pdf', import.meta.url).href;

const POPPINS_REGULAR_SRC = `${import.meta.env.BASE_URL}fonts/Poppins-Regular.ttf`;
const POPPINS_SEMIBOLD_SRC = `${import.meta.env.BASE_URL}fonts/Poppins-SemiBold.ttf`;

export const POSITIONS = {
  invoiceNo: { x: 130, y: 170 },
  date: { x: 463, y: 170 },

  billedToName: { x: 95, y: 190 },
  gstin: { x: 105, y: 230 },

  customerName: { x: 250, y: 390 },
  projectName: { x: 250, y: 403 },
  towerName: { x: 250, y: 416 },
  flatNo: { x: 250, y: 428 },
  agreementValue: { x: 250, y: 441 },
  brokerageNumber: { x: 250, y: 454 },
  executiveBonusParticular: { x: 445, y: 525 },

  taxRate: { x: 390, y: 472 },

  brokerageAmount: { x: 440, y: 455 },
  subtotalAmount: { x: 440, y: 472 },
  executiveBonus: { x: 250, y: 500 },
  totalAmount: { x: 440, y: 550 },
  amountInWords: { x: 200, y: 574 },

  bankFavouringName: { x: 400, y: 950 },
  reraName: { x: 400, y: 980 },

  accountType: { x: 290, y: 1110 },
  accountNo: { x: 290, y: 1140 },
  ifscCode: { x: 290, y: 1170 },
};

export const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ',
    'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ',
    'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    const arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!arr) return '';
    let str = '';
    str += arr[1] != 0 ? (a[Number(arr[1])] || b[arr[1][0]] + ' ' + a[arr[1][1]]) + 'Crore ' : '';
    str += arr[2] != 0 ? (a[Number(arr[2])] || b[arr[2][0]] + ' ' + a[arr[2][1]]) + 'Lakh ' : '';
    str += arr[3] != 0 ? (a[Number(arr[3])] || b[arr[3][0]] + ' ' + a[arr[3][1]]) + 'Thousand ' : '';
    str += arr[4] != 0 ? (a[Number(arr[4])] || b[arr[4][0]] + ' ' + a[arr[4][1]]) + 'Hundred ' : '';
    str += arr[5] != 0 ? ((str !== '') ? 'and ' : '') + (a[Number(arr[5])] || b[arr[5][0]] + ' ' + a[arr[5][1]]) : '';
    return str.trim() + ' Only';
  };

  return inWords(Math.round(num));
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB');
};

export const formatINR = (value) => {
  const numericValue = Math.round(Number(value)) || 0;
  return numericValue.toLocaleString('en-IN');
};

const buildPdfTextFields = (data, profile, brokerageAmount, totalAmount, executiveBonus = 0) => ({
  invoiceNo: data.invoiceNo || '',
  date: formatDate(data.date),
  billedToName: data.billedToName || data.customerName || '',
  gstin: data.billedToGstin || '',
  customerName: data.customerName || '',
  projectName: data.projectName || '',
  towerName: data.tower || '',
  flatNo: data.flatNo || '',
  agreementValue: data.agreementValue ? `${formatINR(data.agreementValue)} /-` : '',
  brokerageNumber: data.brokeragePercent != null && data.brokeragePercent !== '' ? `${data.brokeragePercent} %` : '',
  executiveBonusParticular: executiveBonus > 0 ? `${formatINR(executiveBonus)} /-` : '',
  taxRate: data.brokeragePercent != null && data.brokeragePercent !== '' ? `${data.brokeragePercent} %` : '',
  brokerageAmount: `${formatINR(brokerageAmount)} /-`,
  subtotalAmount: `${formatINR(brokerageAmount)} /-`,
  executiveBonus: executiveBonus > 0 ? `${formatINR(executiveBonus)} /-` : '',
  totalAmount: `${formatINR(totalAmount)} /-`,
  amountInWords: numberToWords(totalAmount),
  bankFavouringName: profile?.bankFavouringName || profile?.agentName || '',
  reraName: profile?.agentName || '',
  accountType: profile?.accountType || '',
  accountNo: profile?.accountNo || '',
  ifscCode: profile?.ifscCode || '',
});

export const generateInvoicePdfBlob = async ({ data = {}, profile = {}, brokerageAmount = 0, totalAmount = 0, executiveBonus = 0 }) => {
  const response = await fetch(invoiceTemplatePdfSrc);
  if (!response.ok) {
    throw new Error('Unable to load Invoice.pdf template');
  }

  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  console.log({
    pageWidth: width,
    pageHeight: height,
    scale: 1,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
  });

  const [regularFontResponse, semiBoldFontResponse] = await Promise.all([
    fetch(POPPINS_REGULAR_SRC),
    fetch(POPPINS_SEMIBOLD_SRC),
  ]);

  if (!regularFontResponse.ok || !semiBoldFontResponse.ok) {
    throw new Error('Unable to load Poppins font files');
  }

  const [regularFontBytes, semiBoldFontBytes] = await Promise.all([
    regularFontResponse.arrayBuffer(),
    semiBoldFontResponse.arrayBuffer(),
  ]);

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(semiBoldFontBytes);
  const fields = buildPdfTextFields(data, profile, brokerageAmount, totalAmount, executiveBonus);

  const drawField = (key, options = {}) => {
    const value = fields[key];
    if (!value) return;

    const fontSize = options.fontSize || 14;
    page.drawText(value, {
      x: POSITIONS[key].x,
      y: height - POSITIONS[key].y - fontSize * 0.85,
      size: fontSize,
      font: options.bold === false ? regularFont : boldFont,
      color: rgb(0, 0, 0),
      maxWidth: options.maxWidth,
      lineHeight: options.lineHeight,
    });
  };

  drawField('invoiceNo', { fontSize: 10, bold: true });
  drawField('date', { fontSize: 10, bold: true });
  drawField('billedToName', { fontSize: 12, bold: false, maxWidth: 500 });
  drawField('gstin', { fontSize: 10, bold: false, maxWidth: 500 });
  drawField('customerName', { fontSize: 10, bold: false, maxWidth: 220 });
  drawField('projectName', { fontSize: 10, bold: false, maxWidth: 220 });
  drawField('towerName', { fontSize: 9, bold: false, maxWidth: 220 });
  drawField('flatNo', { fontSize: 9, bold: false, maxWidth: 220 });
  drawField('agreementValue', { fontSize: 9, bold: false, maxWidth: 220 });
  drawField('brokerageNumber', { fontSize: 9, bold: false, maxWidth: 220 });
  drawField('executiveBonusParticular', { fontSize: 12, bold: true, maxWidth: 220 });
  drawField('taxRate', { fontSize: 10, bold: true, maxWidth: 90 });
  drawField('brokerageAmount', { fontSize: 9, bold: true, maxWidth: 120 });
  drawField('subtotalAmount', { fontSize: 9, bold: true, maxWidth: 120 });
  drawField('executiveBonus', { fontSize: 9, bold: false, maxWidth: 120 });
  drawField('totalAmount', { fontSize: 13, bold: true, maxWidth: 120 });
  drawField('amountInWords', { fontSize: 9, bold: true, maxWidth: 600 });
  drawField('bankFavouringName', { fontSize: 14, bold: true, maxWidth: 320 });
  drawField('reraName', { fontSize: 14, bold: true, maxWidth: 320 });
  drawField('accountType', { fontSize: 14, bold: true, maxWidth: 260 });
  drawField('accountNo', { fontSize: 14, bold: true, maxWidth: 260 });
  drawField('ifscCode', { fontSize: 14, bold: true, maxWidth: 260 });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};
