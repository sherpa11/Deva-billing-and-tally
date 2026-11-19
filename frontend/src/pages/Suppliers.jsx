import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Truck, 
  Search, 
  UserPlus, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Plus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import Modal from '../components/Modal';
import SupplierBillingModal from '../components/SupplierBillingModal';
import SupplierPrintModal from '../components/SupplierPrintModal';

const Suppliers = ({ onSelectSupplier }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ACTIVE'); // ACTIVE, ALL, ARCHIVED
  const [loading, setLoading] = useState(true);

  // Add Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [notes, setNotes] = useState('');

  // Bill entry modal
  const [selectedSupplierForBill, setSelectedSupplierForBill] = useState(null);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuppliers(search);
    }, search ? 250 : 0);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchSuppliers = async (query = search) => {
    if (suppliers.length === 0) setLoading(true);
    try {
      const res = await api.get(`/suppliers?search=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setSuppliers(res.data.suppliers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.post('/suppliers', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        initialBalance: Number(initialBalance) || 0,
        notes: notes.trim(),
      });

      if (res.data.success) {
        fetchSuppliers();
        setShowAddModal(false);
        setName('');
        setPhone('');
        setAddress('');
        setInitialBalance('');
        setNotes('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create supplier');
    }
  };

  const handleDeleteSupplier = async (supplier) => {
    if (!window.confirm(`Are you sure you want to remove supplier "${supplier.name}"?\n\nIf this supplier has existing purchase bills or ledger records, they will be safely archived to protect all historical financial records.`)) {
      return;
    }

    try {
      const res = await api.delete(`/suppliers/${supplier._id}`);
      if (res.data.success) {
        alert(res.data.message || 'Supplier updated successfully');
        fetchSuppliers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove supplier');
    }
  };

  const handleRestoreSupplier = async (supplier) => {
    try {
      const res = await api.patch(`/suppliers/${supplier._id}/restore`);
      if (res.data.success) {
        alert(res.data.message || 'Supplier restored successfully');
        fetchSuppliers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore supplier');
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (filterStatus === 'ACTIVE') return s.isActive !== false;
    if (filterStatus === 'ARCHIVED') return s.isActive === false;
    return true;
  });

  const totalSupplierPayable = suppliers
    .filter(s => s.isActive !== false)
    .reduce((s, sup) => s + (sup.currentBalance > 0 ? sup.currentBalance : 0), 0);
  const totalPurchases = suppliers.reduce((s, sup) => s + (sup.totalPurchases || 0), 0);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Banner - Compact */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-surface-border shadow-subtle pleasant-card">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 shrink-0">
            <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-forest-700" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-content-main tracking-tight font-sans truncate">
              Suppliers & Intake
            </h1>
            <p className="text-[11px] text-content-secondary mt-0.5 truncate">
              Total of <span className="font-semibold text-content-main">{suppliers.length} registered farmers</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedSupplierForBill('NEW')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 bg-white border border-surface-border text-content-main hover:bg-surface-hover rounded-lg text-xs font-medium transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-content-secondary" />
            <span>New Purchase</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3.5 bg-forest-600 hover:bg-forest-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Supplier</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle pleasant-card">
          <div className="text-[11px] font-medium text-content-secondary">Total Payable to Farmers</div>
          <div className="text-lg sm:text-xl font-bold text-content-main mt-0.5">₹{totalSupplierPayable.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-surface-border shadow-subtle pleasant-card">
          <div className="text-[11px] font-medium text-content-secondary">Cumulative Purchases</div>
          <div className="text-lg sm:text-xl font-bold text-forest-600 mt-0.5">₹{totalPurchases.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-surface-border shadow-subtle flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-content-secondary absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search supplier, village, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 bg-surface-bg transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'ACTIVE', label: 'Active Farmers' },
            { id: 'ALL', label: 'All Suppliers' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-content-main text-white font-semibold shadow-2xs'
                  : 'bg-surface-bg text-content-secondary hover:text-content-main hover:bg-surface-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSuppliers.map((s) => (
          <div
            key={s._id}
            className={`bg-white rounded-xl border p-4 shadow-subtle transition-all flex flex-col justify-between pleasant-card ${
              s.isActive === false ? 'border-dashed border-surface-border opacity-75' : 'border-surface-border'
            }`}
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider">
                      {s.supplierCode}
                    </span>
                    {s.isActive === false && (
                      <span className="text-[9px] font-bold bg-surface-border text-content-secondary px-1.5 py-0.2 rounded uppercase">
                        Archived
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-content-main font-tamil mt-0.5">{s.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-bg text-content-main border border-surface-border whitespace-nowrap">
                    Due: ₹{(s.currentBalance || 0).toLocaleString('en-IN')}
                  </span>

                  {s.isActive !== false ? (
                    <button
                      onClick={() => handleDeleteSupplier(s)}
                      title={`Delete or archive supplier ${s.name}`}
                      className="p-1 text-content-secondary hover:text-status-danger hover:bg-status-dangerLight rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestoreSupplier(s)}
                      title={`Restore supplier ${s.name}`}
                      className="p-1 text-content-secondary hover:text-forest-600 hover:bg-forest-50 rounded transition-colors shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {s.phone && (
                <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-2">
                  <Phone className="w-3.5 h-3.5 text-content-secondary shrink-0" />
                  <span>{s.phone}</span>
                </div>
              )}

              {s.address && (
                <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1 font-tamil">
                  <MapPin className="w-3.5 h-3.5 text-content-secondary shrink-0" />
                  <span className="truncate">{s.address}</span>
                </div>
              )}

              <div className="mt-3 pt-2.5 border-t border-surface-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-content-secondary text-[11px]">Total Intake:</span>
                  <div className="font-semibold text-content-main">₹{(s.totalPurchases || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <span className="text-content-secondary text-[11px]">Total Paid:</span>
                  <div className="font-semibold text-forest-600">₹{(s.totalPayments || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-surface-border flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedSupplierForBill(s._id)}
                className="flex-1 py-1.5 px-2 bg-surface-bg hover:bg-surface-hover text-content-main rounded-md text-xs font-semibold transition-colors"
              >
                + New Purchase
              </button>

              <button
                onClick={() => onSelectSupplier(s._id)}
                className="py-1.5 px-3 bg-content-main hover:bg-black text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Supplier"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-content-main mb-1">
              Farmer / Supplier Name <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. மாரிமுத்து / Marimuthu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Village / Address</label>
            <input
              type="text"
              placeholder="Village name or address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600 font-tamil"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              placeholder="0"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-content-main mb-1">Notes / Memo</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-lg text-content-secondary hover:bg-surface-hover font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Bill Modal */}
      {selectedSupplierForBill && (
        <SupplierBillingModal
          isOpen={Boolean(selectedSupplierForBill)}
          onClose={() => setSelectedSupplierForBill(null)}
          onBillSaved={(bill, shouldPrint) => {
            fetchSuppliers();
            setSelectedSupplierForBill(null);
            if (shouldPrint) setPrintBill(bill);
          }}
          defaultSupplierId={selectedSupplierForBill !== 'NEW' ? selectedSupplierForBill : null}
        />
      )}

      {/* Supplier Print Bill Pad Modal */}
      <SupplierPrintModal
        isOpen={Boolean(printBill)}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />
    </div>
  );
};

export default Suppliers;