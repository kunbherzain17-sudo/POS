import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  UserPlus,
  ArrowLeft,
  Calendar,
  Grid,
  List,
  CheckCircle2,
  Volume2,
  DollarSign,
  Smartphone,
  Layers,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Product, CartItem, Order, Customer } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface HeldBill {
  id: string;
  heldAt: string;
  customerName: string;
  customerId: number;
  items: CartItem[];
  note: string;
}

export const PosInvoice: React.FC = () => {
  const {
    products,
    customers,
    categories,
    createOrder,
    setActivePrintOrder,
    setPrintFormat,
    setCurrentView,
    user,
    banks,
    salesmen,
    addCustomer,
    playScanBeep,
    storeSettings,
  } = usePos();

  // Active Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Barcode and Catalog Search
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'table'>('grid');

  // Mobile Tab Switcher ('cart' | 'catalog')
  const [mobileTab, setMobileTab] = useState<'cart' | 'catalog'>('cart');

  // Held Bills queue (Hold / Recall)
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    const saved = localStorage.getItem('regal_held_bills');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('Cash');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('None');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit' | 'Card'>('Cash');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  // Quick Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Real-time Clock
  const [clockStr, setClockStr] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockStr(`${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString()}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save held bills to localStorage
  useEffect(() => {
    localStorage.setItem('regal_held_bills', JSON.stringify(heldBills));
  }, [heldBills]);

  // Focus barcode input on mount and after actions
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Global Keyboard Shortcuts (F2 for Payment, F4 for Hold Bill, F8 for Clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (cartItems.length > 0) {
          setShowPaymentModal(true);
        } else {
          alert('Cart is empty. Please add items before opening payment.');
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cartItems.length > 0) {
          handleHoldBill();
        } else if (heldBills.length > 0) {
          setShowHeldBillsModal(true);
        }
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleClearCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, heldBills]);

  // Add product to cart with sound feedback
  const handleAddToCart = (product: Product, quantityToAdd = 1) => {
    playScanBeep();

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const item = { ...updated[existingIndex] };
        item.quantity += quantityToAdd;
        const discountAmt = (item.price * item.quantity * item.discountPercent) / 100;
        item.total = Math.max(0, item.price * item.quantity - discountAmt);
        updated[existingIndex] = item;
        return updated;
      } else {
        const itemDiscount = product.discount || 0;
        const lineTotal = Math.max(
          0,
          product.price * quantityToAdd - (product.price * quantityToAdd * itemDiscount) / 100
        );
        const newItem: CartItem = {
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          cost: product.cost,
          quantity: quantityToAdd,
          discountPercent: itemDiscount,
          total: lineTotal,
        };
        return [...prev, newItem];
      }
    });

    // Auto-focus back to barcode scanner
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Barcode Omnibox Enter Listener
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeSearch.trim().toLowerCase();
    if (!query) return;

    // Search by exact barcode first, then partial barcode, then product name
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === query ||
        p.name.toLowerCase() === query ||
        p.name.toLowerCase().includes(query)
    );

    if (match) {
      handleAddToCart(match, 1);
      setBarcodeSearch('');
    } else {
      alert(`No product found matching "${barcodeSearch}". Please verify the barcode.`);
    }
  };

  // Quantity and Discount adjustments
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.quantity = newQty;
      const discountAmt = (item.price * item.quantity * item.discountPercent) / 100;
      item.total = Math.max(0, item.price * item.quantity - discountAmt);
      updated[index] = item;
      return updated;
    });
  };

  const handleUpdateItemDiscount = (index: number, discPercent: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.discountPercent = Math.max(0, Math.min(100, discPercent));
      const discountAmt = (item.price * item.quantity * item.discountPercent) / 100;
      item.total = Math.max(0, item.price * item.quantity - discountAmt);
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm('Are you sure you want to clear the active cart?')) {
      setCartItems([]);
      setOrderDiscount(0);
      setTaxPercent(0);
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    }
  };

  // Hold active bill
  const handleHoldBill = () => {
    if (cartItems.length === 0) return;
    const currentCust = customers.find((c) => c.id === selectedCustomerId);
    const newHeld: HeldBill = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: currentCust?.name || 'Walk-in Customer',
      customerId: selectedCustomerId,
      items: [...cartItems],
      note: `Bill with ${cartItems.length} items (${cartItems.reduce(
        (sum, it) => sum + it.quantity,
        0
      )} pcs)`,
    };

    setHeldBills((prev) => [newHeld, ...prev]);
    setCartItems([]);
    alert(`Order put on Hold (${newHeld.id}). You can recall it anytime!`);
  };

  // Recall held bill
  const handleRecallBill = (bill: HeldBill) => {
    if (cartItems.length > 0) {
      if (
        !confirm(
          'Active cart is not empty! Loading this held bill will replace current items. Continue?'
        )
      ) {
        return;
      }
    }
    setCartItems(bill.items);
    setSelectedCustomerId(bill.customerId);
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id));
    setShowHeldBillsModal(false);
  };

  // Create Quick Customer
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '03000000000',
      address: newCustAddress.trim() || 'Karachi',
      cnic: '42101-0000000-0',
      balance: 0,
      totalPurchasing: 0,
      totalPaid: 0,
    });

    const newCust = customers[0];
    if (newCust) {
      setSelectedCustomerId(newCust.id);
    }
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowAddCustomerModal(false);
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, it) => acc + it.total, 0);
  const totalItemCount = cartItems.length;
  const totalQtyCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const calculatedTax = (cartSubtotal * taxPercent) / 100;
  const netPayable = Math.max(0, cartSubtotal - orderDiscount + calculatedTax);

  // Quick cash tender helper
  const handleAddQuickCash = (amount: number) => {
    const current = parseFloat(paidAmountInput) || 0;
    setPaidAmountInput((current + amount).toString());
  };

  // Checkout and Print
  const handleFinalizeCheckout = (format: 'thermal' | 'a4' | 'none') => {
    if (cartItems.length === 0) return;

    const currentCustomer =
      customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const amountPaidVal =
      paidAmountInput === '' ? netPayable : parseFloat(paidAmountInput) || 0;
    const changeDueVal = Math.max(0, amountPaidVal - netPayable);

    const orderData: Omit<Order, 'orderId'> = {
      customerName: currentCustomer.name,
      customerId: currentCustomer.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      items: cartItems.map((c) => ({
        productId: c.productId,
        name: c.name,
        price: c.price,
        cost: c.cost,
        quantity: c.quantity,
        pDiscount: (c.price * c.quantity * c.discountPercent) / 100,
        total: c.total,
      })),
      subtotal: cartSubtotal,
      totalDiscount: orderDiscount,
      tax: calculatedTax,
      totalPrice: netPayable,
      amountPaid: amountPaidVal,
      changeDue: changeDueVal,
      paymentMethod: paymentMethod === 'Credit' ? 'Card' : paymentMethod,
      cashier: user?.name || 'Admin',
    };

    const newOrder = createOrder(orderData);
    playScanBeep();

    if (format !== 'none') {
      setPrintFormat(format);
      setActivePrintOrder(newOrder);
    }

    // Reset Terminal for next sale
    setCartItems([]);
    setPaidAmountInput('');
    setOrderDiscount(0);
    setTaxPercent(0);
    setShowPaymentModal(false);

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Filter products for catalog
  const filteredProducts = products.filter((prod) => {
    const matchesCat =
      selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !catalogSearch ||
      prod.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.barcode.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none pb-12 md:pb-0">
      {/* Top Banner & Header matching Regal POS theme */}
      <header className="bg-[#866EC7] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Brand and Return to Dashboard */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition"
              title="Return to Backoffice Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <img
                src="/assets/regalposlogo.png"
                alt="Regal POS"
                className="h-8 sm:h-9 object-contain drop-shadow"
              />
              <div className="hidden lg:block leading-tight border-l border-white/30 pl-2">
                <span className="text-xs font-bold tracking-wide block">
                  {storeSettings.storeName} TERMINAL
                </span>
                <span className="text-[10px] text-purple-200 block truncate max-w-xs">
                  {storeSettings.address}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Clock & Offline Status */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{clockStr}</span>
            </div>
            <OfflineIndicator />
          </div>

          {/* Right: Quick actions & Install Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('salesview')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Today Sales</span>
            </button>

            {/* Held bills indicator */}
            {heldBills.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHeldBillsModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition shadow-xs animate-pulse"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Held ({heldBills.length})</span>
              </button>
            )}

            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Tab Switcher (Visible on mobile/tablet) */}
        <div className="flex md:hidden bg-purple-900/60 border-t border-purple-400/30">
          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-2 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'cart'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            <span>Cart Register</span>
            <span className="bg-purple-700 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {totalItemCount}
            </span>
          </button>
          <button
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-2 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'catalog'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Product Catalog</span>
          </button>
        </div>
      </header>

      {/* Main Cashier Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-3 flex flex-col md:flex-row gap-3 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN: ACTIVE CART & REGISTER (col-md-5 or col-md-6) */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-5/12 lg:w-5/12 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${
            mobileTab === 'cart' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top Register Controls: Customer Selector & Omnibox */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
            {/* Customer row */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Customer Account:
                  </label>
                  {selectedCustomerObj && selectedCustomerObj.balance > 0 && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Balance: Rs. {selectedCustomerObj.balance.toLocaleString()}
                    </span>
                  )}
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="mt-5 p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                title="Quick Add Customer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Barcode Omnibox with Auto-focus */}
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
                <Barcode className="w-4 h-4" />
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                placeholder="Scan barcode or type item name & press Enter..."
                className="w-full pl-9 pr-14 py-2 bg-white border-2 border-[#866EC7] rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#866EC7] hover:bg-purple-700 text-white rounded-md text-xs font-bold transition flex items-center justify-center"
              >
                Add
              </button>
            </form>
          </div>

          {/* Cart Table Container */}
          <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[460px] border-b border-slate-200">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 mb-3 border border-purple-100">
                  <Barcode className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Cart is currently empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Scan a barcode with your scanner or click products on the right catalog to ring
                  up a sale.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">F2: Checkout</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">F4: Hold/Recall</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">F8: Clear</span>
                </div>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#866EC7] text-white sticky top-0 z-10 text-[11px]">
                  <tr>
                    <th className="py-2 px-2.5">Item</th>
                    <th className="py-2 px-1 text-center w-24">Qty</th>
                    <th className="py-2 px-1.5 text-right w-16">Price</th>
                    <th className="py-2 px-1.5 text-right w-14">Disc%</th>
                    <th className="py-2 px-2 text-right w-20">Total</th>
                    <th className="py-2 px-1 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cartItems.map((item, index) => (
                    <tr key={index} className="hover:bg-purple-50/50 transition group">
                      {/* Name & barcode */}
                      <td className="py-2 px-2.5">
                        <div className="font-bold text-slate-900 leading-tight">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.barcode}</div>
                      </td>

                      {/* Qty +/- */}
                      <td className="py-2 px-1">
                        <div className="flex items-center justify-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded text-slate-600 hover:text-rose-600 transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(index, parseInt(e.target.value) || 1)
                            }
                            className="w-8 text-center bg-transparent font-bold text-slate-800 text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded text-slate-600 hover:text-emerald-600 transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-2 px-1.5 text-right font-medium text-slate-700">
                        {item.price.toFixed(0)}
                      </td>

                      {/* Discount % */}
                      <td className="py-2 px-1.5 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || ''}
                          onChange={(e) =>
                            handleUpdateItemDiscount(index, parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-10 text-right bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] font-semibold text-rose-600 focus:bg-white"
                        />
                      </td>

                      {/* Line Total */}
                      <td className="py-2 px-2 text-right font-black text-purple-900">
                        {item.total.toFixed(2)}
                      </td>

                      {/* Remove Button */}
                      <td className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-300 hover:text-rose-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Cart Bottom Summary & Checkout Block */}
          <div className="p-3 bg-slate-50 space-y-2.5">
            {/* Quick discount and tax inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">Bill Discount:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={orderDiscount || ''}
                    onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-14 text-right font-bold text-rose-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium">GST / Tax:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent || ''}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-10 text-right font-bold text-slate-800 focus:outline-none"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Regal POS Grand Total Bar */}
            <div className="bg-[#866EC7] text-white p-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <div className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
                  Items: <span className="text-white font-bold">{totalItemCount}</span> | Pcs:{' '}
                  <span className="text-white font-bold">{totalQtyCount}</span>
                </div>
                <div className="text-xs text-purple-100">
                  Subtotal: Rs. {cartSubtotal.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-purple-200 font-bold uppercase">Net Payable</div>
                <div className="text-2xl font-black tracking-tight leading-none">
                  Rs. {netPayable.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quick Action Button Strip */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleClearCart}
                disabled={cartItems.length === 0}
                className="py-2.5 px-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 disabled:opacity-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                title="Clear current cart (F8)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear (F8)</span>
              </button>

              <button
                type="button"
                onClick={handleHoldBill}
                disabled={cartItems.length === 0}
                className="py-2.5 px-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                title="Hold bill to attend another customer (F4)"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Hold (F4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert('Please add items to cart first.');
                  } else {
                    setShowPaymentModal(true);
                  }
                }}
                disabled={cartItems.length === 0}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 shadow-md"
                title="Proceed to checkout and tender payment (F2)"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay (F2)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: VISUAL PRODUCT CATALOG & INVENTORY PICKER   */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-7/12 lg:w-7/12 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${
            mobileTab === 'catalog' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Catalog Top Filter Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              {/* Product search box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter products by name or code..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* View mode toggle (Grid vs Table) */}
              <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
                <button
                  type="button"
                  onClick={() => setCatalogViewMode('grid')}
                  className={`p-1.5 rounded transition ${
                    catalogViewMode === 'grid'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Card Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogViewMode('table')}
                  className={`p-1.5 rounded transition ${
                    catalogViewMode === 'table'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Stock Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'All'
                    ? 'bg-[#866EC7] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Items ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-[#866EC7] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Display Area */}
          <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-210px)] bg-slate-50/50">
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h5 className="font-bold text-slate-700 text-sm">No products found</h5>
                <p className="text-xs text-slate-500">
                  Try searching with a different term or select another category.
                </p>
              </div>
            ) : catalogViewMode === 'grid' ? (
              /* Visual Product Grid with High-Contrast Stock Pills */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredProducts.map((prod) => {
                  const isLow = prod.stock > 0 && prod.stock <= prod.quantityLimit;
                  const isOut = prod.stock <= 0;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleAddToCart(prod)}
                      className={`p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between active:scale-[0.98] select-none ${
                        isOut ? 'opacity-60 bg-slate-50' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 truncate max-w-[90px]">
                            {prod.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isOut
                                ? 'bg-rose-100 text-rose-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOut ? 'Out of Stock' : `Qty: ${prod.stock}`}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {prod.barcode}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block leading-none">Price</span>
                          <span className="text-sm font-extrabold text-[#866EC7]">
                            Rs. {prod.price.toFixed(0)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-[#866EC7] text-purple-700 hover:text-white flex items-center justify-center transition shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Spreadsheet Style Stock Table (matching original Regal POS stock picker) */
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#9370DB] text-white">
                    <tr>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-center">Available Stock</th>
                      <th className="p-2 text-right">Selling Price</th>
                      <th className="p-2 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => handleAddToCart(p)}
                        className="hover:bg-purple-50 cursor-pointer transition"
                      >
                        <td className="p-2 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2 text-slate-600">{p.category}</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              p.stock <= 0
                                ? 'bg-rose-100 text-rose-700'
                                : p.stock <= p.quantityLimit
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-2 text-right font-black text-purple-900">
                          Rs. {p.price.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary px-2 py-0.5 text-[11px]"
                            style={{ backgroundColor: '#866ec7', borderColor: '#866ec7' }}
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* PAYMENT & CASH DRAWER MODAL (Triggered via F2)            */}
      {/* ========================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Title */}
            <div className="bg-[#866EC7] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-300" />
                <div>
                  <h4 className="font-extrabold text-base leading-tight">Payment & Tender Checkout</h4>
                  <p className="text-[11px] text-purple-200">
                    Customer: {selectedCustomerObj?.name || 'Walk-in'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Grand Total Display */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
                  Net Amount Payable
                </span>
                <span className="text-3xl font-black text-purple-950 mt-1 block">
                  Rs. {netPayable.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total Items: {totalItemCount} ({totalQtyCount} pcs)
                </span>
              </div>

              {/* Payment tender configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank / Drawer:</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="Cash">Cash Drawer</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="Ubl">UBL Bank</option>
                    <option value="cash petty">Cash Petty</option>
                    <option value="Feg">Faysal Bank</option>
                    <option value="soneri">Soneri Bank</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salesperson:</label>
                  <select
                    value={selectedSalesman}
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="None">None</option>
                    <option value="Rehman">Rehman</option>
                    <option value="Jawad khan">Jawad khan</option>
                    <option value="Anas">Anas</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Type:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Credit">Khata / Udhar (Credit)</option>
                  </select>
                </div>
              </div>

              {/* Cash Received Tender */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Cash Tendered / Received (Rs.):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Leave blank or click Exact to match bill
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  placeholder={`Exact: ${netPayable.toFixed(2)}`}
                  className="w-full bg-white border-2 border-purple-300 rounded-lg p-2.5 text-lg font-black text-slate-900 focus:outline-none focus:border-purple-600"
                />

                {/* Quick Cash Tender Shortcut Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput(netPayable.toString())}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded font-bold text-xs"
                  >
                    Exact
                  </button>
                  {[50, 100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddQuickCash(amt)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs border border-slate-300"
                    >
                      +{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaidAmountInput('')}
                    className="px-2 py-1 text-slate-400 hover:text-rose-600 font-medium text-xs ml-auto"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Live Change Calculation */}
              {paidAmountInput !== '' && (
                <div className="p-3 rounded-lg border flex items-center justify-between text-xs font-bold">
                  {parseFloat(paidAmountInput) >= netPayable ? (
                    <div className="flex items-center justify-between w-full text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                      <span>Change Due (Return to Customer):</span>
                      <span className="text-base font-black">
                        Rs. {(parseFloat(paidAmountInput) - netPayable).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                      <span>Remaining Balance (Will be added to Customer Khata):</span>
                      <span className="text-base font-black">
                        Rs. {(netPayable - parseFloat(paidAmountInput)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Print & Action Buttons */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleFinalizeCheckout('none')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
              >
                Save Only
              </button>
              <button
                type="button"
                onClick={() => handleFinalizeCheckout('a4')}
                className="px-4 py-2 bg-[#866EC7] hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save & Print A4</span>
              </button>
              <button
                type="button"
                onClick={() => handleFinalizeCheckout('thermal')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Save & Print 80mm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HELD BILLS MODAL (Hold / Recall Orders)                    */}
      {/* ========================================================= */}
      {showHeldBillsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-amber-100" />
                <h4 className="font-bold text-sm">Held Orders Queue ({heldBills.length})</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHeldBillsModal(false)}
                className="text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              {heldBills.length === 0 ? (
                <p className="text-center text-slate-500 py-6">No held bills in queue.</p>
              ) : (
                heldBills.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-amber-50 transition"
                  >
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{b.customerName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          {b.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{b.note}</div>
                      <div className="text-[10px] text-slate-400">Held at {b.heldAt}</div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRecallBill(b)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                      >
                        Recall
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeldBills((prev) => prev.filter((x) => x.id !== b.id))}
                        className="px-2 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-xs"
                        title="Discard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowHeldBillsModal(false)}
                className="px-4 py-1.5 bg-slate-300 text-slate-700 rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK ADD CUSTOMER MODAL                                  */}
      {/* ========================================================= */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-[#866EC7] text-white p-3.5 flex items-center justify-between">
              <h4 className="font-bold text-sm">Add New Customer</h4>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-white font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / City</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Karachi, Pakistan"
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#866EC7] text-white rounded font-bold text-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
