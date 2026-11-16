const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, getUsers, createUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

router.get('/users', protect, authorize('ADMIN'), getUsers);
router.post('/users', protect, authorize('ADMIN'), createUser);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
