import React, { useState, useEffect } from 'react';
import api from '../api/api';
import SearchableBuyerSelect from './SearchableBuyerSelect';
import { Calculator, Save, Printer, Plus, Trash2, X, AlertCircle, UserPlus, Edit3 } from 'lucide-react';

const BuyerBillingModal = ({ isOpen, onClose, onBillSaved, initialDate, defaultBuyerId }) => {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(defaultBuyerId || '');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [oldBalance, setOldBalance] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Multi-row crate lines state
  const [rows, setRows] = useState([
    { id: 1, bigBoxes: '', smallBoxes: '', ratePerBigBox: '' }
  ]);

  // Inline Quick Add/Edit Customer modal state
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [custLoading, setCustLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBuyers();
      if (initialDate) setDate(initialDate);
      if (defaultBuyerId) setSelectedBuyerId(defaultBuyerId);
      setError('');
    } else {
      resetForm();
    }
  }, [isOpen, initialDate, defaultBuyerId]);

  const fetchBuyers = async () => {
    try {
      const res = await api.get('/buyers?status=active');
      if (res.data.success) {
        setBuyers(res.data.buyers);
        if (defaultBuyerId) {
          const match = res.data.buyers.find((b) => b._id === defaultBuyerId);
          if (match) setOldBalance(String(match.currentBalance || 0));
        }
      }
    } catch (err) {
      console.error('Failed to fetch buyers', err);
    }
  };

  const selectedBuyer = buyers.find((b) => b._id === selectedBuyerId) || null;

  const handleBuyerChange = (buyerId) => {
    setSelectedBuyerId(buyerId);
    const buyer = buyers.find((b) => b._id === buyerId);
    if (buyer) {
      setOldBalance(String(buyer.currentBalance || 0));
    } else {
      setOldBalance('');
    }
  };

  const handleResetOldBalance = () => {
    if (selectedBuyer) {
      setOldBalance(String(selectedBuyer.currentBalance || 0));
    }
  };

  // Row operations
  const handleAddRow = () => {
    // Inherit the rate from the previous row if available for speed
    const lastRow = rows[rows.length - 1];
    const inheritedRate = lastRow ? lastRow.ratePerBigBox : '';
    setRows([
      ...rows,
      { id: Date.now(), bigBoxes: '', smallBoxes: '', ratePerBigBox: inheritedRate }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  // Calculations per row
  const calcRowEqv = (row) => {
    const b = Number(row.bigBoxes) || 0;
    const s = Number(row.smallBoxes) || 0;
    return Math.round((b + (s / 2) + Number.EPSILON) * 10) / 10;
  };

  const calcRowAmt = (row) => {
    const eq = calcRowEqv(row);
    const r = Number(row.ratePerBigBox) || 0;
    return Math.round(eq * r);
  };

  // Totals across all rows
  const totalBig = rows.reduce((acc, r) => acc + (Number(r.bigBoxes) || 0), 0);
  const totalSmall = rows.reduce((acc, r) => acc + (Number(r.smallBoxes) || 0), 0);
  const totalBigEquivalent = Math.round((totalBig + (totalSmall / 2) + Number.EPSILON) * 10) / 10;
  const currentBillAmount = rows.reduce((acc, r) => acc + calcRowAmt(r), 0);

  const numOld = Number(oldBalance) || 0;
  const totalDue = Math.round((currentBillAmount + numOld) * 100) / 100;
  const numPaid = Number(amountPaid) || 0;
  const newBalance = Math.round((totalDue - numPaid) * 100) / 100;

  const handleQuickPay = (preset) => {
    if (preset === 'FULL') {
      setAmountPaid(totalDue > 0 ? String(totalDue) : '0');
    } else if (preset === 'BILL') {
      setAmountPaid(currentBillAmount > 0 ? String(currentBillAmount) : '0');
    } else if (preset === 'ZERO') {
      setAmountPaid('0');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    setCustLoading(true);
    try {
      const res = await api.post('/buyers', {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        initialBalance: 0
      });
      if (res.data.success) {
        await fetchBuyers();
        setSelectedBuyerId(res.data.buyer._id);
        setOldBalance('0');
        setShowAddCustomer(false);
        setNewCustName('');
        setNewCustPhone('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setCustLoading(false);
    }
  };

  const handleSubmit = async (shouldPrint = false) => {
    if (!selectedBuyerId) {
      setError('Please select a Buyer / Customer.');
      return;
    }
    if (totalBig === 0 && totalSmall === 0) {
      setError('Please enter at least one Big or Small crate.');
      return;
    }
    const hasZeroRate = rows.some((r) => {
      const b = Number(r.bigBoxes) || 0;
      const s = Number(r.smallBoxes) || 0;
      const rate = Number(r.ratePerBigBox) || 0;
      return (b > 0 || s > 0) && rate <= 0;
    });
    if (hasZeroRate) {
      setError('Please enter a valid selling rate (₹) for all crate rows.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const itemsPayload = rows.map((r) => {
        const b = Number(r.bigBoxes) || 0;
        const s = Number(r.smallBoxes) || 0;
        const eq = Math.round((b + (s / 2) + Number.EPSILON) * 10) / 10;
        const rate = Number(r.ratePerBigBox) || 0;
        return {
          bigBoxes: b,
          smallBoxes: s,
          bigEquivalent: eq,
          ratePerBigBox: rate,
          amount: Math.round(eq * rate)
        };
      });

      const payload = {
        buyerId: selectedBuyerId,
        transactionDate: date,
        bigBoxes: totalBig,
        smallBoxes: totalSmall,
        bigEquivalent: totalBigEquivalent,
        ratePerBigBox: rows[0] ? Number(rows[0].ratePerBigBox) || 0 : 0,
        items: itemsPayload,
        manualOldBalance: numOld,
        amountPaid: numPaid,
        notes: notes.trim()
      };

      const res = await api.post('/transactions/sale', payload);
      if (res.data.success) {
        onBillSaved(res.data.bill, shouldPrint);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save billing transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBuyerId('');
    setRows([{ id: 1, bigBoxes: '', smallBoxes: '', ratePerBigBox: '' }]);
    setOldBalance('');
    setAmountPaid('');
    setNotes('');
    setError('');
    setShowAddCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[96vh] sm:max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-forest-50 text-forest-700 rounded-xl flex items-center justify-center border border-forest-100 shrink-0">
              <Calculator className="w-5 h-5 text-forest-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Create Buyer Bill & Tally</h3>
              <p className="text-xs text-slate-500 font-medium">Automatic box conversion & balance tally</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="mt-5 space-y-4">
          
          {/* Buyer / Customer & Billing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Buyer / Customer</label>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  className="text-[11px] text-forest-700 hover:text-forest-900 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  title="Add or quick edit customer"
                >
                  <UserPlus className="w-3 h-3" /> + New Customer
                </button>
              </div>

              {/* Inline Quick Add Customer */}
              {showAddCustomer ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mb-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (optional)"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={custLoading}
                      onClick={handleCreateCustomer}
                      className="px-3 py-1 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-lg text-xs"
                    >
                      {custLoading ? 'Adding...' : 'Save Customer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomer(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <SearchableBuyerSelect
                  value={selectedBuyerId}
                  onChange={handleBuyerChange}
                  onBuyerSelected={(buyer) => setOldBalance(String(buyer.currentBalance || 0))}
                  placeholder="Select Buyer / Customer..."
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Billing Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 text-sm font-bold border border-slate-300 rounded-xl px-3 focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Old Balance / Previous Due */}
          <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/90">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Old Balance / Previous Due</span>
              </label>
              {selectedBuyer && (
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <span>Ledger:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      selectedBuyer.currentBalance > 0
                        ? 'bg-amber-100 text-amber-800'
                        : selectedBuyer.currentBalance < 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ₹{Math.abs(selectedBuyer.currentBalance || 0).toLocaleString('en-IN')}{' '}
                    {selectedBuyer.currentBalance > 0 ? 'Due' : selectedBuyer.currentBalance < 0 ? 'Adv' : 'Settled'}
                  </span>
                  {selectedBuyer.currentBalance !== undefined &&
                    Number(oldBalance) !== Number(selectedBuyer.currentBalance) && (
                      <button
                        type="button"
                        onClick={handleResetOldBalance}
                        className="text-[11px] text-blue-600 hover:text-blue-800 underline font-bold cursor-pointer ml-1"
                        title="Reset to current ledger balance"
                      >
                        Reset
                      </button>
                    )}
                </div>
              )}
            </div>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="0"
                value={oldBalance}
                onChange={(e) => setOldBalance(e.target.value)}
                disabled={!selectedBuyerId}
                className="w-full h-11 text-base font-black font-mono border border-slate-300 rounded-xl pl-9 pr-3.5 bg-white text-slate-900 focus:ring-2 focus:ring-forest-600 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Pre-filled from customer ledger. You can manually enter or change the old due for this bill.
            </p>
          </div>

          {/* Dynamic Crate Rows with "+ Add Row" */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Tomato Crates & Rate {rows.length > 1 && `(${rows.length} Rows)`}
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-bold text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Row
              </button>
            </div>

            {rows.map((row, index) => {
              const eqv = calcRowEqv(row);
              const amt = calcRowAmt(row);
              return (
                <div
                  key={row.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    rows.length > 1
                      ? 'bg-slate-50/70 border-slate-200/90 space-y-2.5'
                      : 'bg-transparent border-transparent p-0 space-y-3'
                  }`}
                >
                  {rows.length > 1 && (
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-1.5 border-b border-slate-200">
                      <span>Row #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Remove this row"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}

                  {/* Big Boxes & Small Boxes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Big Boxes <span className="text-slate-500 font-normal">(1 Big = 1)</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={row.bigBoxes}
                        onChange={(e) => handleRowChange(index, 'bigBoxes', e.target.value)}
                        className="w-full h-11 text-base font-black font-mono border border-slate-300 rounded-xl px-3.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Small Boxes <span className="text-slate-500 font-normal">(2 Small = 1 Big)</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={row.smallBoxes}
                        onChange={(e) => handleRowChange(index, 'smallBoxes', e.target.value)}
                        className="w-full h-11 text-base font-black font-mono border border-slate-300 rounded-xl px-3.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Selling Rate per Big Box (₹) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Selling Rate per Big Box (₹)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        placeholder="e.g. 650"
                        value={row.ratePerBigBox}
                        onChange={(e) => handleRowChange(index, 'ratePerBigBox', e.target.value)}
                        required
                        className="w-full h-11 text-base font-black font-mono border border-slate-300 rounded-xl px-3.5 focus:ring-2 focus:ring-forest-600 focus:outline-none text-forest-700"
                      />
                    </div>

                    {/* Row Crate Summary Indicator */}
                    <div className="flex items-end pb-1 text-xs">
                      <div className="w-full bg-forest-50/70 border border-forest-100 rounded-xl p-2.5 flex items-center justify-between text-forest-900 font-medium">
                        <span>Row Eqv: <strong className="font-mono font-bold">{eqv} Big</strong></span>
                        <span>Amount: <strong className="font-mono font-black text-forest-700">₹{amt.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amount Paid (₹) & Quick Pay Options */}
          <div className="pt-1">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Amount Paid (₹)</label>
              <span className="text-[11px] text-slate-500 font-medium">(0 allowed)</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full h-11 text-base font-black font-mono border border-slate-300 rounded-xl px-3.5 focus:ring-2 focus:ring-forest-600 focus:outline-none text-emerald-700"
            />
          </div>

          {/* Quick Pay Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickPay('FULL')}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
            >
              Pay Full Due (₹{totalDue > 0 ? totalDue.toLocaleString('en-IN') : '0'})
            </button>
            <button
              type="button"
              onClick={() => handleQuickPay('BILL')}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-2xs"
            >
              Pay Today's Bill (₹{currentBillAmount.toLocaleString('en-IN')})
            </button>
            <button
              type="button"
              onClick={() => handleQuickPay('ZERO')}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              Pay ₹0 (Credit)
            </button>
          </div>

          {/* AUTOMATIC TALLY CALCULATION Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <Calculator className="w-4 h-4 text-forest-600" />
              <span>Automatic Tally Calculation</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 font-medium py-0.5">
              <span>Today's Box Equivalent:</span>
              <span className="font-bold text-slate-900 font-mono">
                {totalBigEquivalent} Big Eqv {totalBig > 0 && totalSmall > 0 ? `(${totalBig}B + ${totalSmall}S)` : ''}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 font-medium py-0.5">
              <span>Today's Bill:</span>
              <span className="font-black text-slate-900 text-sm font-mono">
                ₹{currentBillAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 font-medium py-0.5">
              <span>Old Balance:</span>
              <span className="font-bold text-slate-800 font-mono">
                ₹{Math.abs(numOld).toLocaleString('en-IN')} {numOld > 0 ? 'Due' : numOld < 0 ? 'Adv' : ''}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Total Due:</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                ₹{totalDue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-baseline text-xs text-slate-600 py-0.5">
              <span>Amount Paid:</span>
              <span className="font-black text-emerald-700 text-sm font-mono">
                ₹{numPaid.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-extrabold text-slate-900">New Balance:</span>
              <span
                className={`text-xl font-black px-2.5 py-0.5 rounded-lg border font-mono ${
                  newBalance > 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : newBalance < 0
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                ₹{Math.abs(newBalance).toLocaleString('en-IN')}{' '}
                {newBalance > 0 ? 'Due' : newBalance < 0 ? 'Adv' : 'Settled'}
              </span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. Afternoon delivery, direct pickup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 text-sm border border-slate-300 rounded-xl px-3.5 focus:ring-2 focus:ring-forest-600 focus:outline-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="h-11 px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="h-11 px-5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Save Only</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="h-11 px-6 text-sm font-bold text-white bg-forest-600 hover:bg-forest-700 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save & Print Bill'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BuyerBillingModal;
