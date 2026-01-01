/**
 * Finances Service
 * 
 * Handles transactions, expenses, and currencies.
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  Currency,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
} from './types';

// =============================================================================
// Transactions
// =============================================================================

export const transactionsService = {
  /**
   * Get all transactions
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Transaction>>('/finances/transactions', { params }),

  /**
   * Get transaction by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Transaction>>(`/finances/transactions/${id}`),

  /**
   * Create new transaction
   */
  create: (data: CreateTransactionRequest) => 
    api.post<ApiResponse<Transaction>>('/finances/transactions', data),

  /**
   * Update transaction
   */
  update: (id: number, data: UpdateTransactionRequest) => 
    api.put<ApiResponse<Transaction>>(`/finances/transactions/${id}`, data),

  /**
   * Delete transaction
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/finances/transactions/${id}`),

  /**
   * Get transaction statistics
   */
  getStats: () => 
    api.get<ApiResponse>('/finances/transactions/stats'),

  /**
   * Get transaction summary
   */
  getSummary: () => 
    api.get<ApiResponse>('/finances/transactions/summary'),
};

// =============================================================================
// Expenses
// =============================================================================

export const expensesService = {
  /**
   * Get all expenses
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Expense>>('/finances/expenses', { params }),

  /**
   * Get expense by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Expense>>(`/finances/expenses/${id}`),

  /**
   * Create new expense
   */
  create: (data: CreateExpenseRequest) => 
    api.post<ApiResponse<Expense>>('/finances/expenses', data),

  /**
   * Update expense
   */
  update: (id: number, data: UpdateExpenseRequest) => 
    api.put<ApiResponse<Expense>>(`/finances/expenses/${id}`, data),

  /**
   * Delete expense
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/finances/expenses/${id}`),
};

// =============================================================================
// Currencies
// =============================================================================

export const currenciesService = {
  /**
   * Get all currencies
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Currency>>('/finances/currencies', { params }),

  /**
   * Get currency by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Currency>>(`/finances/currencies/${id}`),

  /**
   * Create new currency
   */
  create: (data: CreateCurrencyRequest) => 
    api.post<ApiResponse<Currency>>('/finances/currencies', data),

  /**
   * Update currency
   */
  update: (id: number, data: UpdateCurrencyRequest) => 
    api.put<ApiResponse<Currency>>(`/finances/currencies/${id}`, data),

  /**
   * Delete currency
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/finances/currencies/${id}`),
};

// =============================================================================
// Combined Export
// =============================================================================

export const financesService = {
  transactions: transactionsService,
  expenses: expensesService,
  currencies: currenciesService,
};

export default financesService;
