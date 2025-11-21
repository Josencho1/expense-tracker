import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense => {
  const expenses = getExpenses();
  const now = new Date().toISOString();

  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  expenses.push(newExpense);
  saveExpenses(expenses);

  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): Expense | null => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) return null;

  const updatedExpense = {
    ...expenses[index],
    ...updates,
    id: expenses[index].id,
    createdAt: expenses[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  expenses[index] = updatedExpense;
  saveExpenses(expenses);

  return updatedExpense;
};

export const deleteExpense = (id: string): boolean => {
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(e => e.id !== id);

  if (filteredExpenses.length === expenses.length) return false;

  saveExpenses(filteredExpenses);
  return true;
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
