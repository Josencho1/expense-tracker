import { Expense, ExpenseCategory, CategorySpending, FilterState } from '@/types/expense';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getCategoryColor = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: 'bg-orange-500',
    Transportation: 'bg-blue-500',
    Entertainment: 'bg-purple-500',
    Shopping: 'bg-pink-500',
    Bills: 'bg-red-500',
    Other: 'bg-gray-500',
  };
  return colors[category];
};

export const getCategoryColorLight = (category: ExpenseCategory): string => {
  const colors: Record<ExpenseCategory, string> = {
    Food: 'bg-orange-100 text-orange-700',
    Transportation: 'bg-blue-100 text-blue-700',
    Entertainment: 'bg-purple-100 text-purple-700',
    Shopping: 'bg-pink-100 text-pink-700',
    Bills: 'bg-red-100 text-red-700',
    Other: 'bg-gray-100 text-gray-700',
  };
  return colors[category];
};

export const filterExpenses = (expenses: Expense[], filters: FilterState): Expense[] => {
  return expenses.filter(expense => {
    // Date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      const expenseDate = parseISO(expense.date);
      const inRange = isWithinInterval(expenseDate, {
        start: filters.dateRange.from,
        end: filters.dateRange.to,
      });
      if (!inRange) return false;
    }

    // Category filter
    if (filters.category !== 'All' && expense.category !== filters.category) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(query);
      const matchesCategory = expense.category.toLowerCase().includes(query);
      const matchesAmount = expense.amount.toString().includes(query);

      if (!matchesDescription && !matchesCategory && !matchesAmount) {
        return false;
      }
    }

    return true;
  });
};

export const calculateTotalSpending = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateMonthlySpending = (expenses: Expense[]): number => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  return calculateTotalSpending(monthlyExpenses);
};

export const calculateCategoryBreakdown = (expenses: Expense[]): CategorySpending[] => {
  const total = calculateTotalSpending(expenses);
  const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  return categories.map(category => {
    const categoryExpenses = expenses.filter(e => e.category === category);
    const amount = calculateTotalSpending(categoryExpenses);

    return {
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      count: categoryExpenses.length,
    };
  }).sort((a, b) => b.amount - a.amount);
};

export const exportToCSV = (expenses: Expense[]): void => {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    expense.category,
    expense.amount.toFixed(2),
    expense.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
