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
  const {
    currentView,
    user,
    authLoading,
    cloudConfigured,
    cloudState,
    cloudError,
    clearCloudError,
    subscriptionStatus,
    demoMode,
    exitDemo,
    saveState,
    saveError,
    refreshCloudData,
    retryCloudSave,
    logout,
    sidebarOpen,
    setSidebarOpen,
    setCurrentView,
  } = usePos();

  useEffect(() => {
    document.title = 'Asaan POS - Point of Sale';
  }, []);

  if (authLoading) {
    return <main className="cloud-gate" role="status">Connecting to Asaan POS…</main>;
  }

  if (currentView === 'login' || !user) {
    return <LoginScreen />;
  }

  if (!demoMode && (!cloudConfigured || cloudState === 'error')) {
    return (
      <main className="cloud-gate">
        <Store size={32} aria-hidden="true" />
        <h1>Unable to load your cloud store</h1>
        <p>{cloudError || 'Cloud sign-in is not configured for this deployment.'}</p>
        <div className="cloud-gate-actions">
          <button type="button" onClick={() => void refreshCloudData().catch(() => undefined)}>
            Try again
          </button>
          <button type="button" className="secondary" onClick={() => void logout()}>Sign out</button>
        </div>
      </main>
    );
  }

  if (!demoMode && cloudState !== 'ready') {
    return <main className="cloud-gate" role="status">Loading your store from the cloud…</main>;
  }

  if (!demoMode && subscriptionStatus !== 'active') {
    return (
      <main className="cloud-gate">
        <Store size={32} aria-hidden="true" />
        <h1>Your store is awaiting activation</h1>
        <p>
          Your account is created, but billing and payment verification are not connected yet.
          Store access will be enabled after secure payment processing is configured.
        </p>
        <div className="cloud-gate-pricing">
          <strong>PKR 40,000</strong> one-time setup <span aria-hidden="true">·</span>{' '}
          <strong>PKR 3,000</strong> monthly
        </div>
        <p className="cloud-gate-note">
          Do not send payment to an account based only on this screen. Contact the Asaan POS team for verified payment instructions.
        </p>
        <button type="button" onClick={() => void logout()}>Sign out</button>
      </main>
    );
  }

  if (currentView === 'invoice') {
    return (
      <div className="terminal-shell">
        {demoMode && (
          <div className="demo-banner" role="status">
            <span>Interactive demo: changes are temporary for this visit. Don’t enter real business or customer data.</span>
            <button type="button" onClick={exitDemo}>Exit demo</button>
          </div>
        )}
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
          {demoMode && (
            <div className="demo-banner" role="status">
              <span>Interactive demo: changes are temporary for this visit. Don’t enter real business or customer data.</span>
              <button type="button" onClick={exitDemo}>Exit demo</button>
            </div>
          )}
          {(saveState === 'saving' || saveState === 'error' || cloudError) && (
            <div className={`cloud-sync-banner${saveState === 'error' || cloudError ? ' has-error' : ''}`} role="status">
              <span>
                {cloudError
                  ? cloudError
                  : saveState === 'saving'
                    ? 'Saving changes to the cloud…'
                    : saveError || 'Cloud save needs attention.'}
              </span>
              {saveState === 'error' && (
                <button type="button" onClick={() => retryCloudSave()}>Retry save</button>
              )}
              {cloudError && (
                <button type="button" onClick={clearCloudError} aria-label="Dismiss cloud message">Dismiss</button>
              )}
              {saveState === 'error' && (
                <button
                  type="button"
                  onClick={() => void refreshCloudData().catch(() => undefined)}
                >
                  Reload cloud data
                </button>
              )}
            </div>
          )}
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
