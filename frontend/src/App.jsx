import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Buyers from './pages/Buyers';
import BuyerDetail from './pages/BuyerDetail';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import Outlay from './pages/Outlay';
import History from './pages/History';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

const MainLayout = () => {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

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
        {activeTab === 'dashboard' && <Dashboard selectedDate={selectedDate} />}

        {activeTab === 'buyers' && <Buyers onSelectBuyer={handleSelectBuyer} />}
        {activeTab === 'buyer-detail' && (
          <BuyerDetail buyerId={selectedBuyerId} onBack={handleBackToBuyers} />
        )}

        {isAdmin && activeTab === 'suppliers' && (
          <Suppliers onSelectSupplier={handleSelectSupplier} />
        )}
        {isAdmin && activeTab === 'supplier-detail' && (
          <SupplierDetail
            supplierId={selectedSupplierId}
            onBack={handleBackToSuppliers}
          />
        )}

        {isAdmin && activeTab === 'outlay' && <Outlay selectedDate={selectedDate} />}

        {activeTab === 'history' && <History selectedDate={selectedDate} />}

        {isAdmin && activeTab === 'reports' && <Reports />}

        {isAdmin && activeTab === 'settings' && <Settings />}
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
