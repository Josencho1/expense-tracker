'use client';

import { ExpenseCategory, FilterState } from '@/types/expense';
import { Search, Download } from 'lucide-react';

interface ExpenseFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExport: () => void;
}

export default function ExpenseFilter({ filters, onFilterChange, onExport }: ExpenseFilterProps) {
  const categories: (ExpenseCategory | 'All')[] = [
    'All',
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Other',
  ];

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value ? new Date(value) : null,
      },
    });
  };

  const handleCategoryChange = (category: ExpenseCategory | 'All') => {
    onFilterChange({
      ...filters,
      category,
    });
  };

  const handleSearchChange = (query: string) => {
    onFilterChange({
      ...filters,
      searchQuery: query,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      dateRange: { from: null, to: null },
      category: 'All',
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory | 'All')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Reset Filters
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </div>
  );
}
