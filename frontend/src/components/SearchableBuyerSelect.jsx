import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/api';
import { Search, ChevronDown, Check, X, User, Phone, Wallet } from 'lucide-react';

const SearchableBuyerSelect = ({
  value,
  onChange,
  onBuyerSelected,
  placeholder = 'Select Buyer / Customer...',
  className = '',
  disabled = false,
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Initial fetch of active buyers (cached locally)
  useEffect(() => {
    fetchBuyers('');
  }, []);

  const fetchBuyers = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/buyers?status=active&autocomplete=true&search=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setBuyers(res.data.buyers || []);
      }
    } catch (err) {
      console.error('Failed to search buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced server search when typing
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchBuyers(searchTerm.trim());
      setHighlightedIndex(0);
    }, 180);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // When dropdown opens, focus input
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const selectedBuyer = useMemo(() => {
    return buyers.find((b) => b._id === value) || null;
  }, [buyers, value]);

  // If selectedBuyer not in current search list, fetch it directly
  useEffect(() => {
    if (value && !selectedBuyer) {
      api.get(`/buyers/${value}`).then((res) => {
        if (res.data.success && res.data.buyer) {
          setBuyers((prev) => {
            if (prev.some((b) => b._id === res.data.buyer._id)) return prev;
            return [res.data.buyer, ...prev];
          });
        }
      }).catch(() => {});
    }
  }, [value, selectedBuyer]);

  const handleSelect = (buyer) => {
    onChange(buyer._id);
    if (onBuyerSelected) {
      onBuyerSelected(buyer);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < buyers.length - 1 ? prev + 1 : 0));
      scrollIntoView(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : buyers.length - 1));
      scrollIntoView(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (buyers[highlightedIndex]) {
        handleSelect(buyers[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full h-11 text-left px-3.5 py-2 rounded-xl border flex items-center justify-between transition-all bg-white font-sans ${
          isOpen
            ? 'border-forest-600 ring-2 ring-forest-600/20 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          {selectedBuyer ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-900 text-sm font-tamil truncate">
                {selectedBuyer.name}
              </span>
              {selectedBuyer.phone && (
                <span className="text-xs text-slate-500 font-mono truncate hidden xs:inline">
                  ({selectedBuyer.phone})
                </span>
              )}
              {selectedBuyer.currentBalance !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    selectedBuyer.currentBalance > 0
                      ? 'bg-amber-100 text-amber-900'
                      : selectedBuyer.currentBalance < 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ₹{Math.abs(selectedBuyer.currentBalance).toLocaleString('en-IN')}{' '}
                  {selectedBuyer.currentBalance > 0 ? 'Due' : selectedBuyer.currentBalance < 0 ? 'Adv' : ''}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-forest-600' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[280px]">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type name, phone, or code to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-10 pl-9 pr-8 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs py-1"
          >
            {loading && buyers.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Searching customers...
              </div>
            ) : buyers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-slate-600 font-medium">No matching buyers found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching with a different name or mobile number
                </p>
              </div>
            ) : (
              buyers.map((buyer, index) => {
                const isSelected = buyer._id === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={buyer._id}
                    onClick={() => handleSelect(buyer)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-forest-50/90 text-forest-900 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100/80 text-slate-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm font-tamil text-slate-900 truncate">
                          {buyer.name}
                        </span>
                        {buyer.buyerCode && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{buyer.buyerCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-0.5">
                        {buyer.phone ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {buyer.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                        {buyer.address && (
                          <span className="truncate max-w-[140px] text-slate-400">
                            • {buyer.address}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                          (buyer.currentBalance || 0) > 0
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : (buyer.currentBalance || 0) < 0
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ₹{Math.abs(buyer.currentBalance || 0).toLocaleString('en-IN')}{' '}
                        {(buyer.currentBalance || 0) > 0
                          ? 'Due'
                          : (buyer.currentBalance || 0) < 0
                          ? 'Adv'
                          : 'Settled'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-forest-600 shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableBuyerSelect;
