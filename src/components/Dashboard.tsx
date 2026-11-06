import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Boxes,
  CalendarDays,
  CircleAlert,
  Clock3,
  PackageCheck,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { Order } from '../types';

type SalesRange = 'today' | 'yesterday' | '7' | '30' | 'all';

interface SalesPoint {
  key: string;
  label: string;
  total: number;
  invoices: number;
}

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatCurrency = (amount: number) =>
  `Rs. ${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;

const formatShortCurrency = (amount: number) =>
  `Rs. ${new Intl.NumberFormat('en-PK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)}`;

const formatDate = (key: string) =>
  parseDateKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const buildSalesPoints = (
  orders: Order[],
  range: SalesRange,
  today: Date,
): SalesPoint[] => {
  const todayKey = localDateKey(today);
  let startDate: Date;
  let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let useMonths = false;

  if (range === 'today') {
    startDate = endDate;
  } else if (range === 'yesterday') {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);
    endDate = startDate;
  } else if (range === 'all') {
    const firstOrder = orders.reduce<string | null>(
      (earliest, order) => (earliest === null || order.date < earliest ? order.date : earliest),
      null,
    );
    startDate = firstOrder ? parseDateKey(firstOrder) : new Date(endDate);
    useMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        endDate.getMonth() -
        startDate.getMonth() >
      1;
    if (useMonths) {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    }
  } else {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - Number(range) + 1);
  }

  const points: SalesPoint[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const key = useMonths
      ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      : localDateKey(cursor);
    const bucketOrders = orders.filter((order) =>
      useMonths ? order.date.startsWith(key) : order.date === key,
    );

    points.push({
      key,
      label: useMonths
        ? cursor.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        : cursor.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      total: bucketOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      invoices: bucketOrders.length,
    });

    cursor.setDate(cursor.getDate() + (useMonths ? 0 : 1));
    if (useMonths) cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

const getGreeting = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Dashboard: React.FC = () => {
  const { kpiStats, products, customers, vendors, orders, setCurrentView, user } = usePos();
  const [dateRange, setDateRange] = useState<SalesRange>('7');
  const today = new Date();
  const todayKey = localDateKey(today);

  const salesPoints = useMemo(
    () => buildSalesPoints(orders, dateRange, today),
    [orders, dateRange, todayKey],
  );
  const periodOrders = useMemo(() => {
    const keys = new Set(salesPoints.map((point) => point.key));
    return orders.filter((order) =>
      dateRange === 'all'
        ? salesPoints.some((point) => order.date.startsWith(point.key))
        : keys.has(order.date),
    );
  }, [orders, salesPoints, dateRange]);

  const periodSales = periodOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const periodReceived = periodOrders.reduce((sum, order) => sum + order.amountPaid, 0);
  const maxSales = Math.max(...salesPoints.map((point) => point.total), 1);
  const recentOrders = [...periodOrders]
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    .slice(0, 5);

  const bestProducts = useMemo(() => {
    const sales = new Map<number, { name: string; quantity: number; total: number }>();
    periodOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = sales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.total;
        } else {
          sales.set(item.productId, {
            name: item.name,
            quantity: item.quantity,
            total: item.total,
          });
        }
      });
    });
    return [...sales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [periodOrders]);

  const stockAlerts = [...products]
    .filter((product) => product.stock <= product.quantityLimit)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  const periodLabel =
    dateRange === 'today'
      ? 'Today'
      : dateRange === 'yesterday'
        ? 'Yesterday'
        : dateRange === 'all'
          ? 'All recorded sales'
          : `Last ${dateRange} days`;

  return (
    <div className="dashboard-page">
      <section className="dashboard-intro" aria-labelledby="dashboard-title">
        <div>
          <p className="dashboard-date">
            <CalendarDays size={15} aria-hidden="true" />
            {today.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <h1 id="dashboard-title">
            {getGreeting(today.getHours())}, {user?.name || 'there'}.
          </h1>
          <p className="dashboard-subtitle">Here’s what’s happening at the counter.</p>
        </div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="dashboard-secondary-action"
            onClick={() => setCurrentView('stock')}
          >
            <Boxes size={17} aria-hidden="true" />
            Inventory
          </button>
          <button
            type="button"
            className="dashboard-primary-action"
            onClick={() => setCurrentView('invoice')}
          >
            <ShoppingBag size={17} aria-hidden="true" />
            New sale
          </button>
        </div>
      </section>

      <section className="dashboard-lead-grid" aria-label="Sales and stock overview">
        <article className="sales-panel">
          <div className="sales-panel-header">
            <div>
              <p className="panel-kicker">
                <TrendingUp size={15} aria-hidden="true" />
                Sales total
              </p>
              <p className="sales-total">{formatCurrency(periodSales)}</p>
              <p className="sales-caption">{periodLabel}</p>
            </div>
            <label className="range-control">
              <span>Show</span>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value as SalesRange)}
                aria-label="Sales chart date range"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </label>
          </div>

          <div className="sales-chart-scroll">
            <div
              className="sales-chart"
              role="img"
              aria-label={`${periodLabel} sales. ${salesPoints
                .map((point) => `${point.label}: ${formatCurrency(point.total)}`)
                .join('; ')}`}
            >
              {salesPoints.map((point, index) => {
                const height = point.total > 0 ? Math.max((point.total / maxSales) * 100, 4) : 0;
                const isLatest = index === salesPoints.length - 1 && dateRange !== 'yesterday';
                return (
                  <div
                    className={`sales-chart-column${isLatest ? ' is-latest' : ''}`}
                    key={point.key}
                    title={`${point.label}: ${formatCurrency(point.total)} · ${point.invoices} invoices`}
                  >
                    <span className="sales-chart-value">
                      {point.total > 0 ? formatShortCurrency(point.total) : ''}
                    </span>
                    <div className="sales-chart-track">
                      <div className="sales-chart-bar" style={{ height: `${height}%` }} />
                    </div>
                    <span className="sales-chart-label">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {periodOrders.length === 0 && (
            <p className="chart-empty-state">
              No sales in this period yet. Start a sale to see it here.
            </p>
          )}

          <div className="sales-summary" aria-label={`${periodLabel} totals`}>
            <div>
              <span><Receipt size={15} aria-hidden="true" /> Invoices</span>
              <strong>{periodOrders.length}</strong>
            </div>
            <div>
              <span><Banknote size={15} aria-hidden="true" /> Received</span>
              <strong>{formatCurrency(periodReceived)}</strong>
            </div>
            <div>
              <span><PackageCheck size={15} aria-hidden="true" /> Items sold</span>
              <strong>
                {periodOrders.reduce(
                  (sum, order) => sum + order.items.reduce((quantity, item) => quantity + item.quantity, 0),
                  0,
                )}
              </strong>
            </div>
          </div>
        </article>

        <aside className="stock-panel" aria-labelledby="stock-panel-title">
          <div className="stock-panel-heading">
            <div className="stock-panel-icon"><CircleAlert size={18} aria-hidden="true" /></div>
            <div>
              <h2 id="stock-panel-title">Stock to check</h2>
              <p>{kpiStats.shortStock + kpiStats.outOfStock} items need attention</p>
            </div>
          </div>

          {stockAlerts.length > 0 ? (
            <ul className="stock-alert-list">
              {stockAlerts.map((product) => (
                <li key={product.id}>
                  <div className="stock-alert-product">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>
                  <span className={`stock-quantity${product.stock === 0 ? ' is-empty' : ''}`}>
                    {product.stock === 0 ? 'Out' : `${product.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="stock-all-clear">All products are above their stock limits.</p>
          )}

          <button
            className="stock-panel-link"
            type="button"
            onClick={() => setCurrentView('stock')}
          >
            Review inventory
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </aside>
      </section>

      <section className="dashboard-tables" aria-label="Store activity">
        <article className="dashboard-table-panel recent-orders-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent sales</h2>
              <p>Latest invoices in {periodLabel.toLowerCase()}</p>
            </div>
            <button type="button" onClick={() => setCurrentView('salesview')}>
              All sales <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="dashboard-table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col">Invoice</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Date</th>
                    <th scope="col">Payment</th>
                    <th scope="col" className="numeric-cell">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td><span className="invoice-number">#{order.orderId}</span></td>
                      <td>{order.customerName}</td>
                      <td>
                        <span className="order-date">
                          <Clock3 size={13} aria-hidden="true" />
                          {formatDate(order.date)}
                        </span>
                      </td>
                      <td><span className="payment-tag">{order.paymentMethod}</span></td>
                      <td className="numeric-cell">{formatCurrency(order.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              No invoices for this period. Start a sale and it’ll appear here.
            </div>
          )}
        </article>

        <article className="dashboard-table-panel products-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Popular products</h2>
              <p>Units sold · {periodLabel.toLowerCase()}</p>
            </div>
            <button type="button" onClick={() => setCurrentView('products')} aria-label="View all products">
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
          {bestProducts.length > 0 ? (
            <ol className="popular-product-list">
              {bestProducts.map((product, index) => (
                <li key={product.name}>
                  <span className="product-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="popular-product-name">{product.name}</span>
                  <strong>{product.quantity} <span>sold</span></strong>
                </li>
              ))}
            </ol>
          ) : (
            <div className="dashboard-empty-state">
              Product rankings will appear after the first sale.
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-relationships" aria-label="Customers and suppliers">
        <article className="relationship-panel">
          <div className="relationship-title">
            <Users size={17} aria-hidden="true" />
            <h2>Customers</h2>
            <button type="button" onClick={() => setCurrentView('customers')}>
              View all
            </button>
          </div>
          {[...customers]
            .sort((a, b) => b.totalPurchasing - a.totalPurchasing)
            .slice(0, 3)
            .map((customer) => (
              <div className="relationship-row" key={customer.id}>
                <span>{customer.name}</span>
                <strong>{formatCurrency(customer.totalPurchasing)}</strong>
              </div>
            ))}
        </article>
        <article className="relationship-panel">
          <div className="relationship-title">
            <Boxes size={17} aria-hidden="true" />
            <h2>Suppliers</h2>
            <button type="button" onClick={() => setCurrentView('vendors')}>
              View all
            </button>
          </div>
          {[...vendors]
            .sort((a, b) => b.totalPurchasing - a.totalPurchasing)
            .slice(0, 3)
            .map((vendor) => (
              <div className="relationship-row" key={vendor.id}>
                <span>{vendor.name}</span>
                <strong>{formatCurrency(vendor.totalPurchasing)}</strong>
              </div>
            ))}
        </article>
      </section>
    </div>
  );
};
