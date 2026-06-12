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
  
  // Row 1: Professional Title Banner
  worksheet.mergeCells(1, 1, 1, columnsCount);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = `PropEmpire - ${sheetName}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate 900
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 35;

  // Row 2: Metadata / Date
  worksheet.mergeCells(2, 1, 2, columnsCount);
  const dateCell = worksheet.getCell(2, 1);
  dateCell.value = `Exported on: ${new Date().toLocaleString()}`;
  dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } }; // Slate 600
  dateCell.alignment = { horizontal: 'right', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // Row 3: Spacer
  worksheet.getRow(3).height = 10;

  // Setup columns
  const keys = Object.keys(rows[0]);
  worksheet.columns = keys.map((key) => ({ key, width: 20 }));

  // Row 4: Headers
  const headerRow = worksheet.getRow(4);
  // Format camelCase to Title Case (e.g. clientName -> Client Name)
  headerRow.values = keys.map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;
  
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }; // Slate 700
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };
  });

  // Freeze top panes so headers are always visible when scrolling
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // Add Data Rows with Zebra Striping
  rows.forEach((row, index) => {
    const newRow = worksheet.addRow(row);
    newRow.height = 22;
    
    const isEven = index % 2 === 0;
    const bgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF'; // Slate 50 / Pure White

    newRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
      // Try to format numbers if applicable
      if (!isNaN(cell.value) && cell.value !== '') {
        cell.alignment.horizontal = 'right';
      }
    });
  });

  // Auto-fit columns dynamically based on content length
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 15 ? 15 : maxLength > 40 ? 40 : maxLength + 4;
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