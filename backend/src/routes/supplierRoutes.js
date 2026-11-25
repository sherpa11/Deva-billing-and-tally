const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
  getSupplierPurchases
} = require('../controllers/supplierController');
const {
  createSupplierPayment,
  getSupplierPayments,
  voidSupplierPayment
} = require('../controllers/supplierPaymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN')); // Suppliers are Admin only as per reference application

router.get('/', getSuppliers);
router.post('/', createSupplier);

// Dedicated Supplier Payments
router.post('/payment', createSupplierPayment);
router.get('/payments', getSupplierPayments);
router.post('/payments/:id/void', voidSupplierPayment);

router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.patch('/:id/restore', restoreSupplier);
router.get('/:id/purchases', getSupplierPurchases);
router.get('/:id/ledger', getSupplierPurchases);

module.exports = router;
