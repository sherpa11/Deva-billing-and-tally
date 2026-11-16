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
  Calendar 
} from 'lucide-react';
import SupplierBillingModal from '../components/SupplierBillingModal';
import SupplierPrintModal from '../components/SupplierPrintModal';

const SupplierDetail = ({ supplierId, onBack }) => {
  const { isAdmin } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [bills, setBills] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBillModal, setShowBillModal] = useState(false);
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
        setBills(res.data.bills);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  if (!supplier) return <div className="p-8 text-center text-content-secondary">Loading supplier details...</div>;

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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 px-3.5 bg-surface-bg border border-surface-border rounded-lg text-right min-w-[140px]">
            <div className="text-[11px] text-content-secondary font-medium">Balance Payable</div>
            <div className="text-base font-bold text-content-main mt-0.5">
              ₹{(supplier.currentBalance || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Date Filter */}
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
        </div>
        <div className="text-content-secondary font-medium">{bills.length} bills</div>
      </div>

      {/* Supplier Bills Table */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-bg text-content-secondary font-semibold border-b border-surface-border">
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Particulars / Crates</th>
                <th className="py-3 px-4 text-right">Gross Value</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {bills.length > 0 ? (
                bills.map((b) => (
                  <tr key={b._id} className="hover:bg-surface-hover">
                    <td className="py-3 px-4 font-bold text-content-main">
                      #{b.billNumber}
                    </td>
                    <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                      {formatDate(b.transactionDate)}
                    </td>
                    <td className="py-3 px-4 font-tamil">
                      {b.items?.map((it, idx) => (
                        <div key={idx} className="text-content-main font-medium">
                          {it.description} — {it.quantity} crates @ ₹{it.rate} = ₹{it.amount}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-content-main">
                      ₹{b.grossTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-status-danger">
                      - ₹{(b.totalDeductions || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-forest-600">
                      ₹{b.netPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintBill(b)}
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
                  <td colSpan={7} className="text-center py-8 text-content-secondary">
                    No supplier purchase bills recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SupplierBillingModal
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
        onBillSaved={(bill, shouldPrint) => {
          fetchSupplierPurchases();
          setShowBillModal(false);
          if (shouldPrint) setPrintBill(bill);
        }}
      />

      <SupplierPrintModal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />
    </div>
  );
};

export default SupplierDetail;
