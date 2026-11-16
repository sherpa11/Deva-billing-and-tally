import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ReceiptText, Plus, Trash2, Calendar } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';

const Outlay = ({ selectedDate }) => {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [date]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/outlay?date=${date}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setTotalExpense(res.data.totalExpense);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await api.delete(`/outlay/${id}`);
      if (res.data.success) {
        fetchExpenses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'TEA_SNACKS': return 'Tea & Refreshments';
      case 'COOLIE': return 'Coolie & Loading';
      case 'RENT': return 'Rent';
      case 'ELECTRICITY': return 'Electricity';
      case 'TRANSPORT': return 'Transport & Freight';
      default: return 'General Overhead';
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Banner - Compact */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-subtle pleasant-card">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-content-main tracking-tight font-sans">
            Daily Expenses
          </h1>
          <p className="text-[11px] text-content-secondary mt-0.5">
            Operational expenses and daily mandi overheads
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Date & Summary Card */}
      <div className="bg-white p-3 rounded-xl border border-surface-border shadow-subtle flex flex-wrap items-center justify-between gap-3 pleasant-card">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-3.5 h-3.5 text-content-secondary" />
          <span className="font-medium text-content-secondary">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-1 border border-surface-border rounded-lg text-xs bg-surface-bg font-medium"
          />
        </div>

        <div className="text-right text-xs">
          <span className="text-content-secondary font-medium">Daily Expense Total: </span>
          <span className="text-base sm:text-lg font-bold text-status-danger ml-1">₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-surface-hover">
                    <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                      {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-surface-bg text-content-main px-2 py-0.5 rounded text-[11px] font-medium border border-surface-border">
                        {getCategoryLabel(e.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-content-main font-tamil">{e.purpose}</td>
                    <td className="py-3 px-4 text-content-secondary font-tamil">{e.notes || '—'}</td>
                    <td className="py-3 px-4 text-right font-bold text-status-danger">₹{e.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleVoid(e._id)}
                        className="p-1 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-content-secondary">
                    No expenses recorded for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onExpenseSaved={fetchExpenses}
        initialDate={date}
      />
    </div>
  );
};

export default Outlay;
