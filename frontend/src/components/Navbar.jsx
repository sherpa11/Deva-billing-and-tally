import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import DateFilter from './DateFilter';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  ReceiptText, 
  History, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, selectedDate, setSelectedDate }) => {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'buyers', label: 'Buyers & Tally', icon: Users },
    ...(isAdmin ? [
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
      { id: 'outlay', label: 'Expenses', icon: ReceiptText },
    ] : []),
    { id: 'history', label: 'History', icon: History },
    ...(isAdmin ? [
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ] : []),
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  // Clean formatted user name (remove parenthetical suffix if present to prevent multi-line wrapping)
  const displayName = user?.name ? user.name.split('(')[0].trim() : (user?.username || 'User');

  return (
    <header className="no-print bg-white border-b border-surface-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          {/* Brand Logo & Name - Centered vertically with comfortable breathing space */}
          <div className="flex items-center min-w-0 flex-1 sm:flex-none">
            <button 
              onClick={() => handleNavClick('dashboard')} 
              className="flex items-center gap-2.5 text-left focus:outline-none min-w-0 py-1"
            >
              <img 
                src="/deva-logo.png" 
                alt="DEVA & CO" 
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg shrink-0 border border-slate-200/60 shadow-xs bg-white p-0.5"
              />
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-sm sm:text-base font-bold text-content-main font-tamil tracking-tight leading-snug truncate">
                  {settings.storeName || 'தேவா & கோ'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-content-secondary font-tamil leading-snug truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                  {settings.tagline || 'தக்காளி & காய்கனி கமிஷன் மண்டி'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links - Centered, comfortable vertical rhythm */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-forest-600 text-white font-semibold shadow-xs'
                      : 'text-content-secondary hover:text-content-main hover:bg-surface-hover'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Section: Date Filter & Profile - Vertically centered */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {selectedDate && (
              <DateFilter
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onTodayClick={handleTodayClick}
              />
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-surface-border shrink-0 whitespace-nowrap">
              <div className="text-right whitespace-nowrap">
                <div className="text-xs font-semibold text-content-main leading-tight whitespace-nowrap truncate max-w-[130px]" title={user?.name || ''}>
                  {displayName}
                </div>
                <div className="text-[10px] text-forest-700 font-semibold uppercase tracking-wider leading-tight whitespace-nowrap">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Staff'}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button - ALWAYS shrink-0 and visible on mobile */}
          <div className="flex items-center gap-1 lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-content-main hover:bg-surface-hover rounded-lg focus:outline-none shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-white px-4 pt-3 pb-4 space-y-3">
          {selectedDate && (
            <div className="pb-2 border-b border-surface-border">
              <DateFilter
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onTodayClick={handleTodayClick}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    isActive
                      ? 'bg-forest-600 text-white font-semibold'
                      : 'bg-surface-bg text-content-main hover:bg-surface-hover font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-content-main">{displayName}</div>
              <div className="text-[10px] text-content-secondary uppercase font-semibold">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Accountant'}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-status-dangerLight text-status-danger rounded-lg text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
