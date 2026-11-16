const express = require('express');
const router = express.Router();
const {
  createSale,
  createPayment,
  voidTransaction,
  getTransactions
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getTransactions);
router.post('/sale', createSale);
router.post('/payment', createPayment);
router.post('/:id/void', authorize('ADMIN'), voidTransaction);

module.exports = router;
