'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import {
  ExportFormat,
  ExportOptions,
  filterExpensesForExport,
  performExport,
} from '@/lib/advancedExport';
import { formatCurrency, formatDate, calculateTotalSpending } from '@/lib/utils';
import {
  X,
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface AdvancedExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export default function AdvancedExportModal({
  expenses,
  onClose,
}: AdvancedExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(`expenses_${new Date().toISOString().split('T')[0]}`);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [includeAllCategories, setIncludeAllCategories] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Calculate filtered expenses for preview
  const filteredExpenses = useMemo(() => {
    const options: ExportOptions = {
      format,
      filename,
      dateRange: {
        from: dateFrom ? new Date(dateFrom) : null,
        to: dateTo ? new Date(dateTo) : null,
      },
      categories: selectedCategories,
      includeAllCategories,
    };
    return filterExpensesForExport(expenses, options);
  }, [expenses, format, filename, dateFrom, dateTo, selectedCategories, includeAllCategories]);

  const exportSummary = useMemo(() => {
    const total = calculateTotalSpending(filteredExpenses);
    const categoryBreakdown: Record<string, number> = {};

    filteredExpenses.forEach(expense => {
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + 1;
    });

    return {
      count: filteredExpenses.length,
      total,
      categoryBreakdown,
    };
  }, [filteredExpenses]);

  const handleCategoryToggle = (category: ExpenseCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export with the current filters.');
      return;
    }

    setIsExporting(true);
    setExportComplete(false);

    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const options: ExportOptions = {
        format,
        filename,
        dateRange: {
          from: dateFrom ? new Date(dateFrom) : null,
          to: dateTo ? new Date(dateTo) : null,
        },
        categories: selectedCategories,
        includeAllCategories,
      };

      performExport(expenses, options);
      setExportComplete(true);

      // Auto-close after successful export
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'csv':
        return <FileSpreadsheet size={20} />;
      case 'json':
        return <FileJson size={20} />;
      case 'pdf':
        return <FileText size={20} />;
    }
  };

  const getFormatDescription = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'csv':
        return 'Excel-compatible spreadsheet format';
      case 'json':
        return 'Structured data with metadata';
      case 'pdf':
        return 'Professional printable report';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Advanced Export</h2>
              <p className="text-primary-100 text-sm">Configure and export your expense data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Options */}
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <FileText size={16} />
                  Export Format
                </label>
                <div className="space-y-2">
                  {(['csv', 'json', 'pdf'] as ExportFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        format === fmt
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={format === fmt ? 'text-primary-600' : 'text-gray-400'}>
                          {getFormatIcon(fmt)}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-gray-900 uppercase">{fmt}</div>
                          <div className="text-xs text-gray-500">{getFormatDescription(fmt)}</div>
                        </div>
                        {format === fmt && (
                          <CheckCircle2 size={20} className="text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filename */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={16} />
                  Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter filename"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Extension will be added automatically
                </p>
              </div>

              {/* Date Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} />
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Filter size={16} />
                  Category Filter
                </label>
                <div className="mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAllCategories}
                      onChange={e => setIncludeAllCategories(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Include all categories</span>
                  </label>
                </div>
                {!includeAllCategories && (
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(category => (
                      <label
                        key={category}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Preview & Summary */}
            <div className="space-y-6">
              {/* Export Summary */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200">
                <h3 className="font-semibold text-gray-900 mb-4">Export Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Records:</span>
                    <span className="font-bold text-primary-700 text-lg">
                      {exportSummary.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="font-bold text-primary-700 text-lg">
                      {formatCurrency(exportSummary.total)}
                    </span>
                  </div>
                  {Object.keys(exportSummary.categoryBreakdown).length > 0 && (
                    <div className="pt-3 border-t border-primary-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        By Category:
                      </div>
                      <div className="space-y-1">
                        {Object.entries(exportSummary.categoryBreakdown).map(([cat, count]) => (
                          <div key={cat} className="flex justify-between text-sm">
                            <span className="text-gray-600">{cat}</span>
                            <span className="text-gray-900 font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Toggle */}
              <div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700"
                >
                  <Eye size={18} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {/* Preview Table */}
              {showPreview && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-sm">Data Preview</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredExpenses.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">
                              Date
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">
                              Category
                            </th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredExpenses.slice(0, 10).map(expense => (
                            <tr key={expense.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900">
                                {formatDate(expense.date)}
                              </td>
                              <td className="px-3 py-2 text-gray-600">{expense.category}</td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900">
                                {formatCurrency(expense.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No expenses match the current filters
                      </div>
                    )}
                  </div>
                  {filteredExpenses.length > 10 && (
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-600 text-center">
                      Showing first 10 of {filteredExpenses.length} expenses
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || filteredExpenses.length === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                isExporting || filteredExpenses.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : exportComplete
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Exporting...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle2 size={18} />
                  Export Complete!
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export {exportSummary.count} {exportSummary.count === 1 ? 'Record' : 'Records'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
