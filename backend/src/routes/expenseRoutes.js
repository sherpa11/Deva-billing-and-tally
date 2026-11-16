const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, voidExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', voidExpense);

module.exports = router;
