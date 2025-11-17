const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/user/me', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.get('/', protect, authorize('admin', 'staff'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
