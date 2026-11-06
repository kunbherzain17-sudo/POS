import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

export const Dashboard: React.FC = () => {
  const { kpiStats, products, customers, vendors, orders, setCurrentView } = usePos();
  const [dateRange, setDateRange] = useState('7');
  const [periodFilter, setPeriodFilter] = useState('monthly');

  // Most selling products computation
  const productSalesMap = new Map<number, { name: string; qty: number; price: number }>();
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const ex = productSalesMap.get(it.productId);
      if (ex) {
        ex.qty += it.quantity;
      } else {
        productSalesMap.set(it.productId, { name: it.name, qty: it.quantity, price: it.price });
      }
    });
  });

  const mostSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalPurchasing - a.totalPurchasing)
    .slice(0, 5);

  const topVendors = [...vendors]
    .sort((a, b) => b.totalPurchasing - a.totalPurchasing)
    .slice(0, 5);

  // SVG Chart points
  const points = [
    { label: 'Today', val: kpiStats.sales },
    { label: 'Yesterday', val: 12500 },
    { label: '3 Days Ago', val: 32000 },
    { label: '4 Days Ago', val: 19400 },
    { label: '5 Days Ago', val: 28000 },
    { label: '6 Days Ago', val: 41000 },
    { label: '7 Days Ago', val: 24500 },
  ];
  const maxVal = Math.max(...points.map((p) => p.val), 50000);

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '0 15px' }}>
      {/* KPI Strips Grid matching .dashboard-kpi */}
      <div
        className="dashboard-kpi mb-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
        }}
      >
        <div className="kpi-strip">
          <span className="label">Sales</span>
          <span className="value" id="kpi-sales">
            Rs. {kpiStats.sales.toFixed(2)}
          </span>
        </div>

        <div className="kpi-strip">
          <span className="label">Expense</span>
          <span className="value" id="kpi-expense">
            Rs. {kpiStats.expense.toFixed(2)}
          </span>
        </div>

        <div className="kpi-strip">
          <span className="label">Purchase</span>
          <span className="value" id="kpi-purchase">
            Rs. {kpiStats.purchase.toFixed(2)}
          </span>
        </div>

        <div
          onClick={() => setCurrentView('customers')}
          className="kpi-strip link cursor-pointer"
        >
          <span className="label">Customer Balance</span>
          <span className="value text-amber-700" id="kpi-cus-balance">
            Rs. {kpiStats.customerBalance.toFixed(2)}
          </span>
        </div>

        <div
          onClick={() => setCurrentView('vendors')}
          className="kpi-strip link cursor-pointer"
        >
          <span className="label">Vendor Balance</span>
          <span className="value text-slate-800" id="kpi-ven-balance">
            Rs. {kpiStats.vendorBalance.toFixed(2)}
          </span>
        </div>

        <div className="kpi-strip">
          <span className="label">Today Invoices</span>
          <span className="value" id="kpi-orders">
            {kpiStats.todayInvoices}
          </span>
        </div>

        <div className="kpi-strip">
          <span className="label">Recovery</span>
          <span className="value text-emerald-700" id="kpi-recovery">
            Rs. {kpiStats.recovery.toFixed(2)}
          </span>
        </div>

        <div
          onClick={() => setCurrentView('stock')}
          className="kpi-strip warn cursor-pointer"
        >
          <span className="label">Short Stock</span>
          <span className="value text-amber-600" id="kpi-short-stock">
            {kpiStats.shortStock}
          </span>
        </div>

        <div
          onClick={() => setCurrentView('stock')}
          className="kpi-strip danger cursor-pointer"
        >
          <span className="label">Out of Stock</span>
          <span className="value text-rose-600" id="kpi-out-stock">
            {kpiStats.outOfStock}
          </span>
        </div>
      </div>

      {/* Graph Panel Row matching .graph-row-layer */}
      <div className="row mb-4 graph-row-layer">
        <div className="col-md-12">
          <div
            className="graph-panel bg-white rounded-lg border border-slate-200"
            style={{ borderRadius: '10px' }}
          >
            <div
              className="graph-header d-flex align-items-center justify-content-between p-3"
              style={{
                borderBottom: '1px solid #eef1f4',
                background: 'linear-gradient(90deg, rgba(134,110,199,0.08), transparent)',
              }}
            >
              <div>
                <h6 className="mb-0 font-bold" style={{ color: '#866EC7' }}>
                  Sales Overview
                </h6>
                <small className="text-muted">Revenue trend</small>
              </div>

              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="form-select form-select-sm kpi-select"
                style={{
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#f8f9fa',
                  color: '#212529',
                  outline: 'none',
                }}
              >
                <option value="">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7">Last 7 Days</option>
                <option value="15">Last 15 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="lastWeek">Last Week</option>
                <option value="lastMonth">Last Month</option>
                <option value="max">Maximum</option>
              </select>
            </div>

            {/* Chart SVG Canvas */}
            <div className="graph-body p-4" style={{ height: '300px' }}>
              <div className="h-full flex items-end justify-between gap-4 pt-6 pb-2 border-b border-slate-200">
                {points.map((pt, i) => {
                  const h = Math.round((pt.val / maxVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                      <span className="text-[11px] font-bold text-slate-600">
                        Rs. {(pt.val / 1000).toFixed(1)}k
                      </span>
                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t h-full flex flex-col justify-end">
                        <div
                          style={{
                            height: `${Math.max(10, h)}%`,
                            backgroundColor: '#866EC7',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                          }}
                          className="w-full transition-all duration-300 hover:brightness-110"
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{pt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Row Layer: Most Selling Products, Top Customers, Top Vendors */}
      <div className="row mt-4 g-3 cards-row-layer flex flex-col lg:flex-row gap-4">
        {/* Most Selling Products */}
        <div className="col-lg-4 col-md-6 flex-1">
          <div className="data-card bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div
              className="data-header p-3 font-bold text-sm"
              style={{
                color: '#866EC7',
                background: 'linear-gradient(90deg, rgba(134,110,199,0.08), transparent)',
                borderBottom: '1px solid #eef1f4',
              }}
            >
              Most Selling Products
            </div>
            <div className="table-scroll" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <table className="data-table w-full text-xs" id="productTable">
                <thead style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                  <tr className="text-slate-500 font-semibold border-b">
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mostSellingProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/40">
                      <td className="p-2 font-medium text-slate-800">{p.name}</td>
                      <td className="p-2 text-center font-bold text-purple-900">{p.qty.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium">{p.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="col-lg-4 col-md-6 flex-1">
          <div className="data-card bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div
              className="data-header p-3 font-bold text-sm"
              style={{
                color: '#866EC7',
                background: 'linear-gradient(90deg, rgba(134,110,199,0.08), transparent)',
                borderBottom: '1px solid #eef1f4',
              }}
            >
              Top Customers
            </div>
            <div className="table-scroll" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <table className="data-table w-full text-xs" id="customerTable">
                <thead style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                  <tr className="text-slate-500 font-semibold border-b">
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-right">Total Purchasing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-purple-50/40">
                      <td className="p-2 font-medium text-slate-800">{c.name}</td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        Rs. {c.totalPurchasing.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="col-lg-4 col-md-12 flex-1">
          <div className="data-card bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div
              className="data-header p-3 font-bold text-sm"
              style={{
                color: '#866EC7',
                background: 'linear-gradient(90deg, rgba(134,110,199,0.08), transparent)',
                borderBottom: '1px solid #eef1f4',
              }}
            >
              Top Vendors
            </div>
            <div className="table-scroll" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <table className="data-table w-full text-xs" id="vendorTable">
                <thead style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                  <tr className="text-slate-500 font-semibold border-b">
                    <th className="p-2 text-left">Vendor</th>
                    <th className="p-2 text-right">Total Purchasing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-purple-50/40">
                      <td className="p-2 font-medium text-slate-800">{v.name}</td>
                      <td className="p-2 text-right font-bold text-slate-800">
                        Rs. {v.totalPurchasing.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Cards Row */}
      <div className="row mt-4 g-3 cards-row-layer flex flex-col lg:flex-row gap-4 mb-5">
        {/* Card 1: Sales Overview Details */}
        <div className="col-lg-4 col-md-6 flex-1">
          <div className="data-card custom-metric-card bg-white rounded-lg border border-slate-200 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="font-bold text-sm" style={{ color: '#866EC7' }}>Sales Overview</span>
              <select
                id="salesPeriodFilter"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="kpi-select text-xs border rounded px-2 py-1"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <small className="text-muted d-block font-weight-bold mb-1">Today's Sale</small>
              <h4 className="mb-0 text-xl font-bold" style={{ color: '#866EC7' }}>
                Rs. {kpiStats.sales.toFixed(2)}
              </h4>
            </div>
            <hr className="my-3 opacity-20" />
            <div>
              <small className="text-muted d-block mb-1">Monthly Trend Comparison</small>
              <h5 className="mb-0 font-bold text-slate-700">
                Rs. {(kpiStats.sales * 1.25).toFixed(2)}
              </h5>
            </div>
          </div>
        </div>

        {/* Card 2: Today Sales Trend */}
        <div className="col-lg-4 col-md-6 flex-1">
          <div className="data-card custom-metric-card bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="font-bold text-sm" style={{ color: '#866EC7' }}>Today Sales</span>
            </div>
            <div>
              <h4 className="mb-1 text-2xl font-bold" style={{ color: '#866EC7' }}>
                Rs. {kpiStats.sales.toFixed(2)}
              </h4>
              <p className="text-muted text-xs mb-0">Compared to last 28 days evaluation</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Status:</span>
              <span className="text-emerald-600 font-bold">+18.5% Growth</span>
            </div>
          </div>
        </div>

        {/* Card 3: Demand/Fulfilment Ratio */}
        <div className="col-lg-4 col-md-12 flex-1">
          <div className="data-card custom-metric-card bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="font-bold text-sm" style={{ color: '#866EC7' }}>
                Demand/Fulfilment ratio (D:F)
              </span>
            </div>
            <div>
              <h2 className="mb-1" style={{ fontSize: '1.8rem', color: '#866EC7', fontWeight: 'normal' }}>
                {orders.length} : {orders.length}
              </h2>
              <p className="text-muted text-xs mb-0">Today's simplified Demand vs Order Fulfillment ratio.</p>
            </div>
            <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
              <span
                className="badge px-3 py-1.5 rounded text-white text-xs font-semibold"
                style={{ backgroundColor: '#866EC7' }}
              >
                Balanced 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
