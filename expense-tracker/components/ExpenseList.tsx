'use client';

import { Expense } from '@/types/expense';
import { formatCurrency, formatDate, getCategoryColorLight } from '@/lib/utils';
import { Trash2, Edit } from 'lucide-react';
import { deleteExpense } from '@/lib/storage';

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: () => void;
  onEdit: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onUpdate, onEdit }: ExpenseListProps) {
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id);
      onUpdate();
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg">No expenses found</p>
        <p className="text-gray-400 text-sm mt-2">Add your first expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColorLight(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-primary-600 hover:text-primary-900 transition-colors"
                      title="Edit expense"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-gray-200">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900">{expense.description}</p>
                <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColorLight(expense.category)}`}>
                {expense.category}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(expense)}
                  className="text-primary-600 hover:text-primary-900 transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
