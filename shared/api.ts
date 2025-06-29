/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Expense tracker interfaces
 */
export interface Expense {
  id: number;
  amount: number;
  description: string;
  dateRecorded: string;
}

export interface PaginatedExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  lastPage: number;
}
