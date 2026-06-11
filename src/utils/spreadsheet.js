import ExcelJS from 'exceljs';

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCsvValue = (value) => {
  const text = value == null ? '' : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const exportRowsToXlsx = async ({ rows, sheetName, fileName }) => {
  if (!rows.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 20 }));
  rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, fileName);
};

export const exportRowsToCsv = ({ rows, fileName }) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ];

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, fileName);
};