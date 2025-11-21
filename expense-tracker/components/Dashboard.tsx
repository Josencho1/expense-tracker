'use client';

import { Expense } from '@/types/expense';
import {
  calculateTotalSpending,
  calculateMonthlySpending,
  calculateCategoryBreakdown,
  formatCurrency,
} from '@/lib/utils';
import { DollarSign, TrendingUp, PieChart } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const totalSpending = calculateTotalSpending(expenses);
  const monthlySpending = calculateMonthlySpending(expenses);
  const categoryBreakdown = calculateCategoryBreakdown(expenses);
  const topCategory = categoryBreakdown[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Spending</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpending)}</p>
            <p className="text-sm text-gray-500 mt-1">{expenses.length} expenses</p>
          </div>
          <div className="bg-primary-100 p-3 rounded-full">
            <DollarSign className="text-primary-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(monthlySpending)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {totalSpending > 0
                ? `${((monthlySpending / totalSpending) * 100).toFixed(1)}% of total`
                : 'No data'}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Top Category</p>
            <p className="text-3xl font-bold text-gray-900">
              {topCategory ? topCategory.category : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {topCategory ? formatCurrency(topCategory.amount) : 'No expenses'}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <PieChart className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
