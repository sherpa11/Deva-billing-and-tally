import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  Wallet, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText 
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import BuyerBillingModal from '../components/BuyerBillingModal';
import BuyerPrintModal from '../components/BuyerPrintModal';
import StatementPrintModal from '../components/StatementPrintModal';

const BuyerDetail = ({ buyerId, onBack }) => {
  const { isAdmin } = useAuth();
  const [buyer, setBuyer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [printBill, setPrintBill] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

  useEffect(() => {
    if (buyerId) {
      fetchBuyerLedger();
    }
  }, [buyerId, startDate, endDate]);

  const fetchBuyerLedger = async () => {
    setLoading(true);
    try {
      let url = `/buyers/${buyerId}/ledger`;
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.data.success) {
        setBuyer(res.data.buyer);
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to void this transaction?')) return;
    try {
      const res = await api.post(`/transactions/${id}/void`, { reason: 'Voided by Administrator' });
      if (res.data.success) {
        fetchBuyerLedger();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void transaction');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  if (!buyer) return <div className="p-8 text-center text-content-secondary">Loading account details...</div>;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-surface-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-surface-bg hover:bg-surface-hover text-content-main rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">
                {buyer.buyerCode}
              </span>
              <h1 className="text-lg font-bold text-content-main font-tamil">{buyer.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-secondary mt-1">
              {buyer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-content-secondary" /> {buyer.phone}
                </span>
              )}
              {buyer.address && (
                <span className="flex items-center gap-1 font-tamil">
                  <MapPin className="w-3.5 h-3.5 text-content-secondary" /> {buyer.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Balance Card & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="p-2.5 px-3.5 bg-surface-bg border border-surface-border rounded-lg text-right min-w-[140px]">
            <div className="text-[11px] text-content-secondary font-medium">Current Balance</div>
            <div
              className={`text-base font-bold mt-0.5 ${
                buyer.currentBalance > 0
                  ? 'text-status-warning'
                  : buyer.currentBalance < 0
                  ? 'text-forest-600'
                  : 'text-content-main'
              }`}
            >
              {buyer.currentBalance > 0
                ? `₹${buyer.currentBalance.toLocaleString('en-IN')} Due`
                : buyer.currentBalance < 0
                ? `₹${Math.abs(buyer.currentBalance).toLocaleString('en-IN')} Adv`
                : 'Settled'}
            </div>
          </div>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </button>

          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Wallet className="w-3.5 h-3.5 text-content-secondary" />
            <span>Payment</span>
          </button>

          <button
            onClick={() => setShowStatementModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-content-secondary" />
            <span>Statement</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-content-secondary" />
          <span className="font-medium text-content-secondary">Date Filter:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1.5 border border-surface-border rounded-lg text-xs bg-surface-bg"
          />
          <span className="text-content-secondary">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-1.5 border border-surface-border rounded-lg text-xs bg-surface-bg"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-status-danger font-medium hover:underline ml-1"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-content-secondary font-medium">{transactions.length} transactions</div>
      </div>

      {/* Chronological Ledger Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Particulars</th>
                <th className="py-3 px-4 text-center">Crates</th>
                <th className="py-3 px-4 text-right">Rate (₹)</th>
                <th className="py-3 px-4 text-right">Bill Amount</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-surface-hover">
                    <td className="py-3 px-4 text-content-secondary font-medium whitespace-nowrap">
                      {formatDate(t.transactionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-content-main">
                        {t.type === 'SALE' ? `Invoice #${t.billNumber}` : 'Payment Received'}
                      </div>
                      {t.notes && <div className="text-[11px] text-content-secondary">{t.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-center text-content-secondary">
                      {t.type === 'SALE'
                        ? `${t.bigBoxes}B / ${t.smallBoxes}S (${t.bigEquivalent} Eqv)`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-content-main font-medium">
                      {t.type === 'SALE' ? `₹${t.ratePerBigBox}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-content-main">
                      {t.type === 'SALE' ? `₹${t.billAmount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-forest-600">
                      {t.amountPaid > 0 ? `₹${t.amountPaid.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-content-main">
                      ₹{t.newBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {t.type === 'SALE' && (
                          <button
                            onClick={() => setPrintBill({
                              ...t,
                              buyerId: (t.buyerId && typeof t.buyerId === 'object') ? t.buyerId : buyer,
                              buyerName: (typeof t.buyerId === 'object' && t.buyerId?.name) || buyer?.name || t.buyerName,
                              buyerPhone: (typeof t.buyerId === 'object' && t.buyerId?.phone) || buyer?.phone || t.buyerPhone,
                              buyerAddress: (typeof t.buyerId === 'object' && t.buyerId?.address) || buyer?.address || t.buyerAddress
                            })}
                            title="Print Tamil Bill"
                            className="p-1.5 text-content-secondary hover:text-forest-600 hover:bg-forest-50 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleVoidTransaction(t._id)}
                            title="Void record"
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
                  <td colSpan={8} className="text-center py-8 text-content-secondary">
                    No transactions found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaymentSaved={() => {
          fetchBuyerLedger();
          setShowPayModal(false);
        }}
        defaultBuyerId={buyer._id}
      />

      <BuyerBillingModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        onBillSaved={(bill, shouldPrint) => {
          fetchBuyerLedger();
          setShowBillModal(false);
          if (shouldPrint) {
            setPrintBill({
              ...bill,
              buyerId: (bill.buyerId && typeof bill.buyerId === 'object') ? bill.buyerId : buyer,
              buyerName: (typeof bill.buyerId === 'object' && bill.buyerId?.name) || buyer?.name || bill.buyerName,
              buyerPhone: (typeof bill.buyerId === 'object' && bill.buyerId?.phone) || buyer?.phone || bill.buyerPhone,
              buyerAddress: (typeof bill.buyerId === 'object' && bill.buyerId?.address) || buyer?.address || bill.buyerAddress
            });
          }
        }}
        defaultBuyerId={buyer?._id}
      />

      <BuyerPrintModal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        bill={printBill}
        buyer={buyer}
      />

      <StatementPrintModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        buyer={buyer}
        transactions={transactions}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default BuyerDetail;
