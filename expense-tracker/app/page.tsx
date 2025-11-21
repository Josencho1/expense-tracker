'use client';

import { useState, useEffect } from 'react';
import { Expense, FilterState } from '@/types/expense';
import { getExpenses } from '@/lib/storage';
import { filterExpenses, exportToCSV } from '@/lib/utils';
import Dashboard from '@/components/Dashboard';
import ExpenseChart from '@/components/ExpenseChart';
import ExpenseFilter from '@/components/ExpenseFilter';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import { Plus, Wallet } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    category: 'All',
    searchQuery: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    const filtered = filterExpenses(expenses, filters);
    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  const loadExpenses = () => {
    setIsLoading(true);
    const data = getExpenses();
    // Sort by date (newest first)
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(sortedData);
    setIsLoading(false);
  };

  const handleFormSubmit = () => {
    loadExpenses();
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleExport = () => {
    exportToCSV(filteredExpenses);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Wallet className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
                <p className="text-sm text-gray-600">Manage your personal finances with ease</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            <Dashboard expenses={expenses} />
            <ExpenseChart expenses={expenses} />
            <ExpenseFilter
              filters={filters}
              onFilterChange={setFilters}
              onExport={handleExport}
            />
            <ExpenseList
              expenses={filteredExpenses}
              onUpdate={loadExpenses}
              onEdit={handleEdit}
            />
          </>
        )}
      </main>

      {showForm && (
        <ExpenseForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          editingExpense={editingExpense}
        />
      )}

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Expense Tracker. Built with Next.js and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
