import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Wallet, 
  Boxes, 
  TrendingUp, 
  AlertCircle,
  Printer, 
  Trash2,
  Receipt,
  Truck
} from 'lucide-react';

import BuyerBillingModal from '../components/BuyerBillingModal';
import PaymentModal from '../components/PaymentModal';
import SupplierBillingModal from '../components/SupplierBillingModal';
import ExpenseModal from '../components/ExpenseModal';
import BuyerPrintModal from '../components/BuyerPrintModal';
import SupplierPrintModal from '../components/SupplierPrintModal';

const Dashboard = ({ selectedDate }) => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [todaySupplierBills, setTodaySupplierBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBuyerBillModal, setShowBuyerBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSupplierBillModal, setShowSupplierBillModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Print Modals
  const [printBuyerBill, setPrintBuyerBill] = useState(null);
  const [printSupplierBill, setPrintSupplierBill] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/stats?date=${selectedDate}`);
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentTransactions(res.data.recentTransactions || []);
        setTodaySupplierBills(res.data.todaySupplierBills || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBillSaved = (bill, shouldPrint) => {
    fetchDashboardData();
    if (shouldPrint) setPrintBuyerBill(bill);
  };

  const handleSupplierBillSaved = (bill, shouldPrint) => {
    fetchDashboardData();
    if (shouldPrint) setPrintSupplierBill(bill);
  };

  const handlePaymentSaved = () => fetchDashboardData();
  const handleExpenseSaved = () => fetchDashboardData();

  const handleVoidTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to void this transaction?')) return;
    try {
      const res = await api.post(`/transactions/${id}/void`, { reason: 'Voided by Administrator' });
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void transaction');
    }
  };

  const handleVoidSupplierBill = async (id) => {
    if (!window.confirm('Are you sure you want to void this supplier purchase lot?')) return;
    try {
      const res = await api.post(`/supplier-bills/${id}/void`, { reason: 'Voided by Administrator from Dashboard' });
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void supplier lot');
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) return `${d}-${m}-${y}`;
    const dt = new Date(dateStr);
    return `${dt.getDate().toString().padStart(2, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getFullYear()}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Dashboard Header Bar - Compact for both Laptop & Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-subtle pleasant-card">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-content-main tracking-tight font-sans">
            Mandi Operations
          </h1>
          <p className="text-[11px] text-content-secondary mt-0.5">
            Selected Date: <span className="font-semibold text-content-main">{formatDisplayDate(selectedDate)}</span>
          </p>
        </div>

        {/* Action Buttons: 2x2 on Mobile, Inline on Desktop/Laptop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowBuyerBillModal(true)}
            className="flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </button>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Wallet className="w-3.5 h-3.5 text-content-secondary" />
            <span>Payment</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowSupplierBillModal(true)}
                className="flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-all whitespace-nowrap active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-content-secondary" />
                <span>Purchase</span>
              </button>

              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-all whitespace-nowrap active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-content-secondary" />
                <span>Expense</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards Grid: Compact & Balanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Inward Intake */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-border shadow-subtle flex flex-col justify-between min-h-[135px] pleasant-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                Inward Intake
              </span>
              <div className="w-6 h-6 rounded-md bg-forest-50 flex items-center justify-center text-forest-600">
                <Boxes className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2 h-7">
              <span className="text-xl sm:text-2xl font-bold text-content-main tracking-tight">
                {stats?.intake?.bigEquivalent || 0}
              </span>
              <span className="text-[11px] text-content-secondary font-medium">Big Eqv Crates</span>
            </div>
            <p className="text-[11px] text-content-secondary mt-0.5 truncate">
              Big: <span className="font-semibold text-content-main">{stats?.intake?.bigBoxes || 0}</span> · Small:{' '}
              <span className="font-semibold text-content-main">{stats?.intake?.smallBoxes || 0}</span>
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-surface-border flex justify-between items-center text-[11px]">
            <span className="text-content-secondary">Total Value:</span>
            <span className="font-semibold text-content-main">₹{(stats?.intake?.grossValue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 2: Daily Sales */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-border shadow-subtle flex flex-col justify-between min-h-[135px] pleasant-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                Daily Sales
              </span>
              <div className="w-6 h-6 rounded-md bg-forest-50 flex items-center justify-center text-forest-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2 h-7">
              <span className="text-xl sm:text-2xl font-bold text-forest-600 tracking-tight">
                ₹{(stats?.sales?.totalSales || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-content-secondary mt-0.5 truncate">
              Qty: <span className="font-semibold text-content-main">{stats?.sales?.bigEquivalent || 0} Eqv</span> ({stats?.sales?.bigBoxes || 0}B / {stats?.sales?.smallBoxes || 0}S)
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-surface-border flex justify-between items-center text-[11px]">
            <span className="text-content-secondary">Total Volume:</span>
            <span className="font-semibold text-forest-600">{stats?.sales?.bigEquivalent || 0} Crates</span>
          </div>
        </div>

        {/* Card 3: Cash Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-border shadow-subtle flex flex-col justify-between min-h-[135px] pleasant-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                Cash Collected
              </span>
              <div className="w-6 h-6 rounded-md bg-forest-50 flex items-center justify-center text-forest-600">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2 h-7">
              <span className="text-xl sm:text-2xl font-bold text-content-main tracking-tight">
                ₹{(stats?.collections || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-content-secondary mt-0.5 truncate">
              Expenses: <span className="font-semibold text-content-main">₹{(stats?.expenses || 0).toLocaleString('en-IN')}</span>
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-surface-border flex justify-between items-center text-[11px]">
            <span className="text-content-secondary">Net Cash Flow:</span>
            <span className="font-semibold text-content-main">₹{(stats?.netCashFlow || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-surface-border shadow-subtle flex flex-col justify-between min-h-[135px] pleasant-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wider">
                Outstanding Due
              </span>
              <div className="w-6 h-6 rounded-md bg-forest-50 flex items-center justify-center text-status-warning">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2 h-7">
              <span className="text-xl sm:text-2xl font-bold text-status-danger tracking-tight">
                ₹{(stats?.outstanding?.totalBuyerOutstanding || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-content-secondary mt-0.5 truncate">
              Advance: <span className="font-semibold text-forest-600">₹{(stats?.outstanding?.totalBuyerAdvance || 0).toLocaleString('en-IN')}</span>
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-surface-border flex justify-between items-center text-[11px]">
            <span className="text-content-secondary">Supplier Payable:</span>
            <span className="font-semibold text-content-main">₹{(stats?.outstanding?.totalSupplierPayable || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table: Compact */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-content-main">
              Recent Transactions
            </h2>
            <p className="text-[11px] text-content-secondary mt-0.5">
              Sales invoices and payment collections
            </p>
          </div>
          <span className="text-[11px] text-content-secondary font-medium">
            {recentTransactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#FAFCF9] text-content-secondary font-semibold border-b border-surface-border uppercase tracking-wider text-[10px] sm:text-[11px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3 text-center">Crates</th>
                <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Bill Amount</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t) => {
                  const isOpeningBalance = 
                    t.notes?.includes('Opening Balance') || 
                    t.notes?.includes('துவக்க இருப்பு') || 
                    (t.type === 'PAYMENT' && (!t.amountPaid || t.amountPaid === 0));

                  return (
                    <tr key={t._id} className="pleasant-table-row transition-colors">
                      <td className="py-2 px-3 text-content-secondary whitespace-nowrap text-xs">
                        {formatTime(t.transactionDate || t.createdAt)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            t.type === 'SALE'
                              ? 'bg-forest-50 text-forest-700'
                              : isOpeningBalance
                              ? 'bg-surface-border/60 text-content-secondary'
                              : 'bg-surface-bg text-content-main border border-surface-border'
                          }`}
                        >
                          {t.type === 'SALE'
                            ? `Invoice #${t.billNumber}`
                            : isOpeningBalance
                            ? 'Opening Balance'
                            : 'Payment'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-content-main font-tamil whitespace-nowrap text-xs">
                        {t.buyerId?.name || '—'}
                      </td>
                      <td className="py-2 px-3 text-center text-content-secondary whitespace-nowrap text-xs">
                        {t.type === 'SALE'
                          ? `${t.bigBoxes}B / ${t.smallBoxes}S (${t.bigEquivalent} Eqv)`
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-content-main font-medium whitespace-nowrap text-xs">
                        {t.type === 'SALE' && t.ratePerBigBox ? `₹${t.ratePerBigBox}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-content-main whitespace-nowrap text-xs">
                        {t.type === 'SALE' ? `₹${t.billAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-forest-600 whitespace-nowrap text-xs">
                        {t.amountPaid > 0 ? `₹${t.amountPaid.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-content-main whitespace-nowrap text-xs">
                        <span className={t.newBalance > 0 ? 'text-status-warning' : 'text-forest-600'}>
                          ₹{t.newBalance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 min-w-[56px]">
                          {t.type === 'SALE' ? (
                            <button
                              onClick={() => setPrintBuyerBill(t)}
                              title="Print Tamil Bill"
                              className="p-1 sm:p-1.5 text-content-secondary hover:text-forest-600 hover:bg-forest-50 rounded transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="w-7 inline-block"></span>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleVoidTransaction(t._id)}
                              title="Void transaction"
                              className="p-1 sm:p-1.5 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-content-secondary text-xs">
                    No transactions recorded for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Supplier Purchases (Lot Received) - Exact match to reference application */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden pleasant-card">
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h2 className="text-xs sm:text-sm font-bold text-content-main font-sans">
              Today's Supplier Purchases (Lot Received)
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-forest-50 text-forest-700 border border-forest-200/60 shadow-2xs">
              {todaySupplierBills.length} Lots
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowSupplierBillModal(true)}
              className="flex items-center gap-1 h-7 sm:h-7.5 px-2.5 sm:px-3 text-xs font-semibold rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-700 border border-forest-200/80 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lot</span>
            </button>
          )}
        </div>

        {todaySupplierBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFCF9] text-content-secondary font-semibold border-b border-surface-border uppercase tracking-wider text-[10px] sm:text-[11px]">
                  <th className="py-2.5 px-3">Lot #</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Farmer / Supplier</th>
                  <th className="py-2.5 px-3 text-center">Lot Crates</th>
                  <th className="py-2.5 px-3 text-right">Gross Total</th>
                  <th className="py-2.5 px-3 text-right">Deductions</th>
                  <th className="py-2.5 px-3 text-right">Net Payable</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {todaySupplierBills.map((sb) => {
                  const totalBig = sb.items?.reduce((sum, it) => sum + (it.bigBoxes || 0), 0) || 0;
                  const totalSmall = sb.items?.reduce((sum, it) => sum + (it.smallBoxes || 0), 0) || 0;
                  const totalEqv = sb.items?.reduce((sum, it) => sum + (it.bigEquivalent || it.quantity || 0), 0) || 0;

                  return (
                    <tr key={sb._id} className="pleasant-table-row transition-colors">
                      <td className="py-2 px-3 whitespace-nowrap font-bold text-content-main">
                        #{sb.billNumber}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-content-secondary">
                        {formatTime(sb.transactionDate || sb.createdAt)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-content-main font-tamil">
                        <div>{sb.supplierId?.name || '—'}</div>
                        {sb.supplierId?.supplierCode && (
                          <span className="text-[10px] text-content-secondary font-sans uppercase">
                            {sb.supplierId.supplierCode}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center text-content-secondary whitespace-nowrap">
                        {totalBig > 0 || totalSmall > 0 ? (
                          <span>{totalBig}B / {totalSmall}S ({totalEqv} Eqv)</span>
                        ) : (
                          <span>{totalEqv} Crates</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-content-main whitespace-nowrap">
                        ₹{(sb.grossTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-status-warning whitespace-nowrap">
                        ₹{(sb.totalDeductions || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-forest-600 whitespace-nowrap">
                        ₹{(sb.netPayable || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 min-w-[56px]">
                          <button
                            onClick={() => setPrintSupplierBill(sb)}
                            title="Print Traditional Bill Pad"
                            className="p-1 sm:p-1.5 text-content-secondary hover:text-forest-600 hover:bg-forest-50 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleVoidSupplierBill(sb._id)}
                              title="Void supplier lot"
                              className="p-1 sm:p-1.5 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600 mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-content-main">
              No Supplier Purchases for this Date
            </p>
            <p className="text-[11px] text-content-secondary mt-0.5">
              Click "+ Add Lot" to record morning tomato lots.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <BuyerBillingModal
        isOpen={showBuyerBillModal}
        onClose={() => setShowBuyerBillModal(false)}
        onBillSaved={handleBillSaved}
        initialDate={selectedDate}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSaved={handlePaymentSaved}
        initialDate={selectedDate}
      />

      <SupplierBillingModal
        isOpen={showSupplierBillModal}
        onClose={() => setShowSupplierBillModal(false)}
        onBillSaved={handleSupplierBillSaved}
        initialDate={selectedDate}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onExpenseSaved={handleExpenseSaved}
        initialDate={selectedDate}
      />

      <BuyerPrintModal
        isOpen={Boolean(printBuyerBill)}
        onClose={() => setPrintBuyerBill(null)}
        bill={printBuyerBill}
      />

      <SupplierPrintModal
        isOpen={Boolean(printSupplierBill)}
        onClose={() => setPrintSupplierBill(null)}
        bill={printSupplierBill}
      />
    </div>
  );
};

export default Dashboard;
