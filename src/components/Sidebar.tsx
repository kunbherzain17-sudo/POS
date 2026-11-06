import React from 'react';
import {
  Boxes,
  FileClock,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  RotateCcw,
  Settings2,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  Users,
  UserRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import type { AppView } from '../types';

interface MenuItem {
  id: AppView;
  label: string;
  href: string;
  icon: LucideIcon;
}

const menuGroups: { label: string; items: MenuItem[] }[] = [
  {
    label: 'Workspace',
    items: [{ id: 'dashboard', label: 'Overview', href: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Sales',
    items: [
      { id: 'invoice', label: 'New sale', href: '/Admin/newinvoice', icon: ShoppingCart },
      { id: 'salesview', label: 'Sales history', href: '/Admin/salesview', icon: History },
      { id: 'duplicatebill', label: 'Find an invoice', href: '/Admin/Duplicatebill', icon: FileClock },
      { id: 'refund', label: 'Refund items', href: '/Admin/refund', icon: RotateCcw },
    ],
  },
  {
    label: 'Store',
    items: [
      { id: 'products', label: 'Products', href: '/Admin/Viewproduct', icon: Package },
      { id: 'stock', label: 'Inventory', href: '/Admin/ViewStock', icon: Boxes },
      { id: 'customers', label: 'Customers', href: '/Admin/Viewcustomer', icon: Users },
      { id: 'vendors', label: 'Suppliers', href: '/Admin/Viewvendor', icon: Truck },
      { id: 'salesman', label: 'Salespeople', href: '/Admin/Viewsalesman', icon: UserRound },
    ],
  },
  {
    label: 'Accounts',
    items: [
      { id: 'expenses', label: 'Expenses', href: '/Admin/Viewexpense', icon: Wallet },
      { id: 'banks', label: 'Cash & banks', href: '/Admin/Viewbank', icon: Landmark },
      { id: 'purchasereturn', label: 'Purchase returns', href: '/Admin/PurchaseReturn', icon: Undo2 },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'administration', label: 'Administration', href: '/Admin/Viewadmin', icon: Settings2 },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, logout, sidebarOpen, setSidebarOpen, user } = usePos();

  const closeSidebarOnMobile = () => {
    if (window.matchMedia('(max-width: 860px)').matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="sidebar"
        className={`app-sidebar${sidebarOpen ? ' is-open' : ' is-closed'}`}
        aria-label="Main navigation"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
      >
        <div className="sidebar-brand">
          <a
            href="/"
            className="sidebar-brand-link"
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('dashboard');
              closeSidebarOnMobile();
            }}
          >
            <span className="sidebar-brand-mark"><Store size={20} aria-hidden="true" /></span>
            <span className="sidebar-brand-copy">
              <strong>Regal</strong>
              <span>Point of sale</span>
            </span>
          </a>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {menuGroups.map((group) => (
            <section className="sidebar-group" key={group.label}>
              <h2 className="sidebar-group-title">{group.label}</h2>
              <ul>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const href =
                    item.id === 'invoice'
                      ? `${item.href}?ad_name=${encodeURIComponent(user?.name || 'Admin')}`
                      : item.href;

                  return (
                    <li key={item.id}>
                      <a
                        href={href}
                        className={`sidebar-link${isActive ? ' is-active' : ''}${item.id === 'invoice' ? ' is-invoice' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentView(item.id);
                          closeSidebarOnMobile();
                        }}
                      >
                        <Icon className="sidebar-link-icon" size={18} aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <div className="sidebar-profile">
            <span className="sidebar-avatar" aria-hidden="true">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </span>
            <span className="sidebar-profile-copy">
              <strong>{user?.name || 'Admin'}</strong>
              <span>{user?.role || 'Store team'}</span>
            </span>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => {
              closeSidebarOnMobile();
              logout();
            }}
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </button>
        </footer>
      </aside>
    </>
  );
};
