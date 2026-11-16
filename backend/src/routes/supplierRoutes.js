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
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN')); // Suppliers are Admin only as per reference application

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.patch('/:id/restore', restoreSupplier);
router.get('/:id/purchases', getSupplierPurchases);

module.exports = router;
