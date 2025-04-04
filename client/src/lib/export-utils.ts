import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to CSV
 * @param data Array of objects to export
 * @param filename Filename to save as (without extension)
 */
export function exportToCSV(data: any[], filename: string): string {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  // Create a blob and download
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
  
  return csvOutput;
}

/**
 * Export data to Excel
 * @param data Array of objects to export
 * @param filename Filename to save as (without extension)
 * @param sheetName Optional sheet name
 */
export function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1'): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Format data for PDF export
 * This is to prepare data for rendering in PDF components
 * @param data Array of objects to export
 */
export function formatDataForPDF(data: any[]): { headers: string[], rows: string[][] } {
  if (data.length === 0) return { headers: [], rows: [] };
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Extract rows
  const rows = data.map(item => headers.map(header => String(item[header] || '')));
  
  return { headers, rows };
}