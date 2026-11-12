import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { isCloudConfigured, supabase } from '../lib/supabase';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  currency: string;
  footerNote: string;
}

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'Admin';
}

export interface HeldBill {
  id: string;
  heldAt: string;
  customerName: string;
  customerId: number;
  items: CartItem[];
  note: string;
}

type CloudState = 'unconfigured' | 'loading' | 'ready' | 'error';
type SaveState = 'saved' | 'saving' | 'error';

interface CloudSnapshot {
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  expenses: Expense[];
  orders: Order[];
  banks: BankAccount[];
  salesmen: Salesman[];
  categories: string[];
  heldBills: HeldBill[];
  storeSettings: StoreSettings;
}

const LEGACY_DATA_KEYS = [
  'regal_products',
  'regal_customers',
  'regal_vendors',
  'regal_expenses',
  'regal_orders',
  'regal_banks',
  'regal_salesmen',
  'regal_categories',
  'regal_settings',
  'regal_held_bills',
];

interface PosContextType {
  user: UserSession | null;
  demoMode: boolean;
  exitDemo: () => void;
  cloudConfigured: boolean;
  authLoading: boolean;
  cloudState: CloudState;
  cloudError: string;
  clearCloudError: () => void;
  storeId: string | null;
  storeName: string;
  subscriptionStatus: string;
  setupFeePaidAt: string | null;
  subscriptionRenewsAt: string | null;
  saveState: SaveState;
  saveError: string;
  registerBusiness: (storeName: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshCloudData: () => Promise<void>;
  retryCloudSave: () => void;
  uploadProductImage: (file: File) => Promise<string>;
  saveHeldBillsNow: (bills: HeldBill[]) => Promise<void>;
  legacyImportAvailable: boolean;
  migrateLegacyLocalData: () => Promise<void>;
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
  createOrder: (orderData: Omit<Order, 'orderId'>) => Promise<Order>;
  refundItem: (orderId: number, productId: number, quantity: number, refundAmount: number) => boolean;

  banks: BankAccount[];
  addBank: (bank: Omit<BankAccount, 'id'>) => void;
  deleteBank: (id: number) => void;
  salesmen: Salesman[];
  addSalesman: (salesman: Omit<Salesman, 'id'>) => void;
  deleteSalesman: (id: number) => void;
  categories: string[];
  addCategory: (cat: string) => void;
  heldBills: HeldBill[];
  setHeldBills: React.Dispatch<React.SetStateAction<HeldBill[]>>;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;

  activePrintOrder: Order | null;
  setActivePrintOrder: (order: Order | null) => void;
  printFormat: 'thermal' | 'a4';
  setPrintFormat: (format: 'thermal' | 'a4') => void;

  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonString: string) => Promise<boolean>;
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

const createDemoSnapshot = (): CloudSnapshot => {
  const now = new Date();
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const products: Product[] = [
    { id: 1, name: 'Embroidered Lawn Suit - Medium', price: 6850, cost: 4900, discount: 0, barcode: '890100100001', category: 'Garments', quantityLimit: 2, stock: 8 },
    { id: 2, name: 'Sourdough Bread Loaf', price: 650, cost: 390, discount: 0, barcode: '890100100002', category: 'Bakery', quantityLimit: 4, stock: 12 },
    { id: 3, name: 'Vitamin C 500mg (20 tablets)', price: 420, cost: 285, discount: 0, barcode: '890100100003', category: 'Pharmacy', quantityLimit: 5, stock: 3 },
    { id: 4, name: 'Wireless Mouse', price: 1850, cost: 1320, discount: 5, barcode: '890100100004', category: 'Electronics', quantityLimit: 3, stock: 14 },
    { id: 5, name: 'Chocolate Cupcake', price: 220, cost: 110, discount: 0, barcode: '890100100005', category: 'Bakery', quantityLimit: 6, stock: 18 },
    { id: 6, name: 'Cotton T-Shirt - Large', price: 1450, cost: 850, discount: 0, barcode: '890100100006', category: 'Garments', quantityLimit: 3, stock: 9 },
    { id: 7, name: 'Digital Thermometer', price: 950, cost: 620, discount: 0, barcode: '890100100007', category: 'Clinic Supplies', quantityLimit: 4, stock: 2 },
    { id: 8, name: 'Gift Wrapping Service', price: 150, cost: 40, discount: 0, barcode: '890100100008', category: 'Services', quantityLimit: 0, stock: 999 },
  ];
  const customers: Customer[] = [
    { id: 1, name: 'Walk In', phone: '', balance: 0, totalPurchasing: 0, totalPaid: 0 },
    { id: 2, name: 'Ayesha Khan', phone: '0300 1234567', address: 'Lahore', balance: 350, totalPurchasing: 6420, totalPaid: 6070 },
    { id: 3, name: 'Hassan Ali', phone: '0321 7654321', address: 'Lahore', balance: 0, totalPurchasing: 3850, totalPaid: 3850 },
  ];
  const orderItem = (productId: number, quantity: number): OrderItem => {
    const product = products.find((item) => item.id === productId)!;
    return {
      productId,
      name: product.name,
      price: product.price,
      cost: product.cost,
      quantity,
      pDiscount: 0,
      total: product.price * quantity,
    };
  };
  const orders: Order[] = [
    {
      orderId: 1048,
      customerName: 'Walk In',
      customerId: 1,
      date: dateKey(now),
      time: '11:42',
      items: [orderItem(1, 1), orderItem(4, 2), orderItem(6, 2)],
      subtotal: 2630,
      totalDiscount: 0,
      tax: 0,
      totalPrice: 2630,
      amountPaid: 2630,
      changeDue: 0,
      paymentMethod: 'Cash',
      cashier: 'Demo Owner',
    },
    {
      orderId: 1047,
      customerName: 'Ayesha Khan',
      customerId: 2,
      date: dateKey(yesterday),
      time: '16:18',
      items: [orderItem(2, 2), orderItem(8, 3)],
      subtotal: 1880,
      totalDiscount: 0,
      tax: 0,
      totalPrice: 1880,
      amountPaid: 1880,
      changeDue: 0,
      paymentMethod: 'Card',
      cashier: 'Demo Owner',
    },
  ];

  return {
    products,
    customers,
    vendors: [
      { id: 1, name: 'City Wholesale Foods', contact: '042 555 0180', balance: 12500, totalPurchasing: 98500 },
      { id: 2, name: 'Fresh Dairy Supply', contact: '0300 555 2030', balance: 0, totalPurchasing: 32750 },
    ],
    expenses: [
      { id: 1, type: 'Utilities', expense: 'Electricity bill', amount: 8200, date: dateKey(now), notes: 'Monthly bill' },
      { id: 2, type: 'Shop', expense: 'Packing supplies', amount: 1450, date: dateKey(yesterday) },
    ],
    orders,
    banks: [
      { id: 1, bankName: 'Demo Cash Drawer', accountTitle: 'Asaan Demo Store', accountNumber: 'DEMO-001', balance: 45800 },
    ],
    salesmen: [
      { id: 1, name: 'Ali Raza', phone: '0301 555 0199', commissionRate: 2, totalSales: 18450 },
    ],
    categories: [...new Set(products.map((product) => product.category))],
    heldBills: [],
    storeSettings: {
      storeName: 'Asaan Demo Store',
      tagline: 'Your neighborhood store',
      address: 'Main Market, Lahore',
      phone: '0300 000 0000',
      currency: 'Rs.',
      footerNote: 'Thank You for Shopping!',
    },
  };
};

const DEMO_SNAPSHOT = createDemoSnapshot();

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
  isNumber(value.stock) &&
  (value.imageUrl === undefined || isString(value.imageUrl));

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

const isHeldBill = (value: unknown): value is HeldBill =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.heldAt) &&
  isString(value.customerName) &&
  isNumber(value.customerId) &&
  isArrayOf(value.items, isCartItem) &&
  isString(value.note);

const isCloudSnapshot = (value: unknown): value is CloudSnapshot =>
  isRecord(value) &&
  isArrayOf(value.products, isProduct) &&
  isArrayOf(value.customers, isCustomer) &&
  isArrayOf(value.vendors, isVendor) &&
  isArrayOf(value.expenses, isExpense) &&
  isArrayOf(value.orders, isOrder) &&
  isArrayOf(value.banks, isBankAccount) &&
  isArrayOf(value.salesmen, isSalesman) &&
  isArrayOf(value.categories, isString) &&
  isArrayOf(value.heldBills, isHeldBill) &&
  isStoreSettings(value.storeSettings);

const isStoreSettings = (value: unknown): value is StoreSettings =>
  isRecord(value) &&
  isString(value.storeName) &&
  isString(value.tagline) &&
  isString(value.address) &&
  isString(value.phone) &&
  isString(value.currency) &&
  isString(value.footerNote);

const normalizeStoreSettings = (settings: StoreSettings): StoreSettings =>
  settings.storeName.trim().toLocaleLowerCase() === 'regal pos'
    ? { ...settings, storeName: 'Asaan POS' }
    : settings;

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoMode] = useState(() => new URLSearchParams(window.location.search).get('demo') === '1');
  const [user, setUser] = useState<UserSession | null>(() =>
    new URLSearchParams(window.location.search).get('demo') === '1'
      ? { id: 'public-demo', email: '', name: 'Demo Owner', role: 'Admin' }
      : null
  );
  const [authLoading, setAuthLoading] = useState(() =>
    !(new URLSearchParams(window.location.search).get('demo') === '1') && isCloudConfigured
  );
  const [cloudState, setCloudState] = useState<CloudState>(() =>
    new URLSearchParams(window.location.search).get('demo') === '1'
      ? 'ready'
      : isCloudConfigured ? 'loading' : 'unconfigured'
  );
  const [cloudError, setCloudError] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState(() =>
    new URLSearchParams(window.location.search).get('demo') === '1' ? 'Asaan Demo Store' : ''
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(() =>
    new URLSearchParams(window.location.search).get('demo') === '1' ? 'active' : 'pending_payment'
  );
  const [setupFeePaidAt, setSetupFeePaidAt] = useState<string | null>(null);
  const [subscriptionRenewsAt, setSubscriptionRenewsAt] = useState<string | null>(null);
  const [cloudRevision, setCloudRevision] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [saveError, setSaveError] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);
  const lastSavedSnapshot = useRef('');
  const latestSnapshot = useRef('');
  const revisionRef = useRef(0);
  const [currentView, setCurrentView] = useState<AppView>('login');

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 861px)').matches
  );

  useEffect(() => {
    const desktopLayout = window.matchMedia('(min-width: 861px)');
    const syncSidebar = () => setSidebarOpen(desktopLayout.matches);
    desktopLayout.addEventListener('change', syncSidebar);
    return () => desktopLayout.removeEventListener('change', syncSidebar);
  }, []);

  const [products, setProducts] = useState<Product[]>(() => demoMode ? DEMO_SNAPSHOT.products : INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(() => demoMode ? DEMO_SNAPSHOT.customers : INITIAL_CUSTOMERS);
  const [vendors, setVendors] = useState<Vendor[]>(() => demoMode ? DEMO_SNAPSHOT.vendors : INITIAL_VENDORS);
  const [expenses, setExpenses] = useState<Expense[]>(() => demoMode ? DEMO_SNAPSHOT.expenses : INITIAL_EXPENSES);
  const [orders, setOrders] = useState<Order[]>(() => demoMode ? DEMO_SNAPSHOT.orders : INITIAL_ORDERS);
  const [banks, setBanks] = useState<BankAccount[]>(() => demoMode ? DEMO_SNAPSHOT.banks : INITIAL_BANKS);
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => demoMode ? DEMO_SNAPSHOT.salesmen : INITIAL_SALESMEN);
  const [categories, setCategories] = useState<string[]>(() => demoMode ? DEMO_SNAPSHOT.categories : INITIAL_CATEGORIES);
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => demoMode ? DEMO_SNAPSHOT.heldBills : []);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => demoMode ? DEMO_SNAPSHOT.storeSettings : DEFAULT_SETTINGS);

  // Print modal
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');

  const clearStoreData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setExpenses(INITIAL_EXPENSES);
    setOrders(INITIAL_ORDERS);
    setBanks(INITIAL_BANKS);
    setSalesmen(INITIAL_SALESMEN);
    setCategories(INITIAL_CATEGORIES);
    setHeldBills([]);
    setStoreSettings(DEFAULT_SETTINGS);
  }, []);

  useEffect(() => {
    if (demoMode) {
      setCurrentView('dashboard');
      setAuthLoading(false);
      setSaveState('saved');
      return;
    }
    if (!supabase) {
      setAuthLoading(false);
      setCloudState('unconfigured');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user;
      setUser(activeUser ? {
        id: activeUser.id,
        email: activeUser.email ?? '',
        name: activeUser.user_metadata.store_name ?? activeUser.email ?? 'Store owner',
        role: 'Admin',
      } : null);
      setAuthLoading(false);
      setCloudState(activeUser ? 'loading' : 'ready');
      setCurrentView(activeUser ? 'dashboard' : 'login');
      if (!activeUser) {
        setStoreId(null);
        setStoreName('');
        clearStoreData();
        lastSavedSnapshot.current = '';
        latestSnapshot.current = '';
        revisionRef.current = 0;
        setCloudRevision(0);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setCloudError(error.message);
        setCloudState('error');
      }
      const activeUser = data.session?.user;
      setUser(activeUser ? {
        id: activeUser.id,
        email: activeUser.email ?? '',
        name: activeUser.user_metadata.store_name ?? activeUser.email ?? 'Store owner',
        role: 'Admin',
      } : null);
      setAuthLoading(false);
      setCurrentView(activeUser ? 'dashboard' : 'login');
      setCloudState(activeUser ? 'loading' : 'ready');
    });

    return () => subscription.unsubscribe();
  }, [clearStoreData, demoMode]);

  const applyCloudSnapshot = useCallback((snapshot: CloudSnapshot) => {
    const normalized = {
      ...snapshot,
      storeSettings: normalizeStoreSettings(snapshot.storeSettings),
    };
    setProducts(normalized.products);
    setCustomers(normalized.customers);
    setVendors(normalized.vendors);
    setExpenses(normalized.expenses);
    setOrders(normalized.orders);
    setBanks(normalized.banks);
    setSalesmen(normalized.salesmen);
    setCategories(normalized.categories);
    setHeldBills(normalized.heldBills);
    setStoreSettings(normalized.storeSettings);
    const serialized = JSON.stringify(normalized);
    lastSavedSnapshot.current = serialized;
    latestSnapshot.current = serialized;
  }, []);

  const refreshCloudData = useCallback(async () => {
    try {
      if (!supabase || !user) throw new Error('Sign in to load this store.');
      const { data, error } = await supabase.rpc('get_my_store_snapshot');
      if (error) throw error;
      const record = Array.isArray(data) ? data[0] : data;
      if (!isRecord(record) || !isString(record.store_id) || !isString(record.store_name) ||
          !isString(record.subscription_status) || !isNumber(record.revision) ||
          !isRecord(record.snapshot)) {
        throw new Error('The cloud returned an invalid store snapshot.');
      }
      if (!isCloudSnapshot(record.snapshot)) {
        throw new Error('The store data in the cloud is incomplete or invalid. No local data was changed.');
      }

      applyCloudSnapshot(record.snapshot);
      setStoreId(record.store_id);
      setStoreName(record.store_name);
      setSubscriptionStatus(record.subscription_status);
      setSetupFeePaidAt(isString(record.setup_fee_paid_at) ? record.setup_fee_paid_at : null);
      setSubscriptionRenewsAt(isString(record.subscription_renews_at) ? record.subscription_renews_at : null);
      revisionRef.current = record.revision;
      setCloudRevision(record.revision);
      setCloudState('ready');
      setCloudError('');
      setSaveError('');
      setSaveState('saved');
    } catch (error) {
      setCloudState('error');
      setCloudError(error instanceof Error ? error.message : 'Unable to load this store from the cloud.');
      throw error;
    }
  }, [applyCloudSnapshot, user]);

  useEffect(() => {
    if (!user || !supabase) return;
    let active = true;
    setCloudState('loading');
    void refreshCloudData().catch((error: unknown) => {
      if (!active) return;
      setCloudState('error');
      setCloudError(error instanceof Error ? error.message : 'Unable to load this store from the cloud.');
    });
    return () => { active = false; };
  }, [refreshCloudData, user]);

  useEffect(() => {
    const client = supabase;
    if (!client || !storeId || cloudState !== 'ready') return;
    const channel = client
      .channel(`store-data-${storeId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'store_data',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        const remoteRevision = payload.new.revision;
        if (typeof remoteRevision !== 'number' || remoteRevision === revisionRef.current) return;
        if (JSON.stringify(payload.new.snapshot) === latestSnapshot.current) return;
        if (latestSnapshot.current !== lastSavedSnapshot.current) {
          setSaveError('This store changed on another device while you were editing. Reload cloud data before continuing.');
          setSaveState('error');
          return;
        }
        void refreshCloudData().catch((error: unknown) => {
          setCloudError(error instanceof Error ? error.message : 'Unable to refresh cloud data.');
          setCloudState('error');
        });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setCloudError('Live updates are disconnected. Check your internet connection.');
        }
      });
    return () => { void client.removeChannel(channel); };
  }, [cloudState, refreshCloudData, storeId]);

  const snapshot: CloudSnapshot = {
    products, customers, vendors, expenses, orders, banks, salesmen, categories, heldBills, storeSettings,
  };
  const serializedSnapshot = JSON.stringify(snapshot);
  latestSnapshot.current = serializedSnapshot;

  useEffect(() => {
    const client = supabase;
    if (!client || !user || !storeId || cloudState !== 'ready' ||
        serializedSnapshot === lastSavedSnapshot.current) return;

    setSaveState('saving');
    const timeout = window.setTimeout(() => {
      void client.rpc('save_my_store_snapshot', {
        p_snapshot: JSON.parse(serializedSnapshot),
        p_expected_revision: revisionRef.current,
      }).then(({ data, error }) => {
        if (error) {
          setSaveError(error.message.includes('STORE_DATA_CONFLICT')
            ? 'This store changed on another device. Reload cloud data before editing again.'
            : `Cloud save failed: ${error.message}`);
          setSaveState('error');
          return;
        }
        if (typeof data !== 'number') {
          setSaveError('The cloud did not confirm the save. Refresh the store before continuing.');
          setSaveState('error');
          return;
        }
        revisionRef.current = data;
        setCloudRevision(data);
        lastSavedSnapshot.current = serializedSnapshot;
        setSaveError('');
        setSaveState('saved');
      }, (error: unknown) => {
        setSaveError(error instanceof Error ? `Cloud save failed: ${error.message}` : 'Cloud save failed.');
        setSaveState('error');
      });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [cloudRevision, cloudState, retryCounter, serializedSnapshot, storeId, user]);

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

  const registerBusiness = async (name: string, email: string, password: string) => {
    if (!supabase) throw new Error('Cloud accounts are not configured. Add the Supabase project URL and public key.');
    if (name.trim().length < 2 || name.trim().length > 120) {
      throw new Error('Enter a store name between 2 and 120 characters.');
    }
    if (password.length < 10) throw new Error('Choose a password with at least 10 characters.');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { store_name: name.trim() } },
    });
    if (error) throw error;
    if (data.session) setCurrentView('dashboard');
    return Boolean(data.session);
  };

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Cloud accounts are not configured. Add the Supabase project URL and public key.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    setCurrentView('dashboard');
    return Boolean(data.session);
  };

  const logout = async () => {
    if (demoMode) {
      window.location.assign(window.location.pathname);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setCloudError(`Unable to sign out: ${error.message}`);
      return;
    }
    setCurrentView('login');
  };

  const retryCloudSave = () => setRetryCounter((counter) => counter + 1);

  const uploadProductImage = async (file: File): Promise<string> => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Choose a JPG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Product images must be 5 MB or smaller.');
    }
    if (demoMode) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Could not read the selected image.'));
        reader.onerror = () => reject(new Error('Could not read the selected image.'));
        reader.readAsDataURL(file);
      });
    }
    if (!supabase || !storeId || cloudState !== 'ready' || subscriptionStatus !== 'active') {
      throw new Error('An active cloud store is required to upload product images.');
    }

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const imagePath = `${storeId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(imagePath, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Image upload failed: ${error.message}`);

    return supabase.storage.from('product-images').getPublicUrl(imagePath).data.publicUrl;
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

  const persistCloudSnapshot = async (value: CloudSnapshot) => {
    if (demoMode) return;
    if (!supabase || !storeId || cloudState !== 'ready') {
      setSaveState('error');
      setSaveError('The store is not connected to the cloud. The sale was not saved.');
      throw new Error('The store is not connected to the cloud. The sale was not saved.');
    }
    if (!navigator.onLine) {
      setSaveState('error');
      setSaveError('You are offline. The sale was not saved; reconnect before checkout.');
      throw new Error('You are offline. The sale was not saved; reconnect before checkout.');
    }
    const serialized = JSON.stringify(value);
    setSaveState('saving');
    const { data, error } = await supabase.rpc('save_my_store_snapshot', {
      p_snapshot: value,
      p_expected_revision: revisionRef.current,
    });
    if (error) {
      setSaveState('error');
      setSaveError(`Cloud save failed: ${error.message}`);
      throw error;
    }
    if (typeof data !== 'number') {
      setSaveState('error');
      setSaveError('The cloud did not confirm the save. Refresh the store before continuing.');
      throw new Error('The cloud did not confirm the save.');
    }
    revisionRef.current = data;
    lastSavedSnapshot.current = serialized;
    latestSnapshot.current = serialized;
    setCloudRevision(data);
    setSaveError('');
    setSaveState('saved');
  };

  const createOrder = async (orderData: Omit<Order, 'orderId'>): Promise<Order> => {
    const newOrderId = orders.length > 0 ? Math.max(...orders.map((o) => o.orderId)) + 1 : 1;
    const newOrder: Order = {
      ...orderData,
      orderId: newOrderId,
    };

    const nextProducts = products.map((prod) => {
        const soldItem = orderData.items.find((item) => item.productId === prod.id);
        if (soldItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - soldItem.quantity),
          };
        }
        return prod;
    });

    const nextCustomers = orderData.customerId
      ? customers.map((c) => {
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
      : customers;
    const nextOrders = [newOrder, ...orders];
    await persistCloudSnapshot({
      products: nextProducts,
      customers: nextCustomers,
      vendors,
      expenses,
      orders: nextOrders,
      banks,
      salesmen,
      categories,
      heldBills,
      storeSettings,
    });
    setProducts(nextProducts);
    setCustomers(nextCustomers);
    setOrders(nextOrders);
    return newOrder;
  };

  const saveHeldBillsNow = async (bills: HeldBill[]) => {
    await persistCloudSnapshot({
      products,
      customers,
      vendors,
      expenses,
      orders,
      banks,
      salesmen,
      categories,
      heldBills: bills,
      storeSettings,
    });
  };

  const legacyImportAvailable = Boolean(
    storeId &&
    cloudState === 'ready' &&
    subscriptionStatus === 'active' &&
    localStorage.getItem(`asaan_pos_legacy_imported_${storeId}`) !== 'true' &&
    LEGACY_DATA_KEYS.some((key) => localStorage.getItem(key) !== null) &&
    products.length === 0 &&
    vendors.length === 0 &&
    expenses.length === 0 &&
    orders.length === 0 &&
    banks.length === 0 &&
    salesmen.length === 0 &&
    categories.length === 0 &&
    heldBills.length === 0 &&
    customers.every((customer) => customer.name === 'Walk In' && customer.balance === 0)
  );

  const migrateLegacyLocalData = async () => {
    if (!legacyImportAvailable || !storeId) {
      throw new Error('Legacy import is only available for an empty, active cloud store.');
    }

    const readLegacy = <T,>(key: string, validate: (value: unknown) => value is T, fallback: T): T => {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return fallback;
      let value: unknown;
      try {
        value = JSON.parse(serialized);
      } catch {
        throw new Error(`The previous device data in "${key}" is not valid JSON. Nothing was imported.`);
      }
      if (!validate(value)) {
        throw new Error(`The previous device data in "${key}" has an invalid format. Nothing was imported.`);
      }
      return value;
    };

    const legacySnapshot: CloudSnapshot = {
      products: readLegacy('regal_products', (value): value is Product[] => isArrayOf(value, isProduct), []),
      customers: readLegacy('regal_customers', (value): value is Customer[] => isArrayOf(value, isCustomer), customers),
      vendors: readLegacy('regal_vendors', (value): value is Vendor[] => isArrayOf(value, isVendor), []),
      expenses: readLegacy('regal_expenses', (value): value is Expense[] => isArrayOf(value, isExpense), []),
      orders: readLegacy('regal_orders', (value): value is Order[] => isArrayOf(value, isOrder), []),
      banks: readLegacy('regal_banks', (value): value is BankAccount[] => isArrayOf(value, isBankAccount), []),
      salesmen: readLegacy('regal_salesmen', (value): value is Salesman[] => isArrayOf(value, isSalesman), []),
      categories: readLegacy('regal_categories', (value): value is string[] => isArrayOf(value, isString), []),
      heldBills: readLegacy('regal_held_bills', (value): value is HeldBill[] => isArrayOf(value, isHeldBill), []),
      storeSettings: readLegacy('regal_settings', isStoreSettings, storeSettings),
    };

    await persistCloudSnapshot(legacySnapshot);
    setProducts(legacySnapshot.products);
    setCustomers(legacySnapshot.customers);
    setVendors(legacySnapshot.vendors);
    setExpenses(legacySnapshot.expenses);
    setOrders(legacySnapshot.orders);
    setBanks(legacySnapshot.banks);
    setSalesmen(legacySnapshot.salesmen);
    setCategories(legacySnapshot.categories);
    setHeldBills(legacySnapshot.heldBills);
    setStoreSettings(legacySnapshot.storeSettings);
    localStorage.setItem(`asaan_pos_legacy_imported_${storeId}`, 'true');
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

  const updateStoreSettings = async (settings: StoreSettings) => {
    const updatedSettings = normalizeStoreSettings(settings);
    await persistCloudSnapshot({
      products,
      customers,
      vendors,
      expenses,
      orders,
      banks,
      salesmen,
      categories,
      heldBills,
      storeSettings: updatedSettings,
    });
    setStoreSettings(updatedSettings);
  };

  // Export a portable recovery copy of the active cloud snapshot.
  const exportDatabaseBackup = () => {
    const backupData = {
      app: 'Asaan POS',
      version: '4.2',
      exportDate: new Date().toISOString(),
      products,
      customers,
      vendors,
      expenses,
      orders,
      banks,
      salesmen,
      heldBills,
      categories,
      storeSettings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AsaanPOS_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importDatabaseBackup = async (jsonString: string): Promise<boolean> => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return false;
    }

    if (!isRecord(parsed) || (parsed.app !== 'Asaan POS' && parsed.app !== 'Regal POS')) return false;
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

    const restoredSnapshot: CloudSnapshot = {
      products: data.products,
      customers: data.customers,
      vendors: data.vendors,
      expenses: data.expenses,
      orders: data.orders,
      banks: data.banks ?? [],
      salesmen: data.salesmen ?? [],
      categories: data.categories,
      heldBills: data.heldBills ?? [],
      storeSettings: normalizeStoreSettings(data.storeSettings),
    };
    await persistCloudSnapshot(restoredSnapshot);
    setProducts(restoredSnapshot.products);
    setCustomers(restoredSnapshot.customers);
    setVendors(restoredSnapshot.vendors);
    setExpenses(restoredSnapshot.expenses);
    setOrders(restoredSnapshot.orders);
    setBanks(restoredSnapshot.banks);
    setSalesmen(restoredSnapshot.salesmen);
    setCategories(restoredSnapshot.categories);
    setHeldBills(restoredSnapshot.heldBills);
    setStoreSettings(restoredSnapshot.storeSettings);
    return true;
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
        demoMode,
        exitDemo: () => {
          if (demoMode) window.location.assign(window.location.pathname);
        },
        cloudConfigured: isCloudConfigured,
        authLoading,
        cloudState,
        cloudError,
        clearCloudError: () => setCloudError(''),
        storeId,
        storeName,
        subscriptionStatus,
        setupFeePaidAt,
        subscriptionRenewsAt,
        saveState,
        saveError,
        registerBusiness,
        login,
        logout,
        refreshCloudData,
        retryCloudSave,
        uploadProductImage,
        saveHeldBillsNow,
        legacyImportAvailable,
        migrateLegacyLocalData,
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
        heldBills,
        setHeldBills,
        storeSettings,
        updateStoreSettings,
        activePrintOrder,
        setActivePrintOrder,
        printFormat,
        setPrintFormat,
        exportDatabaseBackup,
        importDatabaseBackup,
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
