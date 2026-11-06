import { Customer, Product, Vendor, Expense, Order, BankAccount, Salesman } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Walk In',
    phone: '',
    balance: 0,
    totalPurchasing: 0,
    totalPaid: 0,
  },
];

export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_BANKS: BankAccount[] = [];
export const INITIAL_SALESMEN: Salesman[] = [];
export const INITIAL_CATEGORIES: string[] = [];
