import { Expense, ExpenseCategory } from '@/types/expense';
import { formatDate, formatCurrency, calculateTotalSpending } from './utils';
import jsPDF from 'jspdf';

// Export Template Types
export type ExportTemplate =
  | 'tax-report'
  | 'monthly-summary'
  | 'category-analysis'
  | 'detailed-report'
  | 'minimal-csv'
  | 'annual-overview';

export type CloudProvider =
  | 'google-sheets'
  | 'dropbox'
  | 'onedrive'
  | 'google-drive'
  | 'email';

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Template Configuration
export interface TemplateConfig {
  id: ExportTemplate;
  name: string;
  description: string;
  icon: string;
  format: ExportFormat;
  color: string;
  includesCharts: boolean;
  fields: string[];
}

// Export History Item
export interface ExportHistoryItem {
  id: string;
  template: ExportTemplate;
  format: ExportFormat;
  timestamp: string;
  recordCount: number;
  totalAmount: number;
  destination?: CloudProvider;
  shareLink?: string;
  status: 'completed' | 'pending' | 'failed';
}

// Scheduled Export
export interface ScheduledExport {
  id: string;
  name: string;
  template: ExportTemplate;
  frequency: ScheduleFrequency;
  destination: CloudProvider;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
}

// Cloud Integration
export interface CloudIntegration {
  provider: CloudProvider;
  name: string;
  icon: string;
  color: string;
  description: string;
  connected: boolean;
  lastSync?: string;
}

// Storage keys
const EXPORT_HISTORY_KEY = 'expense-tracker-export-history';
const SCHEDULED_EXPORTS_KEY = 'expense-tracker-scheduled-exports';
const CLOUD_INTEGRATIONS_KEY = 'expense-tracker-cloud-integrations';

// Template Definitions
export const EXPORT_TEMPLATES: TemplateConfig[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'Comprehensive report optimized for tax filing with category breakdowns',
    icon: '📊',
    format: 'pdf',
    color: 'blue',
    includesCharts: true,
    fields: ['date', 'category', 'amount', 'description', 'tax-category'],
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'Quick overview of monthly spending with trends',
    icon: '📅',
    format: 'pdf',
    color: 'green',
    includesCharts: true,
    fields: ['date', 'category', 'amount', 'monthly-total'],
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Deep dive into spending patterns by category',
    icon: '🎯',
    format: 'pdf',
    color: 'purple',
    includesCharts: true,
    fields: ['category', 'amount', 'percentage', 'trend'],
  },
  {
    id: 'detailed-report',
    name: 'Detailed Report',
    description: 'Complete transaction list with all metadata',
    icon: '📋',
    format: 'csv',
    color: 'orange',
    includesCharts: false,
    fields: ['date', 'category', 'amount', 'description', 'created', 'updated'],
  },
  {
    id: 'minimal-csv',
    name: 'Minimal CSV',
    description: 'Basic spreadsheet with essential fields only',
    icon: '📄',
    format: 'csv',
    color: 'gray',
    includesCharts: false,
    fields: ['date', 'category', 'amount'],
  },
  {
    id: 'annual-overview',
    name: 'Annual Overview',
    description: 'Yearly summary with quarter-by-quarter breakdown',
    icon: '📈',
    format: 'pdf',
    color: 'red',
    includesCharts: true,
    fields: ['quarter', 'category', 'amount', 'year-over-year'],
  },
];

// Cloud Providers Configuration
export const CLOUD_PROVIDERS: CloudIntegration[] = [
  {
    provider: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
    color: 'green',
    description: 'Sync expenses to Google Sheets in real-time',
    connected: false,
  },
  {
    provider: 'google-drive',
    name: 'Google Drive',
    icon: '💾',
    color: 'blue',
    description: 'Auto-save exports to Google Drive',
    connected: false,
  },
  {
    provider: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    color: 'blue',
    description: 'Backup expenses to Dropbox automatically',
    connected: false,
  },
  {
    provider: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    color: 'blue',
    description: 'Store exports in Microsoft OneDrive',
    connected: false,
  },
  {
    provider: 'email',
    name: 'Email',
    icon: '✉️',
    color: 'purple',
    description: 'Send exports directly to your email',
    connected: true, // Email is always "connected"
  },
];

// Export History Functions
export const getExportHistory = (): ExportHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(EXPORT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading export history:', error);
    return [];
  }
};

export const addExportToHistory = (item: Omit<ExportHistoryItem, 'id'>): void => {
  if (typeof window === 'undefined') return;
  try {
    const history = getExportHistory();
    const newItem: ExportHistoryItem = {
      ...item,
      id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    history.unshift(newItem); // Add to beginning
    // Keep only last 50 exports
    const trimmed = history.slice(0, 50);
    localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving export history:', error);
  }
};

export const clearExportHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXPORT_HISTORY_KEY);
};

// Scheduled Exports Functions
export const getScheduledExports = (): ScheduledExport[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SCHEDULED_EXPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading scheduled exports:', error);
    return [];
  }
};

export const saveScheduledExports = (schedules: ScheduledExport[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCHEDULED_EXPORTS_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error('Error saving scheduled exports:', error);
  }
};

export const addScheduledExport = (schedule: Omit<ScheduledExport, 'id' | 'createdAt'>): void => {
  const schedules = getScheduledExports();
  const newSchedule: ScheduledExport = {
    ...schedule,
    id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  schedules.push(newSchedule);
  saveScheduledExports(schedules);
};

export const deleteScheduledExport = (id: string): void => {
  const schedules = getScheduledExports();
  const filtered = schedules.filter(s => s.id !== id);
  saveScheduledExports(filtered);
};

export const toggleScheduledExport = (id: string): void => {
  const schedules = getScheduledExports();
  const updated = schedules.map(s =>
    s.id === id ? { ...s, enabled: !s.enabled } : s
  );
  saveScheduledExports(updated);
};

// Cloud Integrations Functions
export const getCloudIntegrations = (): CloudIntegration[] => {
  if (typeof window === 'undefined') return CLOUD_PROVIDERS;
  try {
    const data = localStorage.getItem(CLOUD_INTEGRATIONS_KEY);
    return data ? JSON.parse(data) : CLOUD_PROVIDERS;
  } catch (error) {
    console.error('Error loading cloud integrations:', error);
    return CLOUD_PROVIDERS;
  }
};

export const toggleCloudIntegration = (provider: CloudProvider): void => {
  if (typeof window === 'undefined') return;
  const integrations = getCloudIntegrations();
  const updated = integrations.map(integration =>
    integration.provider === provider
      ? {
          ...integration,
          connected: !integration.connected,
          lastSync: integration.connected ? undefined : new Date().toISOString(),
        }
      : integration
  );
  localStorage.setItem(CLOUD_INTEGRATIONS_KEY, JSON.stringify(updated));
};

// Generate Shareable Link (mock)
export const generateShareableLink = (expenses: Expense[]): string => {
  const token = Math.random().toString(36).substr(2, 12);
  return `https://expense-tracker.app/share/${token}`;
};

// Export Functions by Template
export const exportByTemplate = (
  expenses: Expense[],
  template: ExportTemplate,
  destination?: CloudProvider
): void => {
  const templateConfig = EXPORT_TEMPLATES.find(t => t.id === template);
  if (!templateConfig) return;

  const total = calculateTotalSpending(expenses);

  // Add to history
  addExportToHistory({
    template,
    format: templateConfig.format,
    timestamp: new Date().toISOString(),
    recordCount: expenses.length,
    totalAmount: total,
    destination,
    status: 'completed',
  });

  // Perform actual export based on format
  switch (templateConfig.format) {
    case 'csv':
      exportTemplateCSV(expenses, templateConfig);
      break;
    case 'pdf':
      exportTemplatePDF(expenses, templateConfig);
      break;
    default:
      console.warn('Format not implemented:', templateConfig.format);
  }
};

// Template-specific CSV export
const exportTemplateCSV = (expenses: Expense[], template: TemplateConfig): void => {
  let headers: string[] = [];
  let rows: string[][] = [];

  if (template.id === 'minimal-csv') {
    headers = ['Date', 'Category', 'Amount'];
    rows = expenses.map(e => [formatDate(e.date), e.category, e.amount.toFixed(2)]);
  } else {
    headers = ['Date', 'Category', 'Amount', 'Description', 'Created At', 'Updated At'];
    rows = expenses.map(e => [
      formatDate(e.date),
      e.category,
      e.amount.toFixed(2),
      e.description,
      new Date(e.createdAt).toLocaleDateString(),
      new Date(e.updatedAt).toLocaleDateString(),
    ]);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${template.id}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
};

// Template-specific PDF export
const exportTemplatePDF = (expenses: Expense[], template: TemplateConfig): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(template.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(template.description, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Summary
  const total = calculateTotalSpending(expenses);
  doc.setFontSize(12);
  doc.text(`Total Expenses: ${expenses.length}`, 15, yPos);
  yPos += 7;
  doc.text(`Total Amount: ${formatCurrency(total)}`, 15, yPos);
  yPos += 7;
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPos);
  yPos += 15;

  // Content based on template
  if (template.id === 'category-analysis') {
    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        doc.text(`${category}: ${formatCurrency(amount)} (${percentage}%)`, 20, yPos);
        yPos += 6;
      });
  } else {
    // Transaction list
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Transactions', 15, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    expenses.slice(0, 30).forEach(expense => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(
        `${formatDate(expense.date)} - ${expense.category}: ${formatCurrency(expense.amount)}`,
        20,
        yPos
      );
      yPos += 5;
    });
  }

  doc.save(`${template.id}_${Date.now()}.pdf`);
};

// Helper function to download files
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
