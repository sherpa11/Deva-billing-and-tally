import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Printer, Trash2 } from 'lucide-react';
import BuyerPrintModal from '../components/BuyerPrintModal';
import SupplierPrintModal from '../components/SupplierPrintModal';

const History = ({ selectedDate }) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('SALES'); // SALES, PAYMENTS, PURCHASES
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Print Modals
  const [printBuyerBill, setPrintBuyerBill] = useState(null);
  const [printSupplierBill, setPrintSupplierBill] = useState(null);

  useEffect(() => {
    fetchHistoryData();
  }, [date]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const [salesRes, paymentsRes, purchasesRes] = await Promise.all([
        api.get(`/transactions?date=${date}&type=SALE`),
        api.get(`/transactions?date=${date}&type=PAYMENT`),
        isAdmin ? api.get(`/supplier-bills?date=${date}`) : Promise.resolve({ data: { bills: [] } }),
      ]);

      if (salesRes.data.success) setSales(salesRes.data.transactions);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.transactions);
      if (purchasesRes.data?.success) setPurchases(purchasesRes.data.bills);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidTxn = async (id) => {
    if (!window.confirm('Are you sure you want to void this transaction?')) return;
    try {
      const res = await api.post(`/transactions/${id}/void`, { reason: 'Voided by Administrator' });
      if (res.data.success) {
        fetchHistoryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void transaction');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border shadow-subtle">
        <div>
          <h1 className="text-xl font-bold text-content-main tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Audit register of all sales invoices, payments, and supplier purchases
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-content-secondary" />
          <span className="font-medium text-content-secondary">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-1.5 border border-surface-border rounded-lg bg-surface-bg text-xs font-medium"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-surface-border pb-2">
        <button
          onClick={() => setActiveTab('SALES')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'SALES'
              ? 'bg-forest-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-surface-border text-content-secondary hover:text-content-main'
          }`}
        >
          Buyer Sales ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'PAYMENTS'
              ? 'bg-forest-600 text-white font-semibold shadow-xs'
              : 'bg-white border border-surface-border text-content-secondary hover:text-content-main'
          }`}
        >
          Payments Received ({payments.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('PURCHASES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'PURCHASES'
                ? 'bg-forest-600 text-white font-semibold shadow-xs'
                : 'bg-white border border-surface-border text-content-secondary hover:text-content-main'
            }`}
          >
            Supplier Purchases ({purchases.length})
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'SALES' && (
            <table className="w-full text-left border-collapse text-xs min-w-[750px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Crates</th>
                  <th className="py-3 px-4 text-right">Rate (₹)</th>
                  <th className="py-3 px-4 text-right">Bill Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">New Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {sales.length > 0 ? (
                  sales.map((s) => (
                    <tr key={s._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">{formatTime(s.transactionDate)}</td>
                      <td className="py-3 px-4 font-bold text-content-main">#{s.billNumber}</td>
                      <td className="py-3 px-4 font-semibold text-content-main font-tamil">{s.buyerId?.name || '—'}</td>
                      <td className="py-3 px-4 text-center text-content-secondary">
                        {s.bigBoxes}B / {s.smallBoxes}S ({s.bigEquivalent} Eqv)
                      </td>
                      <td className="py-3 px-4 text-right text-content-main font-medium">₹{s.ratePerBigBox}</td>
                      <td className="py-3 px-4 text-right font-bold text-content-main">₹{s.billAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-semibold text-forest-600">₹{s.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-content-main">₹{s.newBalance.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setPrintBuyerBill(s)}
                            title="Print Tamil Bill"
                            className="p-1.5 text-content-secondary hover:text-forest-600 hover:bg-forest-50 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleVoidTxn(s._id)}
                              title="Void invoice"
                              className="p-1.5 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-content-secondary">
                      No sales records for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'PAYMENTS' && (
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Previous Due</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                  <th className="py-3 px-4 text-right">New Balance</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">{formatTime(p.transactionDate)}</td>
                      <td className="py-3 px-4 font-semibold text-content-main font-tamil">{p.buyerId?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-surface-bg text-content-main px-2 py-0.5 rounded text-[11px] font-medium border border-surface-border">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-content-secondary font-tamil">{p.notes || '—'}</td>
                      <td className="py-3 px-4 text-right font-medium text-content-secondary">₹{p.oldBalance.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-forest-600">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-content-main">₹{p.newBalance.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isAdmin && (
                          <button
                            onClick={() => handleVoidTxn(p._id)}
                            title="Void receipt"
                            className="p-1.5 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-content-secondary">
                      No payment records for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'PURCHASES' && (
            <table className="w-full text-left border-collapse text-xs min-w-[720px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {purchases.length > 0 ? (
                  purchases.map((pc) => (
                    <tr key={pc._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">{formatTime(pc.transactionDate)}</td>
                      <td className="py-3 px-4 font-bold text-content-main">#{pc.billNumber}</td>
                      <td className="py-3 px-4 font-semibold text-content-main font-tamil">{pc.supplierId?.name || '—'}</td>
                      <td className="py-3 px-4 font-tamil">
                        {pc.items?.map((it, idx) => (
                          <span key={idx} className="mr-2">
                            {it.description} ({it.quantity} @ ₹{it.rate})
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-content-main">₹{pc.grossTotal.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-medium text-status-danger">- ₹{pc.totalDeductions.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-forest-600">₹{pc.netPayable.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setPrintSupplierBill(pc)}
                          className="flex items-center gap-1 mx-auto px-2.5 py-1 bg-forest-50 hover:bg-forest-100 text-forest-700 font-semibold rounded"
                        >
                          <Printer className="w-3.5 h-3.5" /> Bill Pad
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-content-secondary">
                      No purchase records for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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

export default History;
