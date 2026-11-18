import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/api';
import { useSettings } from '../context/SettingsContext';
import { Plus, Trash2, Printer, Save, UserPlus } from 'lucide-react';

const SupplierBillingModal = ({ isOpen, onClose, onBillSaved, initialDate, defaultSupplierId }) => {
  const { settings, fetchSettings } = useSettings();
  const commissionRate = typeof settings?.defaultCommissionRate === 'number' ? settings.defaultCommissionRate : 10;
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(defaultSupplierId || '');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  // Dynamic Item Rows (Rate, Description, Quantity, Amount)
  const [items, setItems] = useState([
    {
      description: 'தக்காளி பெரிய பெட்டி',
      rate: '',
      bigBoxes: '',
      smallBoxes: '',
      quantity: '',
      amount: 0,
    },
  ]);

  // Mandi Deductions
  const [deductions, setDeductions] = useState({
    commission: 0,
    gate: 0,
    coolie: 0,
    rent: 0,
    debit: 0,
  });

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Supplier Inline
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (typeof fetchSettings === 'function') {
        fetchSettings();
      }
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
        setSuppliers(res.data.suppliers);
        if (defaultSupplierId) setSelectedSupplierId(defaultSupplierId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const bBoxes = Number(field === 'bigBoxes' ? value : item.bigBoxes) || 0;
    const sBoxes = Number(field === 'smallBoxes' ? value : item.smallBoxes) || 0;
    const rate = Number(field === 'rate' ? value : item.rate) || 0;

    let qty = Number(item.quantity) || 0;
    if (bBoxes > 0 || sBoxes > 0) {
      const eqv = Math.round((bBoxes + sBoxes / 2 + Number.EPSILON) * 10) / 10;
      qty = eqv;
      item.quantity = eqv;
      item.bigBoxes = bBoxes;
      item.smallBoxes = sBoxes;
      item.bigEquivalent = eqv;
    }

    if (field === 'quantity') {
      qty = Number(value) || 0;
      item.quantity = qty;
    }

    item.amount = Math.round(qty * rate);
    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        description: 'தக்காளி',
        rate: '',
        bigBoxes: '',
        smallBoxes: '',
        quantity: '',
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const grossTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Dynamic commission calculated from Business Profile Settings
  useEffect(() => {
    setDeductions((prev) => ({
      ...prev,
      commission: Math.round(grossTotal * (commissionRate / 100)),
    }));
  }, [grossTotal, commissionRate]);

  const totalDeductions =
    (Number(deductions.commission) || 0) +
    (Number(deductions.gate) || 0) +
    (Number(deductions.coolie) || 0) +
    (Number(deductions.rent) || 0) +
    (Number(deductions.debit) || 0);

  const netPayable = Math.max(0, grossTotal - totalDeductions);

  const handleSubmit = async (shouldPrint = false) => {
    if (!selectedSupplierId) {
      setError('Please select a farmer / supplier.');
      return;
    }
    if (grossTotal <= 0) {
      setError('Please enter at least one crate purchase entry.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        supplierId: selectedSupplierId,
        transactionDate: date,
        items,
        deductions,
        notes,
      };

      const res = await api.post('/supplier-bills', payload);
      if (res.data.success) {
        onBillSaved(res.data.bill, shouldPrint);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier bill');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    try {
      const res = await api.post('/suppliers', {
        name: newSupplierName.trim(),
        phone: newSupplierPhone.trim(),
        initialBalance: 0,
      });
      if (res.data.success) {
        await fetchSuppliers();
        setSelectedSupplierId(res.data.supplier._id);
        setShowAddSupplier(false);
        setNewSupplierName('');
        setNewSupplierPhone('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add supplier');
    }
  };

  const handleClose = () => {
    setSelectedSupplierId('');
    setItems([
      {
        description: 'தக்காளி பெரிய பெட்டி',
        rate: '',
        bigBoxes: '',
        smallBoxes: '',
        quantity: '',
        amount: 0,
      },
    ]);
    setDeductions({ commission: 0, gate: 0, coolie: 0, rent: 0, debit: 0 });
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Supplier Purchase & Bill Pad"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-xs text-content-main">
        {error && (
          <div className="p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-medium">
            {error}
          </div>
        )}

        {/* Supplier Selection & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-content-main">
                Farmer / Supplier <span className="text-status-danger">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddSupplier(!showAddSupplier)}
                className="text-[11px] text-forest-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" /> + New Farmer
              </button>
            </div>

            {showAddSupplier ? (
              <div className="p-2.5 bg-surface-bg rounded-lg border border-surface-border space-y-2 mb-2">
                <input
                  type="text"
                  placeholder="Farmer Name"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-surface-border"
                />
                <input
                  type="text"
                  placeholder="Phone Number (optional)"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-surface-border"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateSupplier}
                    className="px-3 py-1 bg-forest-600 text-white font-semibold rounded text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSupplier(false)}
                    className="px-2 py-1 bg-surface-hover text-content-secondary rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600 font-tamil"
              >
                <option value="">-- Select Farmer / Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''} — Due: ₹{s.currentBalance}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Billing Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
            />
          </div>
        </div>

        {/* Bill Pad Items Table */}
        <div className="border border-surface-border rounded-xl overflow-hidden shadow-subtle bg-white">
          <div className="bg-surface-bg px-4 py-2 border-b border-surface-border flex justify-between items-center">
            <span className="font-semibold text-content-main">
              Lot Items (விலை, விவரம், எண்ணம், மொத்தம்)
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1 text-[11px] font-semibold bg-white border border-surface-border text-content-main px-2.5 py-1 rounded hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-3 h-3 text-forest-600" /> Add Row
            </button>
          </div>

          <div className="p-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-border text-content-secondary font-semibold">
                  <th className="p-2 w-24 text-center">Rate (₹)</th>
                  <th className="p-2">Description / Crates</th>
                  <th className="p-2 w-28 text-center">Quantity (Eqv)</th>
                  <th className="p-2 w-32 text-right">Total Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-surface-border hover:bg-surface-hover/50">
                    <td className="p-1">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-surface-bg focus:outline-none focus:border-forest-600"
                      />
                    </td>
                    <td className="p-1 font-tamil">
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full p-1.5 text-xs border border-surface-border rounded bg-surface-bg focus:outline-none focus:border-forest-600"
                        />
                        <div className="flex gap-2 text-[11px] text-content-secondary">
                          <input
                            type="number"
                            placeholder="Big (பெ)"
                            value={item.bigBoxes}
                            onChange={(e) => handleItemChange(idx, 'bigBoxes', e.target.value)}
                            className="w-20 p-1 border rounded text-center bg-white"
                          />
                          <input
                            type="number"
                            placeholder="Small (சி)"
                            value={item.smallBoxes}
                            onChange={(e) => handleItemChange(idx, 'smallBoxes', e.target.value)}
                            className="w-20 p-1 border rounded text-center bg-white"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-surface-bg focus:outline-none focus:border-forest-600"
                      />
                    </td>
                    <td className="p-1 text-right font-bold text-content-main pr-2">
                      ₹{(item.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-content-secondary hover:text-status-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-bg px-4 py-2 border-t border-surface-border flex justify-between font-bold text-xs text-content-main">
            <span>Gross Total Value:</span>
            <span className="text-forest-700 text-sm">₹{grossTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Mandi Deductions Section */}
        <div className="bg-surface-bg p-4 rounded-xl border border-surface-border">
          <div className="text-xs font-semibold text-content-main mb-2.5 flex justify-between">
            <span>Mandi Deductions (பிடித்தங்கள்)</span>
            <span className="text-content-secondary font-medium">Total Deductions: ₹{totalDeductions.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                Commission ({commissionRate}%)
              </label>
              <input
                type="number"
                value={deductions.commission}
                onChange={(e) => setDeductions({ ...deductions, commission: e.target.value })}
                className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1">Gate Pass</label>
              <input
                type="number"
                value={deductions.gate}
                onChange={(e) => setDeductions({ ...deductions, gate: e.target.value })}
                className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1">Coolie</label>
              <input
                type="number"
                value={deductions.coolie}
                onChange={(e) => setDeductions({ ...deductions, coolie: e.target.value })}
                className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1">Rent / Freight</label>
              <input
                type="number"
                value={deductions.rent}
                onChange={(e) => setDeductions({ ...deductions, rent: e.target.value })}
                className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                Advance Debit
              </label>
              <input
                type="number"
                value={deductions.debit}
                onChange={(e) => setDeductions({ ...deductions, debit: e.target.value })}
                className="w-full p-1.5 text-center font-bold text-xs border border-surface-border rounded bg-white"
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-surface-border flex justify-between items-center">
            <span className="text-xs font-semibold text-content-main">Net Payable to Farmer:</span>
            <span className="text-base font-bold text-forest-700">₹{netPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Memo */}
        <div>
          <label className="block font-semibold text-content-main mb-1">Notes / Lot Remarks</label>
          <input
            type="text"
            placeholder="e.g. Morning lot, village intake..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-bg focus:outline-none focus:border-forest-600"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-surface-border">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-surface-border bg-white hover:bg-surface-hover text-content-main font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Only</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save & Print Bill Pad</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SupplierBillingModal;
