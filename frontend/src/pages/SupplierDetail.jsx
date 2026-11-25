import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  Trash2, 
  Phone, 
  MapPin, 
  Calendar,
  Wallet
} from 'lucide-react';
import SupplierBillingModal from '../components/SupplierBillingModal';
import SupplierPrintModal from '../components/SupplierPrintModal';
import SupplierPaymentModal from '../components/SupplierPaymentModal';
import { formatDate, formatTime } from '../utils/dateUtils';

const SupplierDetail = ({ supplierId, onBack }) => {
  const { isAdmin } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [activeTab, setActiveTab] = useState('LEDGER'); // LEDGER, PURCHASES, PAYMENTS
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    if (supplierId) {
      fetchSupplierPurchases();
    }
  }, [supplierId, startDate, endDate]);

  const fetchSupplierPurchases = async () => {
    setLoading(true);
    try {
      let url = `/suppliers/${supplierId}/purchases`;
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.data.success) {
        setSupplier(res.data.supplier);
        setBills(res.data.bills || []);
        setPayments(res.data.payments || []);
        setLedger(res.data.ledger || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidBill = async (id) => {
    if (!window.confirm('Are you sure you want to void this supplier bill?')) return;
    try {
      const res = await api.post(`/supplier-bills/${id}/void`, { reason: 'Voided by Administrator' });
      if (res.data.success) {
        fetchSupplierPurchases();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void bill');
    }
  };

  const handleVoidPayment = async (id) => {
    if (!window.confirm('Are you sure you want to void this supplier payment?')) return;
    try {
      const res = await api.post(`/suppliers/payments/${id}/void`, { reason: 'Voided by Administrator' });
      if (res.data.success) {
        fetchSupplierPurchases();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void payment');
    }
  };

  if (loading && !supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-forest-700">
        <div className="w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold font-tamil text-slate-600">விவசாயி விபரம் ஏற்றுகிறது... (Loading Supplier Ledger...)</span>
      </div>
    );
  }

  if (!supplier) return <div className="p-8 text-center text-content-secondary">விவசாயி கிடைக்கவில்லை (Supplier not found)</div>;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
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
                {supplier.supplierCode}
              </span>
              <h1 className="text-lg font-bold text-content-main font-tamil">{supplier.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-secondary mt-1">
              {supplier.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-content-secondary" /> {supplier.phone}
                </span>
              )}
              {supplier.address && (
                <span className="flex items-center gap-1 font-tamil">
                  <MapPin className="w-3.5 h-3.5 text-content-secondary" /> {supplier.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="p-2.5 px-3.5 bg-surface-bg border border-surface-border rounded-lg text-right min-w-[140px]">
            <div className="text-[11px] text-content-secondary font-medium">Balance Payable (மீதி பாக்கி)</div>
            <div className="text-base font-bold text-content-main mt-0.5">
              ₹{(supplier.currentBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap active:scale-[0.98]"
            title="Record payment to this supplier"
          >
            <Wallet className="w-3.5 h-3.5 text-content-secondary" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Tab Switcher */}
      <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
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

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface-bg p-1 rounded-lg border border-surface-border">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-white text-forest-700 shadow-2xs'
                : 'text-content-secondary hover:text-content-main'
            }`}
          >
            கணக்கு விபரம் (Ledger) ({ledger.length})
          </button>
          <button
            onClick={() => setActiveTab('PURCHASES')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'PURCHASES'
                ? 'bg-white text-forest-700 shadow-2xs'
                : 'text-content-secondary hover:text-content-main'
            }`}
          >
            கொள்முதல் (Bills) ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'PAYMENTS'
                ? 'bg-white text-forest-700 shadow-2xs'
                : 'text-content-secondary hover:text-content-main'
            }`}
          >
            பட்டுவாடா (Payments) ({payments.length})
          </button>
        </div>
      </div>

      {/* Supplier Ledger / Transactions Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'LEDGER' && (
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4 text-right">Purchase (கொள்முதல்)</th>
                  <th className="py-3 px-4 text-right">Paid (கொடுத்தது)</th>
                  <th className="py-3 px-4 text-right">Balance (மீதி)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-content-secondary">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold">விவரங்கள் ஏற்றுகிறது... (Loading ledger...)</span>
                      </div>
                    </td>
                  </tr>
                ) : ledger.length > 0 ? (
                  ledger.map((item) => (
                    <tr key={item._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 text-content-secondary font-medium whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatTime(item)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.type === 'PURCHASE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-forest-50 text-forest-700 border border-forest-200/60">
                            Invoice #{item.billNumber}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                            Payment {item.paymentNumber ? `#${item.paymentNumber}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-tamil max-w-xs truncate" title={item.particulars}>
                        {item.particulars}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-content-main whitespace-nowrap">
                        {item.type === 'PURCHASE' ? `₹${item.purchaseAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-forest-600 whitespace-nowrap">
                        {item.paymentAmount > 0 ? `₹${item.paymentAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-content-main whitespace-nowrap">
                        <span className={item.runningBalance > 0 ? 'text-status-warning' : item.runningBalance < 0 ? 'text-blue-700' : 'text-forest-600'}>
                          ₹{item.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.type === 'PURCHASE' && (
                            <button
                              onClick={() => setPrintBill({
                                ...item.raw,
                                supplierId: item.raw?.supplierId || supplier,
                                supplierName: item.raw?.supplierId?.name || supplier?.name,
                                supplierPhone: item.raw?.supplierId?.phone || supplier?.phone,
                                supplierAddress: item.raw?.supplierId?.address || supplier?.address
                              })}
                              title="Print Supplier Bill Pad"
                              className="flex items-center gap-1 px-2.5 py-1 bg-forest-50 hover:bg-forest-100 text-forest-700 font-semibold rounded transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" /> Bill Pad
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => item.type === 'PURCHASE' ? handleVoidBill(item._id) : handleVoidPayment(item._id)}
                              title={item.type === 'PURCHASE' ? 'Void purchase bill' : 'Void payment record'}
                              className="p-1 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
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
                      No transactions recorded for this supplier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'PURCHASES' && (
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Particulars / Crates</th>
                  <th className="py-3 px-4 text-right">Gross Value</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Total (மொத்தம்)</th>
                  <th className="py-3 px-4 text-right">Paid (கொடுத்தது)</th>
                  <th className="py-3 px-4 text-right">Balance (மீதி)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {bills.length > 0 ? (
                  bills.map((b) => (
                    <tr key={b._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 font-bold text-content-main whitespace-nowrap">
                        #{b.billNumber}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatDate(b.transactionDate)}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatTime(b)}
                      </td>
                      <td className="py-3 px-4 font-tamil">
                        {b.items?.map((it, idx) => (
                          <div key={idx} className="text-content-main font-medium">
                            {it.description} — {it.quantity} crates @ ₹{it.rate} = ₹{it.amount}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-content-main whitespace-nowrap">
                        ₹{b.grossTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-status-danger whitespace-nowrap">
                        - ₹{(b.totalDeductions || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-forest-700 whitespace-nowrap">
                        ₹{(b.totalPayable !== undefined ? b.totalPayable : b.netPayable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
                        ₹{(b.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        <span className={
                          (b.remainingBalance !== undefined ? b.remainingBalance : b.newBalance) > 0
                            ? 'text-red-600'
                            : (b.remainingBalance !== undefined ? b.remainingBalance : b.newBalance) < 0
                            ? 'text-blue-700'
                            : 'text-forest-700'
                        }>
                          ₹{(b.remainingBalance !== undefined ? b.remainingBalance : (b.newBalance || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintBill({
                              ...b,
                              supplierId: b.supplierId || supplier,
                              supplierName: b.supplierId?.name || supplier?.name,
                              supplierPhone: b.supplierId?.phone || supplier?.phone,
                              supplierAddress: b.supplierId?.address || supplier?.address
                            })}
                            title="Print Supplier Bill Pad"
                            className="flex items-center gap-1 px-2.5 py-1 bg-forest-50 hover:bg-forest-100 text-forest-700 font-semibold rounded"
                          >
                            <Printer className="w-3.5 h-3.5" /> Bill Pad
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleVoidBill(b._id)}
                              title="Void bill"
                              className="p-1 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
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
                    <td colSpan={10} className="text-center py-8 text-content-secondary">
                      No supplier purchase bills recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'PAYMENTS' && (
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Notes / Remarks</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance After Payment</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-surface-hover">
                      <td className="py-3 px-4 font-bold text-content-main whitespace-nowrap">
                        {p.paymentNumber || '—'}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {formatTime(p)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-content-main">
                        {p.paymentMode || 'CASH'}
                      </td>
                      <td className="py-3 px-4 font-tamil">
                        {p.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-forest-600 whitespace-nowrap">
                        ₹{(p.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-content-main whitespace-nowrap">
                        ₹{(p.newBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isAdmin && (
                          <button
                            onClick={() => handleVoidPayment(p._id)}
                            title="Void payment"
                            className="p-1 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors"
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
                      No standalone supplier payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <SupplierBillingModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        onBillSaved={(bill, shouldPrint) => {
          fetchSupplierPurchases();
          setShowBillModal(false);
          if (shouldPrint) {
            setPrintBill({
              ...bill,
              supplierId: bill.supplierId || supplier,
              supplierName: bill.supplierId?.name || supplier?.name,
              supplierPhone: bill.supplierId?.phone || supplier?.phone
            });
          }
        }}
        defaultSupplierId={supplier?._id}
      />

      <SupplierPrintModal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        bill={printBill}
        supplier={supplier}
      />

      {showPayModal && (
        <SupplierPaymentModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          onPaymentSaved={() => {
            fetchSupplierPurchases();
            setShowPayModal(false);
          }}
          defaultSupplierId={supplier?._id}
        />
      )}
    </div>
  );
};

export default SupplierDetail;
