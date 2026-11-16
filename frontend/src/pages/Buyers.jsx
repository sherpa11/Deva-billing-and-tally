import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  Eye, 
  Receipt, 
  Wallet, 
  Pencil, 
  Trash2, 
  Phone, 
  MapPin, 
  Plus,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import PaymentModal from '../components/PaymentModal';
import BuyerBillingModal from '../components/BuyerBillingModal';
import BuyerPrintModal from '../components/BuyerPrintModal';

const Buyers = ({ onSelectBuyer }) => {
  const [buyers, setBuyers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DUE, ADVANCE, ZERO
  const [loading, setLoading] = useState(true);

  // Add Buyer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Buyer Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Quick Action Modals
  const [selectedBuyerForPay, setSelectedBuyerForPay] = useState(null);
  const [selectedBuyerForBill, setSelectedBuyerForBill] = useState(null);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    fetchBuyers();
  }, [search]);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/buyers?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setBuyers(res.data.buyers);
      }
    } catch (err) {
      console.error('Failed to load buyers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuyer = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.post('/buyers', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        initialBalance: Number(initialBalance) || 0,
        notes: notes.trim(),
      });

      if (res.data.success) {
        fetchBuyers();
        setShowAddModal(false);
        setName('');
        setPhone('');
        setAddress('');
        setInitialBalance('');
        setNotes('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create buyer');
    }
  };

  const handleOpenEditModal = (buyer) => {
    setEditingBuyer(buyer);
    setEditName(buyer.name || '');
    setEditPhone(buyer.phone || '');
    setEditAddress(buyer.address || '');
    setEditNotes(buyer.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateBuyer = async (e) => {
    e.preventDefault();
    if (!editingBuyer || !editName.trim()) return;

    try {
      const res = await api.put(`/buyers/${editingBuyer._id}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        notes: editNotes.trim(),
      });

      if (res.data.success) {
        fetchBuyers();
        setShowEditModal(false);
        setEditingBuyer(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update buyer');
    }
  };

  const handleDeleteBuyer = async (buyer) => {
    if (!window.confirm(`Are you sure you want to delete buyer "${buyer.name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/buyers/${buyer._id}`);
      if (res.data.success) {
        fetchBuyers();
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresConfirmation) {
        if (
          window.confirm(
            `${data.message}\n\nDo you want to permanently delete this buyer and remove all associated ledger records?`
          )
        ) {
          try {
            const forceRes = await api.delete(`/buyers/${buyer._id}?force=true`);
            if (forceRes.data.success) {
              fetchBuyers();
            }
          } catch (forceErr) {
            alert(forceErr.response?.data?.message || 'Failed to delete buyer');
          }
        }
      } else {
        alert(data?.message || 'Failed to delete buyer');
      }
    }
  };

  const formatLastActive = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredBuyers = buyers.filter((b) => {
    if (filterType === 'DUE') return b.currentBalance > 0;
    if (filterType === 'ADVANCE') return b.currentBalance < 0;
    if (filterType === 'ZERO') return b.currentBalance === 0;
    return true;
  });

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Banner: Compact for both Laptop & Mobile */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-subtle pleasant-card">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0">
            <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-forest-700" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-content-main tracking-tight font-sans truncate">
              Buyers & Customer Tally
            </h1>
            <p className="text-[11px] text-content-secondary hidden sm:block truncate">
              Manage buyer accounts, current dues, and tallies
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 h-8 sm:h-8.5 px-2.5 sm:px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap active:scale-[0.98] shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Buyer</span>
        </button>
      </div>

      {/* Search & Filter Bar: Compact */}
      <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-surface-border shadow-subtle flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-content-secondary absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search buyer, phone, stall..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 bg-surface-bg transition-colors"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'DUE', label: 'Due' },
              { id: 'ADVANCE', label: 'Advance' },
              { id: 'ZERO', label: 'Settled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  filterType === tab.id
                    ? 'bg-content-main text-white font-semibold shadow-2xs'
                    : 'bg-surface-bg text-content-secondary hover:text-content-main hover:bg-surface-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-content-secondary flex justify-between sm:justify-end items-center shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-surface-border">
          <span className="sm:hidden text-content-secondary">Total:</span>
          <span>Buyers: <strong className="text-content-main">{filteredBuyers.length}</strong></span>
        </div>
      </div>

      {/* Buyers Table: Compact & Refined */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[780px]">
            <thead>
              <tr className="bg-[#FAFCF9] text-content-secondary font-semibold border-b border-surface-border uppercase tracking-wider text-[10px] sm:text-[11px]">
                <th className="py-2.5 px-3 min-w-[140px]">Buyer Name</th>
                <th className="py-2.5 px-3 min-w-[100px]">Phone</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">Current Balance</th>
                <th className="py-2.5 px-3 text-right min-w-[100px]">Total Purchases</th>
                <th className="py-2.5 px-3 text-right min-w-[100px]">Total Payments</th>
                <th className="py-2.5 px-3 text-center min-w-[95px]">Last Active</th>
                <th className="py-2.5 px-3 text-center min-w-[240px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredBuyers.length > 0 ? (
                filteredBuyers.map((b) => (
                  <tr key={b._id} className="pleasant-table-row transition-colors">
                    {/* Buyer Name */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="font-bold text-content-main font-tamil text-xs leading-snug">
                        {b.name}
                      </div>
                      {b.buyerCode && (
                        <span className="text-[10px] text-content-secondary font-sans font-medium uppercase tracking-wider">
                          {b.buyerCode}
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-2 px-3 text-content-secondary whitespace-nowrap">
                      {b.phone ? (
                        <span className="font-medium text-content-main text-xs">{b.phone}</span>
                      ) : (
                        <span className="text-content-muted">—</span>
                      )}
                    </td>

                    {/* Current Balance with Pill Badge */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {b.currentBalance > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF6E7] text-[#B45309] border border-[#FDE68A]/70 shadow-2xs">
                          ₹{b.currentBalance.toLocaleString('en-IN')} Due
                        </span>
                      ) : b.currentBalance < 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-forest-50 text-forest-700 border border-forest-200/70 shadow-2xs">
                          ₹{Math.abs(b.currentBalance).toLocaleString('en-IN')} Adv
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-bg text-content-secondary border border-surface-border">
                          Settled
                        </span>
                      )}
                    </td>

                    {/* Total Purchases */}
                    <td className="py-2 px-3 text-right font-medium text-content-main whitespace-nowrap text-xs">
                      ₹{(b.totalPurchases || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Total Payments */}
                    <td className="py-2 px-3 text-right font-bold text-forest-600 whitespace-nowrap text-xs">
                      ₹{(b.totalPayments || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Last Active */}
                    <td className="py-2 px-3 text-center text-content-secondary whitespace-nowrap text-xs">
                      {formatLastActive(b.lastActive)}
                    </td>

                    {/* 5 Distinct Compact Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        {/* 1. Ledger */}
                        <button
                          onClick={() => onSelectBuyer(b._id)}
                          className="action-btn action-btn-ledger"
                          title="View Ledger Statement"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Ledger</span>
                        </button>

                        {/* 2. Bill */}
                        <button
                          onClick={() => setSelectedBuyerForBill(b._id)}
                          className="action-btn action-btn-bill"
                          title="New Sale Bill"
                        >
                          <Receipt className="w-3 h-3 text-rose-600" />
                          <span>Bill</span>
                        </button>

                        {/* 3. Pay */}
                        <button
                          onClick={() => setSelectedBuyerForPay(b._id)}
                          className="action-btn action-btn-pay"
                          title="Record Payment"
                        >
                          <Wallet className="w-3 h-3 text-sky-600" />
                          <span>Pay</span>
                        </button>

                        {/* 4. Edit */}
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="action-btn action-btn-edit"
                          title="Edit Customer"
                        >
                          <Pencil className="w-3 h-3 text-amber-600" />
                          <span>Edit</span>
                        </button>

                        {/* 5. Delete */}
                        <button
                          onClick={() => handleDeleteBuyer(b)}
                          className="action-btn action-btn-delete"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-content-secondary">
                    {loading ? 'Loading buyers list...' : 'No buyers found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Buyer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Buyer"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateBuyer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-content-main mb-1">
              Customer Name <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. கண்ணன் ஸ்டோர்ஸ் / Kannan Stores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Market Stall / Address</label>
            <input
              type="text"
              placeholder="Shop number, market address, or town"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              placeholder="0 (Enter previous due if any)"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Notes / Memo</label>
            <input
              type="text"
              placeholder="Optional memo"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-xs transition-colors"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Buyer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBuyer(null);
        }}
        title={`Edit Buyer: ${editingBuyer?.name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateBuyer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-content-main mb-1">
              Customer Name <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Phone Number</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Market Stall / Address</label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Notes / Memo</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditingBuyer(null);
              }}
              className="px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-xs transition-colors"
            >
              Update Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Pay Modal */}
      {selectedBuyerForPay && (
        <PaymentModal
          isOpen={Boolean(selectedBuyerForPay)}
          onClose={() => setSelectedBuyerForPay(null)}
          onPaymentSaved={() => {
            fetchBuyers();
            setSelectedBuyerForPay(null);
          }}
          defaultBuyerId={selectedBuyerForPay}
        />
      )}

      {/* Quick Bill Modal */}
      {selectedBuyerForBill && (
        <BuyerBillingModal
          isOpen={Boolean(selectedBuyerForBill)}
          onClose={() => setSelectedBuyerForBill(null)}
          onBillSaved={(bill, shouldPrint) => {
            fetchBuyers();
            setSelectedBuyerForBill(null);
            if (shouldPrint) setPrintBill(bill);
          }}
          defaultBuyerId={selectedBuyerForBill}
        />
      )}

      {/* Buyer Bill Print Modal */}
      <BuyerPrintModal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />
    </div>
  );
};

export default Buyers;