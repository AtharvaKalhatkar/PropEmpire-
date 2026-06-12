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
  
  const columnsCount = Object.keys(rows[0]).length;
  
  // Row 1: Company Brand
  worksheet.mergeCells(1, 1, 1, columnsCount);
  const brandCell = worksheet.getCell(1, 1);
  brandCell.value = 'PROP EMPIRE';
  brandCell.font = { name: 'Segoe UI', size: 22, bold: true, color: { argb: 'FF0F172A' } }; // Deep Navy
  brandCell.alignment = { horizontal: 'left', vertical: 'middle' };
  worksheet.getRow(1).height = 35;

  // Row 2: Report Title
  worksheet.mergeCells(2, 1, 2, columnsCount);
  const titleCell = worksheet.getCell(2, 1);
  titleCell.value = `${sheetName.toUpperCase()} REPORT`;
  titleCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFD4AF37' } }; // Champagne Gold
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // Row 3: Metadata
  worksheet.mergeCells(3, 1, 3, columnsCount);
  const dateCell = worksheet.getCell(3, 1);
  dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
  dateCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } }; // Slate Gray
  dateCell.alignment = { horizontal: 'left', vertical: 'middle' };
  worksheet.getRow(3).height = 20;

  // Setup Native Excel Table
  const keys = Object.keys(rows[0]);
  
  // Create table columns
  const tableColumns = keys.map(k => ({
    name: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    filterButton: true
  }));

  // Create table rows (array of arrays)
  const tableRows = rows.map(row => keys.map(key => row[key] == null ? '' : row[key]));

  worksheet.addTable({
    name: 'ExportTable',
    ref: 'A4',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2', // Professional blue table style with zebra striping
      showRowStripes: true,
    },
    columns: tableColumns,
    rows: tableRows
  });

  // Freeze top panes so headers are always visible when scrolling
  worksheet.views = [{ showGridLines: false, state: 'frozen', xSplit: 0, ySplit: 4 }];

  // Auto-fit columns dynamically based on content length
  // Auto-fit columns dynamically based on content length
  worksheet.columns = keys.map((key, index) => {
    let maxLength = tableColumns[index].name.length;
    tableRows.forEach(row => {
      const cellValue = row[index] ? row[index].toString() : '';
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    return { width: maxLength < 15 ? 15 : maxLength > 50 ? 50 : maxLength + 5 };
  });

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

export const parseImportedXlsx = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheet found.");

  const data = [];
  let headerRowIndex = -1;
  let headers = [];

  worksheet.eachRow((row, rowNumber) => {
    // exceljs row.values is 1-indexed array
    const rowValues = row.values.slice(1);
    
    // Attempt to find headers automatically: look for row with 'Name' or 'Phone' or 'Email'
    if (headerRowIndex === -1) {
      const textValues = rowValues.map(v => (v ? v.toString().toLowerCase().trim() : ''));
      if (textValues.some(v => v.includes('name') || v.includes('phone') || v.includes('email') || v.includes('mobile') || v.includes('client'))) {
        headerRowIndex = rowNumber;
        headers = textValues;
        return;
      }
    }

    if (headerRowIndex !== -1 && rowNumber > headerRowIndex) {
      const rowData = {};
      headers.forEach((header, index) => {
        if (!header) return;
        const cell = row.getCell(index + 1);
        let value = cell.value;
        // Extract text if it's rich text or hyperlink
        if (value && typeof value === 'object') {
           if (value.richText) value = value.richText.map(rt => rt.text).join('');
           else if (value.text) value = value.text;
           else if (value.hyperlink) value = value.hyperlink;
        }
        rowData[header] = value;
      });
      
      // Only push if there's actual data
      if (Object.values(rowData).some(v => v != null && v !== '')) {
        data.push(rowData);
      }
    }
  });

  return { headers, data };
};