import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/api';
import { Wallet, Save, Search, User } from 'lucide-react';

const SupplierPaymentModal = ({
  isOpen,
  onClose,
  onPaymentSaved,
  initialDate,
  defaultSupplierId
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(defaultSupplierId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [oldBalance, setOldBalance] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      if (initialDate) setDate(initialDate);
      if (defaultSupplierId) setSelectedSupplierId(defaultSupplierId);
      setError('');
    }
  }, [isOpen, initialDate, defaultSupplierId]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers?status=active');
      if (res.data.success) {
        setSuppliers(res.data.suppliers || []);
        if (defaultSupplierId) {
          const match = res.data.suppliers.find((s) => s._id === defaultSupplierId);
          if (match) setOldBalance(Number(match.currentBalance || 0));
        }
      }
    } catch (err) {
      console.error('Failed to load suppliers for payment:', err);
    }
  };

  const handleSupplierChange = (supId) => {
    setSelectedSupplierId(supId);
    const supplier = suppliers.find((s) => s._id === supId);
    if (supplier) {
      setOldBalance(Number(supplier.currentBalance || 0));
    } else {
      setOldBalance(0);
    }
  };

  const numOld = Number(oldBalance) || 0;
  const numPaid = Number(amountPaid) || 0;
  // Outstanding payable reduces by payment amount
  const newBalance = Math.round((numOld - numPaid) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setError('விவசாயி / சப்ளையரை தேர்ந்தெடுக்கவும் (Please select a supplier).');
      return;
    }
    if (numPaid <= 0) {
      setError('செல்லுபடியாகும் தொகையை உள்ளிடவும் (Please enter a valid payment amount).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/suppliers/payment', {
        supplierId: selectedSupplierId,
        amountPaid: numPaid,
        paymentMode,
        paymentDate: date,
        manualOldBalance: numOld,
        notes: notes ? notes.trim() : ''
      });

      if (res.data.success) {
        if (typeof onPaymentSaved === 'function') {
          onPaymentSaved(res.data.payment, res.data.supplier);
        }
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSupplierId('');
    setSearchTerm('');
    setAmountPaid('');
    setOldBalance(0);
    setNotes('');
    setError('');
    onClose();
  };

  const filteredSuppliers = searchTerm
    ? suppliers.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.supplierCode && s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
      )
    : suppliers;

  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="விவசாயி பட்டுவாடா (Record Supplier Payment)"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-medium">
            {error}
          </div>
        )}

        {/* Supplier Selection */}
        <div>
          <label className="block font-semibold text-content-main mb-1">
            Farmer / Supplier <span className="text-status-danger">*</span>
          </label>

          {defaultSupplierId && selectedSupplier ? (
            <div className="p-2.5 rounded-lg border border-surface-border bg-surface-bg flex items-center justify-between">
              <div>
                <span className="font-bold text-content-main text-xs font-tamil">
                  {selectedSupplier.name}
                </span>
                {selectedSupplier.supplierCode && (
                  <span className="ml-2 text-[10px] text-content-secondary uppercase font-semibold">
                    {selectedSupplier.supplierCode}
                  </span>
                )}
                {selectedSupplier.phone && (
                  <div className="text-[11px] text-content-secondary mt-0.5">
                    {selectedSupplier.phone}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                Due: ₹{(selectedSupplier.currentBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-content-secondary absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search farmer name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
                />
              </div>

              <select
                value={selectedSupplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border bg-white focus:outline-none focus:border-forest-600 font-tamil"
              >
                <option value="">-- விவசாயி / சப்ளையரை தேர்வு செய்க --</option>
                {filteredSuppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.supplierCode ? `(${s.supplierCode})` : ''} {s.phone ? `• ${s.phone}` : ''} — Due: ₹{(s.currentBalance || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date & Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-content-main mb-1">Payment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
            >
              <option value="CASH">Cash (ரொக்கம்)</option>
              <option value="GPAY">UPI / GPay / PhonePe</option>
              <option value="BANK">Bank Transfer (வங்கி)</option>
              <option value="CHEQUE">Cheque (காசோலை)</option>
            </select>
          </div>
        </div>

        {/* Balance & Amount Card */}
        <div className="bg-surface-bg p-3.5 rounded-xl border border-surface-border space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-surface-border">
            <span className="font-medium text-content-secondary">Current Balance Due (முன் பாக்கி):</span>
            <span className="font-bold text-content-main text-xs">
              ₹{numOld.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">
              Payment Amount / செலுத்தும் தொகை (₹) <span className="text-status-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full text-base font-bold text-forest-700 p-2 rounded-lg border border-surface-border bg-white focus:outline-none focus:border-forest-600"
              autoFocus={Boolean(defaultSupplierId)}
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-surface-border">
            <span className="font-medium text-content-secondary">Remaining Balance (மீதி பாக்கி):</span>
            <span className={`font-bold text-sm ${
              newBalance > 0 ? 'text-status-warning' : newBalance < 0 ? 'text-blue-700' : 'text-forest-600'
            }`}>
              ₹{newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Reference / Notes */}
        <div>
          <label className="block font-semibold text-content-main mb-1">
            Payment Remarks / குறிப்பு (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Bank transfer ref, lot settlement, cash paid at mandi..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600 font-tamil"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Payment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierPaymentModal;
