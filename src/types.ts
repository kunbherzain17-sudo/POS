export interface Product {
  id: number;
  name: string;
  price: number; // Retail Price
  cost: number;  // Purchase Cost
  discount: number;
  barcode: string;
  category: string;
  quantityLimit: number;
  stock: number;
  imageUrl?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  balance: number;
  totalPurchasing: number;
  totalPaid?: number;
  address?: string;
  cnic?: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact: string;
  balance: number;
  totalPurchasing: number;
}

export interface Expense {
  id: number;
  type: string;
  expense: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface CartItem {
  productId: number;
  barcode: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  discountPercent: number;
  total: number;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  pDiscount: number;
  total: number;
}

export interface Order {
  orderId: number;
  customerName: string;
  customerId?: number;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  totalPrice: number;
  amountPaid: number;
  changeDue: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer';
  cashier: string;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  balance: number;
}

export interface Salesman {
  id: number;
  name: string;
  phone: string;
  address?: string;
  commissionRate: number;
  totalSales: number;
}

export type AppView =
  | 'login'
  | 'dashboard'
  | 'invoice'
  | 'products'
  | 'customers'
  | 'vendors'
  | 'stock'
  | 'expenses'
  | 'duplicatebill'
  | 'salesview'
  | 'refund'
  | 'banks'
  | 'salesman'
  | 'administration'
  | 'purchasereturn';
