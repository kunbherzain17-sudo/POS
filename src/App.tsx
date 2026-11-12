import React, { useEffect } from 'react';
import { Menu, Store } from 'lucide-react';
import { PosProvider, usePos } from './context/PosContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PosInvoice } from './components/PosInvoice';
import { ProductsView } from './components/ProductsView';
import { CustomersView } from './components/CustomersView';
import { VendorsView } from './components/VendorsView';
import { StockView } from './components/StockView';
import { ExpensesView } from './components/ExpensesView';
import { DuplicateBillView } from './components/DuplicateBillView';
import { SalesView } from './components/SalesView';
import { ItemwiseRefundView } from './components/ItemwiseRefundView';
import { BanksView } from './components/BanksView';
import { PurchaseReturnView } from './components/PurchaseReturnView';
import { SalesmanView } from './components/SalesmanView';
import { AdministrationView } from './components/AdministrationView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

const AppContent: React.FC = () => {
  const { currentView, user, sidebarOpen, setSidebarOpen, setCurrentView } = usePos();

  useEffect(() => {
    document.title = 'Asaan POS - Point of Sale';
  }, []);

  if (currentView === 'login' || !user) {
    return <LoginScreen />;
  }

  if (currentView === 'invoice') {
    return (
      <div className="terminal-shell">
        <PosInvoice />
        <ThermalReceiptModal />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="navigation-toggle"
            aria-label={sidebarOpen ? 'Collapse navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={19} aria-hidden="true" />
          </button>
          <a
            className="topbar-brand"
            href="/"
            onClick={(event) => {
              event.preventDefault();
              setCurrentView('dashboard');
            }}
          >
            <Store size={17} aria-hidden="true" />
            <span>Asaan POS</span>
          </a>
          <div className="topbar-actions">
            <OfflineIndicator />
            <PWAInstallButton />
            <div className="topbar-account">
              <span className="topbar-account-name">{user.name}</span>
              <span>{user.role}</span>
            </div>
          </div>
        </header>

        <main id="content" className="app-content">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'customers' && <CustomersView />}
          {currentView === 'vendors' && <VendorsView />}
          {currentView === 'stock' && <StockView />}
          {currentView === 'expenses' && <ExpensesView />}
          {currentView === 'duplicatebill' && <DuplicateBillView />}
          {currentView === 'salesview' && <SalesView />}
          {currentView === 'refund' && <ItemwiseRefundView />}
          {currentView === 'banks' && <BanksView />}
          {currentView === 'purchasereturn' && <PurchaseReturnView />}
          {currentView === 'salesman' && <SalesmanView />}
          {currentView === 'administration' && <AdministrationView />}
        </main>
      </div>

      <ThermalReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <AppContent />
    </PosProvider>
  );
}
