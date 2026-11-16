import React, { useState } from 'react';
import Modal from './Modal';
import api from '../api/api';
import { Save } from 'lucide-react';

const ExpenseModal = ({ isOpen, onClose, onExpenseSaved, initialDate }) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('TEA_SNACKS');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setError('Please enter expense purpose/description.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/outlay', {
        date,
        purpose: purpose.trim(),
        amount: Number(amount),
        category,
        notes: notes.trim(),
      });

      if (res.data.success) {
        onExpenseSaved(res.data.expense);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPurpose('');
    setAmount('');
    setCategory('TEA_SNACKS');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Daily Expense"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-medium">
            {error}
          </div>
        )}

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
          <label className="block font-semibold text-content-main mb-1">
            Expense Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
          >
            <option value="TEA_SNACKS">Tea & Refreshments</option>
            <option value="COOLIE">Coolie & Loading</option>
            <option value="RENT">Rent</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="TRANSPORT">Transport & Freight</option>
            <option value="GENERAL">General Mandi Overhead</option>
            <option value="OTHER">Other Expense</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-content-main mb-1">
            Purpose / Description <span className="text-status-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Worker lunch / vehicle unloading..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600 font-tamil"
          />
        </div>

        <div>
          <label className="block font-semibold text-content-main mb-1">
            Amount (₹) <span className="text-status-danger">*</span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full font-bold text-base text-content-main p-2 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
          />
        </div>

        <div>
          <label className="block font-semibold text-content-main mb-1">Notes / Remarks</label>
          <input
            type="text"
            placeholder="Optional memo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
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
            <span>Save Expense</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
