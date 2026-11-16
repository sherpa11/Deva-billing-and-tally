const express = require('express');
const router = express.Router();
const {
  getBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
  getBuyerLedger
} = require('../controllers/buyerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBuyers);
router.post('/', createBuyer);
router.get('/:id', getBuyerById);
router.put('/:id', updateBuyer);
router.delete('/:id', deleteBuyer);
router.get('/:id/ledger', getBuyerLedger);

module.exports = router;
