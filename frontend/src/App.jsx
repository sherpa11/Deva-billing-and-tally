import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';

// Code-split pages for lazy loading & optimal initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Buyers = lazy(() => import('./pages/Buyers'));
const BuyerDetail = lazy(() => import('./pages/BuyerDetail'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const SupplierDetail = lazy(() => import('./pages/SupplierDetail'));
const Outlay = lazy(() => import('./pages/Outlay'));
const History = lazy(() => import('./pages/History'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

const PageFallback = () => (
  <div className="flex flex-col items-center justify-center py-24 text-forest-700">
    <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="text-xs font-bold font-tamil text-slate-600">ஏற்றுகிறது... (Loading...)</span>
  </div>
);

const MainLayout = () => {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Keep-alive cache for visited top-level tabs for instant 0ms switching
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['dashboard']));

  useEffect(() => {
    if (activeTab && activeTab !== 'buyer-detail' && activeTab !== 'supplier-detail') {
      setVisitedTabs(prev => {
        if (prev.has(activeTab)) return prev;
        const next = new Set(prev);
        next.add(activeTab);
        return next;
      });
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8F5] text-slate-800 p-4 font-tamil">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5EBE6] p-1.5 shadow-md flex items-center justify-center mb-3">
          <img src="/deva-logo.png" alt="DEVA & CO" className="max-h-full max-w-full object-contain" />
        </div>
        <h1 className="text-xl font-bold text-[#176B45] tracking-tight">
          தேவா & கோ
        </h1>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          தக்காளி & காய்கனி கமிஷன் மண்டி
        </p>
        <div className="flex items-center gap-2 mt-5 text-xs font-bold text-[#176B45]">
          <div className="w-4 h-4 border-2 border-[#176B45] border-t-transparent rounded-full animate-spin"></div>
          <span>ஏற்றுகிறது... (Loading Mandi System...)</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleSelectBuyer = (buyerId) => {
    setSelectedBuyerId(buyerId);
    setActiveTab('buyer-detail');
  };

  const handleSelectSupplier = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setActiveTab('supplier-detail');
  };

  const handleBackToBuyers = () => {
    setSelectedBuyerId(null);
    setActiveTab('buyers');
  };

  const handleBackToSuppliers = () => {
    setSelectedSupplierId(null);
    setActiveTab('suppliers');
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans text-content-main overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4.5">
        <Suspense fallback={<PageFallback />}>
          {/* 1. Dashboard Tab (Instant Keep-Alive) */}
          {visitedTabs.has('dashboard') && (
            <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
              <Dashboard selectedDate={selectedDate} />
            </div>
          )}

          {/* 2. Buyers Tab (Instant Keep-Alive) */}
          {visitedTabs.has('buyers') && (
            <div style={{ display: activeTab === 'buyers' ? 'block' : 'none' }}>
              <Buyers onSelectBuyer={handleSelectBuyer} />
            </div>
          )}

          {/* 2b. Buyer Detail (Dynamic) */}
          {activeTab === 'buyer-detail' && (
            <BuyerDetail buyerId={selectedBuyerId} onBack={handleBackToBuyers} />
          )}

          {/* 3. Suppliers Tab (Instant Keep-Alive) */}
          {isAdmin && visitedTabs.has('suppliers') && (
            <div style={{ display: activeTab === 'suppliers' ? 'block' : 'none' }}>
              <Suppliers onSelectSupplier={handleSelectSupplier} />
            </div>
          )}

          {/* 3b. Supplier Detail (Dynamic) */}
          {isAdmin && activeTab === 'supplier-detail' && (
            <SupplierDetail
              supplierId={selectedSupplierId}
              onBack={handleBackToSuppliers}
            />
          )}

          {/* 4. Expenses / Outlay (Instant Keep-Alive) */}
          {isAdmin && visitedTabs.has('outlay') && (
            <div style={{ display: activeTab === 'outlay' ? 'block' : 'none' }}>
              <Outlay selectedDate={selectedDate} />
            </div>
          )}

          {/* 5. History (Instant Keep-Alive) */}
          {visitedTabs.has('history') && (
            <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
              <History selectedDate={selectedDate} />
            </div>
          )}

          {/* 6. Reports (Instant Keep-Alive) */}
          {isAdmin && visitedTabs.has('reports') && (
            <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
              <Reports />
            </div>
          )}

          {/* 7. Settings (Instant Keep-Alive) */}
          {isAdmin && visitedTabs.has('settings') && (
            <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
              <Settings />
            </div>
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-surface-border bg-white py-3.5 text-center text-xs text-content-secondary font-tamil">
        தேவா & கோ – தக்காளி & காய்கனி கமிஷன் மண்டி | திண்டுக்கல்
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainLayout />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
