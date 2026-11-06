import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Vendor,
  Expense,
  Order,
  OrderItem,
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
  role: 'Admin' | 'cashier' | 'Store Manager';
}

interface PosContextType {
  user: UserSession | null;
  login: (name: string, role: 'Admin' | 'cashier' | 'Store Manager', password: string) => boolean;
  logout: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  adjustCustomerBalance: (id: number, amount: number) => void;

  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  orders: Order[];
  createOrder: (orderData: Omit<Order, 'orderId'>) => Order;
  refundItem: (orderId: number, productId: number, quantity: number, refundAmount: number) => boolean;

  banks: BankAccount[];
  salesmen: Salesman[];
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
  resetToDemoData: () => void;
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
  storeName: 'REGAL POS',
  tagline: 'Point of Sale & Retail Management System',
  address: 'Trade Center, Near Bolan Sajji, Block 13 A, Gulshan-e-Iqbal, Karachi',
  phone: '0310-2673651',
  currency: 'Rs.',
  footerNote: 'Thank You for Shopping! • Reliable Technologies',
};

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('regal_user');
    return saved ? JSON.parse(saved) : { name: 'Admin', role: 'Admin' };
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    return user ? 'dashboard' : 'login';
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  const [banks] = useState<BankAccount[]>(INITIAL_BANKS);
  const [salesmen] = useState<Salesman[]>(INITIAL_SALESMEN);
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

  // Simulated browser URL
  const [browserUrl, setBrowserUrl] = useState('https://demo.regalpos.pk/?ad_name=Admin');

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
    localStorage.setItem('regal_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('regal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('regal_user');
    }
  }, [user]);

  // Sync browser URL whenever view changes
  useEffect(() => {
    const baseUrl = 'https://demo.regalpos.pk';
    switch (currentView) {
      case 'login':
        setBrowserUrl(`${baseUrl}/Admin/Login`);
        break;
      case 'dashboard':
        setBrowserUrl(`${baseUrl}/?ad_name=${user?.name || 'Admin'}`);
        break;
      case 'invoice':
        setBrowserUrl(`${baseUrl}/Admin/newinvoice?ad_name=${user?.name || 'Admin'}`);
        break;
      case 'products':
        setBrowserUrl(`${baseUrl}/Admin/Viewproduct`);
        break;
      case 'customers':
        setBrowserUrl(`${baseUrl}/Admin/Viewcustomer`);
        break;
      case 'vendors':
        setBrowserUrl(`${baseUrl}/Admin/Viewvendor`);
        break;
      case 'stock':
        setBrowserUrl(`${baseUrl}/Admin/ViewStock`);
        break;
      case 'expenses':
        setBrowserUrl(`${baseUrl}/Admin/Viewexpense`);
        break;
      case 'duplicatebill':
        setBrowserUrl(`${baseUrl}/Admin/Duplicatebill`);
        break;
      case 'salesview':
        setBrowserUrl(`${baseUrl}/Admin/salesview`);
        break;
      case 'refund':
        setBrowserUrl(`${baseUrl}/Admin/refund`);
        break;
      case 'banks':
        setBrowserUrl(`${baseUrl}/Admin/Viewbank`);
        break;
      case 'purchasereturn':
        setBrowserUrl(`${baseUrl}/Admin/PurchaseReturn`);
        break;
      case 'salesman':
        setBrowserUrl(`${baseUrl}/Admin/Viewsalesman`);
        break;
      case 'administration':
        setBrowserUrl(`${baseUrl}/Admin/Viewadmin`);
        break;
      default:
        setBrowserUrl(`${baseUrl}/`);
    }
  }, [currentView, user]);

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

  const login = (name: string, role: 'Admin' | 'cashier' | 'Store Manager', pass: string) => {
    if (pass === '1234' || pass.length > 0) {
      const session: UserSession = { name: name || 'Admin', role };
      setUser(session);
      setCurrentView('dashboard');
      return true;
    }
    return false;
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
    setCustomers((prev) => [{ ...c, id: newId }, ...prev]);
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
    const newOrderId = orders.length > 0 ? Math.max(...orders.map((o) => o.orderId)) + 1 : 205;
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
    URL.revokeObjectURL(url);
  };

  const importDatabaseBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products && Array.isArray(parsed.products)) setProducts(parsed.products);
      if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
      if (parsed.vendors && Array.isArray(parsed.vendors)) setVendors(parsed.vendors);
      if (parsed.expenses && Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (parsed.orders && Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (parsed.storeSettings) setStoreSettings(parsed.storeSettings);
      return true;
    } catch {
      return false;
    }
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setExpenses(INITIAL_EXPENSES);
    setOrders(INITIAL_ORDERS);
    setCategories(INITIAL_CATEGORIES);
    setStoreSettings(DEFAULT_SETTINGS);
  };

  // Calculate live KPI metrics
  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchase = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const customerBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const vendorBalance = vendors.reduce((sum, v) => sum + v.balance, 0);
  const todayInvoices = orders.filter((o) => o.date === '2026-11-05' || o.date === new Date().toISOString().split('T')[0]).length;
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
        login,
        logout,
        currentView,
        setCurrentView,
        sidebarOpen,
        setSidebarOpen,
        browserUrl,
        setBrowserUrl,
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
        salesmen,
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
        resetToDemoData,
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
