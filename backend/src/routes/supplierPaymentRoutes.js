const express = require('express');
const router = express.Router();
const {
  createSupplierPayment,
  getSupplierPayments,
  voidSupplierPayment
} = require('../controllers/supplierPaymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getSupplierPayments);
router.post('/', createSupplierPayment);
router.post('/:id/void', voidSupplierPayment);

module.exports = router;
