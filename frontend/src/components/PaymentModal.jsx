import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/api';
import SearchableBuyerSelect from './SearchableBuyerSelect';
import { Wallet, Save } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onPaymentSaved, initialDate, defaultBuyerId }) => {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(defaultBuyerId || '');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [oldBalance, setOldBalance] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBuyers();
      if (initialDate) setDate(initialDate);
      if (defaultBuyerId) setSelectedBuyerId(defaultBuyerId);
      setError('');
    }
  }, [isOpen, initialDate, defaultBuyerId]);

  const fetchBuyers = async () => {
    try {
      const res = await api.get('/buyers?status=active');
      if (res.data.success) {
        setBuyers(res.data.buyers);
        if (defaultBuyerId) {
          const match = res.data.buyers.find((b) => b._id === defaultBuyerId);
          if (match) setOldBalance(match.currentBalance || 0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyerChange = (buyerId) => {
    setSelectedBuyerId(buyerId);
    const buyer = buyers.find((b) => b._id === buyerId);
    if (buyer) {
      setOldBalance(buyer.currentBalance || 0);
    } else {
      setOldBalance(0);
    }
  };

  const numOld = Number(oldBalance) || 0;
  const numPaid = Number(amountPaid) || 0;
  const newBalance = Math.round((numOld - numPaid) * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuyerId) {
      setError('Please select a customer.');
      return;
    }
    if (numPaid <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/transactions/payment', {
        buyerId: selectedBuyerId,
        amountPaid: numPaid,
        paymentMode,
        transactionDate: date,
        manualOldBalance: numOld,
        notes,
      });

      if (res.data.success) {
        onPaymentSaved(res.data.payment);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBuyerId('');
    setAmountPaid('');
    setOldBalance(0);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Customer Payment"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-content-main mb-1">
            Customer Name <span className="text-status-danger">*</span>
          </label>
          <SearchableBuyerSelect
            value={selectedBuyerId}
            onChange={handleBuyerChange}
            onBuyerSelected={(buyer) => setOldBalance(buyer.currentBalance || 0)}
            placeholder="Search or Select Customer..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-content-main mb-1">Date</label>
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
              <option value="CASH">Cash</option>
              <option value="GPAY">UPI / GPay / PhonePe</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Tally Balance card */}
        <div className="bg-surface-bg p-3.5 rounded-xl border border-surface-border space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-surface-border">
            <span className="font-medium text-content-secondary">Current Balance Due:</span>
            <span className="font-bold text-content-main">₹{numOld.toLocaleString('en-IN')}</span>
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">
              Payment Amount (₹) <span className="text-status-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full text-base font-bold text-forest-700 p-2 rounded-lg border border-surface-border bg-white focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-surface-border">
            <span className="font-medium text-content-secondary">Remaining Balance:</span>
            <span className={`font-bold text-sm ${newBalance > 0 ? 'text-status-warning' : 'text-forest-600'}`}>
              ₹{newBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-content-main mb-1">
            Reference / Memo
          </label>
          <input
            type="text"
            placeholder="e.g. Cash collection, counter deposit..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Payment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
