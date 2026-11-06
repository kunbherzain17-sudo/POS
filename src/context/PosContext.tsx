import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Vendor,
  Expense,
  Order,
  OrderItem,
  CartItem,
  BankAccount,
  Salesman,
  AppView,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_VENDORS,
  INITIAL_EXPENSES,
  INITIAL_ORDERS,
  INITIAL_BANKS,
  INITIAL_SALESMEN,
  INITIAL_CATEGORIES,
} from '../data/mockData';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  currency: string;
  footerNote: string;
}

interface UserSession {
  name: string;
  role: 'Admin';
}

interface LocalCredentials {
  username: string;
  salt: string;
  digest: string;
  iterations: number;
}

interface PosContextType {
  user: UserSession | null;
  requiresSetup: boolean;
  setupAdministrator: (name: string, password: string) => Promise<void>;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  adjustCustomerBalance: (id: number, amount: number) => void;

  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  orders: Order[];
  createOrder: (orderData: Omit<Order, 'orderId'>) => Order;
  refundItem: (orderId: number, productId: number, quantity: number, refundAmount: number) => boolean;

  banks: BankAccount[];
  addBank: (bank: Omit<BankAccount, 'id'>) => void;
  deleteBank: (id: number) => void;
  salesmen: Salesman[];
  addSalesman: (salesman: Omit<Salesman, 'id'>) => void;
  deleteSalesman: (id: number) => void;
  categories: string[];
  addCategory: (cat: string) => void;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => void;

  activePrintOrder: Order | null;
  setActivePrintOrder: (order: Order | null) => void;
  printFormat: 'thermal' | 'a4';
  setPrintFormat: (format: 'thermal' | 'a4') => void;

  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonString: string) => boolean;
  resetToCleanData: () => void;
  playScanBeep: () => void;

  // Stats
  kpiStats: {
    sales: number;
    expense: number;
    purchase: number;
    customerBalance: number;
    vendorBalance: number;
    todayInvoices: number;
    recovery: number;
    shortStock: number;
    outOfStock: number;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: '',
  tagline: '',
  address: '',
  phone: '',
  currency: 'Rs.',
  footerNote: 'Thank You for Shopping!',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isArrayOf = <T,>(value: unknown, isItem: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(isItem);

const isProduct = (value: unknown): value is Product =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.name) &&
  isNumber(value.price) &&
  isNumber(value.cost) &&
  isNumber(value.discount) &&
  isString(value.barcode) &&
  isString(value.category) &&
  isNumber(value.quantityLimit) &&
  isNumber(value.stock);

const isCustomer = (value: unknown): value is Customer =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.name) &&
  isString(value.phone) &&
  isNumber(value.balance) &&
  isNumber(value.totalPurchasing) &&
  (value.totalPaid === undefined || isNumber(value.totalPaid)) &&
  (value.address === undefined || isString(value.address)) &&
  (value.cnic === undefined || isString(value.cnic));

const isVendor = (value: unknown): value is Vendor =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.name) &&
  isString(value.contact) &&
  isNumber(value.balance) &&
  isNumber(value.totalPurchasing);

const isExpense = (value: unknown): value is Expense =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.type) &&
  isString(value.expense) &&
  isNumber(value.amount) &&
  isString(value.date) &&
  (value.notes === undefined || isString(value.notes));

const hasCommonItemFields = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) &&
  isNumber(value.productId) &&
  isString(value.name) &&
  isNumber(value.price) &&
  isNumber(value.cost) &&
  isNumber(value.quantity) &&
  isNumber(value.total);

const isCartItem = (value: unknown): value is CartItem =>
  hasCommonItemFields(value) &&
  isString(value.barcode) &&
  isNumber(value.discountPercent);

const isOrderItem = (value: unknown): value is OrderItem =>
  hasCommonItemFields(value) &&
  isNumber(value.pDiscount);

const isOrder = (value: unknown): value is Order =>
  isRecord(value) &&
  isNumber(value.orderId) &&
  isString(value.customerName) &&
  (value.customerId === undefined || isNumber(value.customerId)) &&
  isString(value.date) &&
  isString(value.time) &&
  isArrayOf(value.items, isOrderItem) &&
  isNumber(value.subtotal) &&
  isNumber(value.totalDiscount) &&
  isNumber(value.tax) &&
  isNumber(value.totalPrice) &&
  isNumber(value.amountPaid) &&
  isNumber(value.changeDue) &&
  (value.paymentMethod === 'Cash' || value.paymentMethod === 'Card' || value.paymentMethod === 'Bank Transfer') &&
  isString(value.cashier);

const isBankAccount = (value: unknown): value is BankAccount =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.bankName) &&
  isString(value.accountTitle) &&
  isString(value.accountNumber) &&
  isNumber(value.balance);

const isSalesman = (value: unknown): value is Salesman =>
  isRecord(value) &&
  isNumber(value.id) &&
  isString(value.name) &&
  isString(value.phone) &&
  (value.address === undefined || isString(value.address)) &&
  isNumber(value.commissionRate) &&
  isNumber(value.totalSales);

const isHeldBill = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.heldAt) &&
  isString(value.customerName) &&
  isNumber(value.customerId) &&
  isArrayOf(value.items, isCartItem) &&
  isString(value.note);

const isStoreSettings = (value: unknown): value is StoreSettings =>
  isRecord(value) &&
  isString(value.storeName) &&
  isString(value.tagline) &&
  isString(value.address) &&
  isString(value.phone) &&
  isString(value.currency) &&
  isString(value.footerNote);

const CREDENTIALS_KEY = 'regal_local_credentials';
const SESSION_KEY = 'regal_local_session';
const PASSWORD_ITERATIONS = 310_000;

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const derivePasswordDigest = async (password: string, saltHex: string, iterations: number) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password setup requires HTTPS or localhost. Open the installed app after connecting to its secure address once.');
  }

  const salt = Uint8Array.from(
    { length: saltHex.length / 2 },
    (_, index) => Number.parseInt(saltHex.slice(index * 2, index * 2 + 2), 16)
  );
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
};

const readLocalCredentials = (serialized: string): LocalCredentials => {
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error('Saved sign-in settings are unreadable. Restore a backup or clear this app’s local browser data.');
  }

  if (
    typeof value !== 'object' ||
    value === null ||
    !('username' in value) ||
    typeof value.username !== 'string' ||
    !('salt' in value) ||
    typeof value.salt !== 'string' ||
    !/^[0-9a-f]{32}$/i.test(value.salt) ||
    !('digest' in value) ||
    typeof value.digest !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(value.digest) ||
    !('iterations' in value) ||
    typeof value.iterations !== 'number' ||
    !Number.isInteger(value.iterations) ||
    value.iterations < 100_000 ||
    value.iterations > 1_000_000
  ) {
    throw new Error('Saved sign-in settings are invalid. Restore a backup or clear this app’s local browser data.');
  }
  return value as LocalCredentials;
};

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serializedCredentials, setSerializedCredentials] = useState<string | null>(() =>
    localStorage.getItem(CREDENTIALS_KEY)
  );
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? { name: saved, role: 'Admin' } : null;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    return user ? 'dashboard' : 'login';
  });

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 861px)').matches
  );

  useEffect(() => {
    const desktopLayout = window.matchMedia('(min-width: 861px)');
    const syncSidebar = () => setSidebarOpen(desktopLayout.matches);
    desktopLayout.addEventListener('change', syncSidebar);
    return () => desktopLayout.removeEventListener('change', syncSidebar);
  }, []);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('regal_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('regal_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Vendors
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('regal_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('regal_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('regal_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Banks & Salesmen
  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('regal_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem('regal_salesmen');
    return saved ? JSON.parse(saved) : INITIAL_SALESMEN;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('regal_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('regal_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Print modal
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  useEffect(() => {
    localStorage.setItem('regal_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('regal_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('regal_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('regal_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('regal_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('regal_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('regal_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('regal_salesmen', JSON.stringify(salesmen));
  }, [salesmen]);

  useEffect(() => {
    localStorage.setItem('regal_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, user.name);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  // Web Audio API offline scanner beep
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio not supported or blocked
    }
  };

  const setupAdministrator = async (name: string, password: string) => {
    if (serializedCredentials !== null || localStorage.getItem(CREDENTIALS_KEY) !== null) {
      throw new Error('This device already has an administrator account. Sign in instead.');
    }
    if (name.trim().length < 2 || password.length < 10) {
      throw new Error('Enter a username of at least 2 characters and a password of at least 10 characters.');
    }
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error('Secure password setup is unavailable in this browser. Use an up-to-date browser on HTTPS or localhost.');
    }

    const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
    const credentials: LocalCredentials = {
      username: name.trim(),
      salt,
      digest: await derivePasswordDigest(password, salt, PASSWORD_ITERATIONS),
      iterations: PASSWORD_ITERATIONS,
    };
    const serialized = JSON.stringify(credentials);
    localStorage.setItem(CREDENTIALS_KEY, serialized);
    setSerializedCredentials(serialized);
    localStorage.removeItem('regal_user');
    setUser({ name: credentials.username, role: 'Admin' });
    setCurrentView('dashboard');
  };

  const login = async (name: string, password: string) => {
    if (!serializedCredentials) return false;
    const credentials = readLocalCredentials(serializedCredentials);
    if (credentials.username.toLocaleLowerCase() !== name.trim().toLocaleLowerCase()) {
      return false;
    }
    const digest = await derivePasswordDigest(password, credentials.salt, credentials.iterations);
    if (digest !== credentials.digest) return false;

    setUser({ name: credentials.username, role: 'Admin' });
    setCurrentView('dashboard');
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map((item) => item.id)) + 1 : 1;
    const newProd: Product = { ...p, id: newId };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const newId = customers.length > 0 ? Math.max(...customers.map((item) => item.id)) + 1 : 1;
    const newCustomer = { ...c, id: newId };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const adjustCustomerBalance = (id: number, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, balance: Math.max(0, c.balance - amount) } : c))
    );
  };

  const addVendor = (v: Omit<Vendor, 'id'>) => {
    const newId = vendors.length > 0 ? Math.max(...vendors.map((item) => item.id)) + 1 : 1;
    setVendors((prev) => [{ ...v, id: newId }, ...prev]);
  };

  const addExpense = (e: Omit<Expense, 'id'>) => {
    const newId = expenses.length > 0 ? Math.max(...expenses.map((item) => item.id)) + 1 : 1;
    setExpenses((prev) => [{ ...e, id: newId }, ...prev]);
  };

  const createOrder = (orderData: Omit<Order, 'orderId'>): Order => {
    const newOrderId = orders.length > 0 ? Math.max(...orders.map((o) => o.orderId)) + 1 : 1;
    const newOrder: Order = {
      ...orderData,
      orderId: newOrderId,
    };

    // Deduct stock for items sold
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = orderData.items.find((item) => item.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - soldItem.quantity),
          };
        }
        return prod;
      })
    );

    // Update customer total purchasing or balance if unpaid
    if (orderData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === orderData.customerId) {
            const unpaidAmount = Math.max(0, orderData.totalPrice - orderData.amountPaid);
            return {
              ...c,
              totalPurchasing: c.totalPurchasing + orderData.totalPrice,
              balance: c.balance + unpaidAmount,
            };
          }
          return c;
        })
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const refundItem = (orderId: number, productId: number, quantity: number, refundAmount: number): boolean => {
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);
    if (orderIndex === -1) return false;

    // Restock product
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: p.stock + quantity };
        }
        return p;
      })
    );

    // Update order
    setOrders((prev) => {
      const updated = [...prev];
      const order = { ...updated[orderIndex] };
      order.totalPrice = Math.max(0, order.totalPrice - refundAmount);
      order.items = order.items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - quantity),
            total: Math.max(0, item.total - refundAmount),
          };
        }
        return item;
      });
      updated[orderIndex] = order;
      return updated;
    });

    return true;
  };

  const addCategory = (cat: string) => {
    if (cat && !categories.includes(cat)) {
      setCategories((prev) => [...prev, cat]);
    }
  };

  const addBank = (bank: Omit<BankAccount, 'id'>) => {
    setBanks((previous) => {
      const id = previous.length > 0 ? Math.max(...previous.map((item) => item.id)) + 1 : 1;
      return [...previous, { ...bank, id }];
    });
  };

  const deleteBank = (id: number) => {
    setBanks((previous) => previous.filter((bank) => bank.id !== id));
  };

  const addSalesman = (salesman: Omit<Salesman, 'id'>) => {
    setSalesmen((previous) => {
      const id = previous.length > 0 ? Math.max(...previous.map((item) => item.id)) + 1 : 1;
      return [...previous, { ...salesman, id }];
    });
  };

  const deleteSalesman = (id: number) => {
    setSalesmen((previous) => previous.filter((salesman) => salesman.id !== id));
  };

  const updateStoreSettings = (settings: StoreSettings) => {
    setStoreSettings(settings);
  };

  // Database Backup to JSON file (works 100% offline!)
  const exportDatabaseBackup = () => {
    const backupData = {
      app: 'Regal POS',
      version: '4.2',
      exportDate: new Date().toISOString(),
      products,
      customers,
      vendors,
      expenses,
      orders,
      banks,
      salesmen,
      heldBills: JSON.parse(localStorage.getItem('regal_held_bills') || '[]'),
      categories,
      storeSettings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RegalPOS_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importDatabaseBackup = (jsonString: string): boolean => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return false;
    }

    if (!isRecord(parsed) || parsed.app !== 'Regal POS') return false;
    const data = parsed;
    if (
      !isArrayOf(data.products, isProduct) ||
      !isArrayOf(data.customers, isCustomer) ||
      !isArrayOf(data.vendors, isVendor) ||
      !isArrayOf(data.expenses, isExpense) ||
      !isArrayOf(data.orders, isOrder) ||
      !isArrayOf(data.categories, isString) ||
      !isStoreSettings(data.storeSettings) ||
      (data.banks !== undefined && !isArrayOf(data.banks, isBankAccount)) ||
      (data.salesmen !== undefined && !isArrayOf(data.salesmen, isSalesman)) ||
      (data.heldBills !== undefined && !isArrayOf(data.heldBills, isHeldBill))
    ) {
      return false;
    }

    const saveAndSet = <T,>(
      key: string,
      value: T,
      setter: React.Dispatch<React.SetStateAction<T>>
    ) => {
      localStorage.setItem(key, JSON.stringify(value));
      setter(value);
    };
    const banks = data.banks ?? [];
    const salesmen = data.salesmen ?? [];
    const heldBills = data.heldBills ?? [];
    saveAndSet('regal_products', data.products, setProducts);
    saveAndSet('regal_customers', data.customers, setCustomers);
    saveAndSet('regal_vendors', data.vendors, setVendors);
    saveAndSet('regal_expenses', data.expenses, setExpenses);
    saveAndSet('regal_orders', data.orders, setOrders);
    saveAndSet('regal_banks', banks, setBanks);
    saveAndSet('regal_salesmen', salesmen, setSalesmen);
    saveAndSet('regal_categories', data.categories, setCategories);
    saveAndSet('regal_settings', data.storeSettings, setStoreSettings);
    localStorage.setItem('regal_held_bills', JSON.stringify(heldBills));
    return true;
  };

  const resetToCleanData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setExpenses(INITIAL_EXPENSES);
    setOrders(INITIAL_ORDERS);
    setBanks(INITIAL_BANKS);
    setSalesmen(INITIAL_SALESMEN);
    setCategories(INITIAL_CATEGORIES);
    setStoreSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('regal_held_bills');
    localStorage.removeItem('regal_banks');
    localStorage.removeItem('regal_salesmen');
    localStorage.removeItem('regal_products');
    localStorage.removeItem('regal_customers');
    localStorage.removeItem('regal_vendors');
    localStorage.removeItem('regal_expenses');
    localStorage.removeItem('regal_orders');
    localStorage.removeItem('regal_categories');
    localStorage.removeItem('regal_settings');
  };

  // Calculate live KPI metrics
  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchase = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const customerBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const vendorBalance = vendors.reduce((sum, v) => sum + v.balance, 0);
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayInvoices = orders.filter((order) => order.date === localToday).length;
  const recovery = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const shortStock = products.filter((p) => p.stock > 0 && p.stock <= p.quantityLimit).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const kpiStats = {
    sales: totalSales,
    expense: totalExpense,
    purchase: totalPurchase,
    customerBalance,
    vendorBalance,
    todayInvoices,
    recovery,
    shortStock,
    outOfStock,
  };

  return (
    <PosContext.Provider
      value={{
        user,
        requiresSetup: serializedCredentials === null,
        setupAdministrator,
        login,
        logout,
        currentView,
        setCurrentView,
        sidebarOpen,
        setSidebarOpen,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        adjustCustomerBalance,
        vendors,
        addVendor,
        expenses,
        addExpense,
        orders,
        createOrder,
        refundItem,
        banks,
        addBank,
        deleteBank,
        salesmen,
        addSalesman,
        deleteSalesman,
        categories,
        addCategory,
        storeSettings,
        updateStoreSettings,
        activePrintOrder,
        setActivePrintOrder,
        printFormat,
        setPrintFormat,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetToCleanData,
        playScanBeep,
        kpiStats,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within PosProvider');
  }
  return context;
};
