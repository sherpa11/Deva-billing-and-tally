const express = require('express');
const router = express.Router();
const { getDailyBusinessReport, getAgingReport, backupDatabase } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/daily', getDailyBusinessReport);
router.get('/aging', getAgingReport);
router.get('/backup', backupDatabase);

module.exports = router;
