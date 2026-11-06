import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { ChromeBrowserFrame } from './components/ChromeBrowserFrame';
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
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

const AppContent: React.FC = () => {
  const { currentView, user, setCurrentView } = usePos();
  const [isFullScreenWindow, setIsFullScreenWindow] = useState(false);
  const [showLicenseAlert, setShowLicenseAlert] = useState(true);

  // If user is on login view or not authenticated
  if (currentView === 'login' || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
        <ChromeBrowserFrame
          isFullScreenWindow={isFullScreenWindow}
          setIsFullScreenWindow={setIsFullScreenWindow}
        />
        <div className="flex-1 overflow-y-auto">
          <LoginScreen />
        </div>
      </div>
    );
  }

  // If view is POS Invoice Cashier Register, show dedicated full terminal matching newinvoice.html
  if (currentView === 'invoice') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <ChromeBrowserFrame
          isFullScreenWindow={isFullScreenWindow}
          setIsFullScreenWindow={setIsFullScreenWindow}
        />
        <div className="flex-1 overflow-y-auto">
          <PosInvoice />
        </div>
        <ThermalReceiptModal />
      </div>
    );
  }

  // Admin Portal Layout with Sidebar matching original demo.regalpos.pk
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Simulated Chrome Browser Bar */}
      <ChromeBrowserFrame
        isFullScreenWindow={isFullScreenWindow}
        setIsFullScreenWindow={setIsFullScreenWindow}
      />

      {/* Floating License Alert matching original HTML .license-alert */}
      {showLicenseAlert && (
        <div
          className="license-alert"
          style={{
            position: 'fixed',
            top: '55px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 500,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            minWidth: '280px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Your license will expire in 28 days!</span>
          <button
            type="button"
            onClick={() => setShowLicenseAlert(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              marginLeft: '10px',
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Wrapper matching <div class="wrapper d-flex align-items-stretch"> */}
      <div className="wrapper flex flex-1 overflow-hidden" style={{ width: '100%' }}>
        <Sidebar />

        {/* Page Content matching #content */}
        <div
          id="content"
          className="flex-1 overflow-y-auto p-3 md:p-4"
          style={{
            backgroundColor: '#ffffff',
            minHeight: 'calc(100vh - 45px)',
          }}
        >
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
        </div>
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
