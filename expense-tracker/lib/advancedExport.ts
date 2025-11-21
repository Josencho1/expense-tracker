import { Expense, ExpenseCategory } from '@/types/expense';
import { formatDate, formatCurrency, calculateTotalSpending } from './utils';
import jsPDF from 'jspdf';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  categories?: ExpenseCategory[];
  includeAllCategories?: boolean;
}

/**
 * Filter expenses based on export options
 */
export const filterExpensesForExport = (
  expenses: Expense[],
  options: ExportOptions
): Expense[] => {
  let filtered = [...expenses];

  // Filter by date range
  if (options.dateRange?.from && options.dateRange?.to) {
    filtered = filtered.filter(expense => {
      const expenseDate = new Date(expense.date);
      const from = new Date(options.dateRange!.from!);
      const to = new Date(options.dateRange!.to!);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return expenseDate >= from && expenseDate <= to;
    });
  }

  // Filter by categories
  if (!options.includeAllCategories && options.categories && options.categories.length > 0) {
    filtered = filtered.filter(expense => options.categories!.includes(expense.category));
  }

  return filtered;
};

/**
 * Export expenses to CSV format
 */
export const exportToAdvancedCSV = (expenses: Expense[], filename: string): void => {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Created At', 'Updated At'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    expense.category,
    expense.amount.toFixed(2),
    expense.description,
    new Date(expense.createdAt).toLocaleString(),
    new Date(expense.updatedAt).toLocaleString(),
  ]);

  // Add summary row
  const total = calculateTotalSpending(expenses);
  rows.push(['', '', '', '', '', '']);
  rows.push(['TOTAL', '', total.toFixed(2), `${expenses.length} expenses`, '', '']);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export expenses to JSON format
 */
export const exportToJSON = (expenses: Expense[], filename: string): void => {
  const total = calculateTotalSpending(expenses);
  const categoryBreakdown: Record<string, { count: number; total: number }> = {};

  // Calculate category breakdown
  expenses.forEach(expense => {
    if (!categoryBreakdown[expense.category]) {
      categoryBreakdown[expense.category] = { count: 0, total: 0 };
    }
    categoryBreakdown[expense.category].count++;
    categoryBreakdown[expense.category].total += expense.amount;
  });

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalExpenses: expenses.length,
      totalAmount: total,
      dateRange: {
        earliest: expenses.length > 0
          ? new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))).toISOString()
          : null,
        latest: expenses.length > 0
          ? new Date(Math.max(...expenses.map(e => new Date(e.date).getTime()))).toISOString()
          : null,
      },
      categoryBreakdown,
    },
    expenses: expenses.map(expense => ({
      ...expense,
      formattedAmount: formatCurrency(expense.amount),
      formattedDate: formatDate(expense.date),
    })),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

/**
 * Export expenses to PDF format
 */
export const exportToPDF = (expenses: Expense[], filename: string): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Export Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary Section
  const total = calculateTotalSpending(expenses);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Expenses: ${expenses.length}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Total Amount: ${formatCurrency(total)}`, 15, yPosition);
  yPosition += 6;

  if (expenses.length > 0) {
    const dates = expenses.map(e => new Date(e.date).getTime());
    const earliest = formatDate(new Date(Math.min(...dates)).toISOString());
    const latest = formatDate(new Date(Math.max(...dates)).toISOString());
    doc.text(`Date Range: ${earliest} - ${latest}`, 15, yPosition);
    yPosition += 12;
  } else {
    yPosition += 12;
  }

  // Category Breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  if (Object.keys(categoryTotals).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        doc.text(`${category}: ${formatCurrency(amount)} (${percentage}%)`, 20, yPosition);
        yPosition += 5;
      });
    yPosition += 10;
  }

  // Table Header
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Details', 15, yPosition);
  yPosition += 8;

  // Table Headers
  doc.setFillColor(230, 230, 230);
  doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 17, yPosition);
  doc.text('Category', 50, yPosition);
  doc.text('Amount', 100, yPosition);
  doc.text('Description', 130, yPosition);
  yPosition += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  expenses.forEach((expense, index) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;

      // Repeat headers on new page
      doc.setFillColor(230, 230, 230);
      doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 17, yPosition);
      doc.text('Category', 50, yPosition);
      doc.text('Amount', 100, yPosition);
      doc.text('Description', 130, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
    }

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPosition - 5, pageWidth - 30, 7, 'F');
    }

    const description = expense.description.length > 35
      ? expense.description.substring(0, 32) + '...'
      : expense.description;

    doc.text(formatDate(expense.date), 17, yPosition);
    doc.text(expense.category, 50, yPosition);
    doc.text(`$${expense.amount.toFixed(2)}`, 100, yPosition);
    doc.text(description, 130, yPosition);
    yPosition += 7;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Generated by Expense Tracker',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(filename);
};

/**
 * Main export function that handles all formats
 */
export const performExport = (
  allExpenses: Expense[],
  options: ExportOptions
): void => {
  const filteredExpenses = filterExpensesForExport(allExpenses, options);
  const filename = options.filename || `expenses_${new Date().toISOString().split('T')[0]}`;

  switch (options.format) {
    case 'csv':
      exportToAdvancedCSV(filteredExpenses, `${filename}.csv`);
      break;
    case 'json':
      exportToJSON(filteredExpenses, `${filename}.json`);
      break;
    case 'pdf':
      exportToPDF(filteredExpenses, `${filename}.pdf`);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
