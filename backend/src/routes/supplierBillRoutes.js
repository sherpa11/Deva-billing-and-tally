const express = require('express');
const router = express.Router();
const {
  createSupplierBill,
  getSupplierBills,
  getSupplierBillById,
  updateSupplierBill,
  voidSupplierBill
} = require('../controllers/supplierBillController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getSupplierBills);
router.post('/', createSupplierBill);
router.get('/:id', getSupplierBillById);
router.put('/:id', updateSupplierBill);
router.post('/:id/void', voidSupplierBill);

module.exports = router;
