import React from 'react';
import { usePos } from '../context/PosContext';
import { AppView } from '../types';

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, logout, sidebarOpen, setSidebarOpen, user } = usePos();

  const menuItems: { id: AppView; label: string; href: string; isInvoice?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'administration', label: 'Administration', href: '/Admin/Viewadmin' },
    { id: 'products', label: 'Products', href: '/Admin/Viewproduct' },
    { id: 'customers', label: 'Customers', href: '/Admin/Viewcustomer' },
    { id: 'vendors', label: 'Vendors', href: '/Admin/Viewvendor' },
    { id: 'stock', label: 'Stock', href: '/Admin/ViewStock' },
    { id: 'expenses', label: 'Expenses', href: '/Admin/Viewexpense' },
    { id: 'duplicatebill', label: 'Duplicate Bill', href: '/Admin/Duplicatebill' },
    { id: 'invoice', label: 'Invoice', href: `/Admin/newinvoice?ad_name=${user?.name || 'Admin'}`, isInvoice: true },
    { id: 'salesview', label: 'Sales View', href: '/Admin/salesview' },
    { id: 'refund', label: 'Itemwise Refund', href: '/Admin/refund' },
    { id: 'banks', label: 'Banks', href: '/Admin/Viewbank' },
    { id: 'purchasereturn', label: 'Purchase Return', href: '/Admin/PurchaseReturn' },
    { id: 'salesman', label: 'Salesman', href: '/Admin/Viewsalesman' },
  ];

  return (
    <nav
      id="sidebar"
      style={{
        minWidth: sidebarOpen ? '250px' : '0px',
        maxWidth: sidebarOpen ? '250px' : '0px',
        width: sidebarOpen ? '250px' : '0px',
        backgroundColor: '#866ec7',
        color: '#fff',
        transition: 'all 0.3s ease',
        position: 'relative',
        height: '100vh',
        overflow: 'visible',
      }}
      className={!sidebarOpen ? 'active' : ''}
    >
      {/* Circular Toggle Button Overlapping Right Edge (#sidebarCollapse) */}
      <div className="custom-menu">
        <button
          type="button"
          id="sidebarCollapse"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-toggle"
          title="Toggle Menu"
        >
          <i className="fa fa-bars" />
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>

      <div
        className="p-4 pt-5"
        style={{
          paddingRight: '0px !important',
          paddingLeft: '0px !important',
          visibility: sidebarOpen ? 'visible' : 'hidden',
          opacity: sidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }} className="logo px-3 block">
          <img
            src="/assets/regalposlogo.png"
            alt="Logo"
            style={{
              width: '100%',
              height: '60px',
              marginTop: '0px',
              marginBottom: '15px',
              objectFit: 'contain',
            }}
          />
        </a>

        <div
          className="sidebar-scroll"
          style={{
            height: 'calc(100vh - 120px)',
            overflowY: 'auto',
          }}
        >
          <ul className="list-unstyled components mb-5" style={{ padding: 0, margin: 0 }}>
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <li
                  key={item.id}
                  className={isActive ? 'active' : ''}
                  style={{
                    backgroundColor: isActive ? 'darkslateblue' : 'transparent',
                    lineHeight: '1.5',
                  }}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentView(item.id);
                    }}
                    style={{
                      padding: '8px 25px',
                      display: 'block',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '15px',
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}

            <li>
              <a
                href="/Admin/Logout"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                style={{
                  padding: '8px 25px',
                  display: 'block',
                  color: '#ffffff',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
