const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Counter = require('../models/Counter');

// Generate unique order token
const getNextSequence = async (name, session) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );
  return counter.seq;
};

// @desc    Create new order with transaction
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMode } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId).session(session);

      if (!menuItem) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.itemId} not found`
        });
      }

      if (!menuItem.isActive) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      if (menuItem.availableStock < item.qty) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${menuItem.name}. Available: ${menuItem.availableStock}`
        });
      }

      // Decrement stock
      menuItem.availableStock -= item.qty;
      await menuItem.save({ session });

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        qty: item.qty
      });

      totalAmount += menuItem.price * item.qty;
    }

    // Generate order token
    const tokenNum = await getNextSequence('orderToken', session);
    const orderToken = `TKN${String(tokenNum).padStart(4, '0')}`;

    // Create order
    const order = await Order.create([{
      userId,
      orderToken,
      items: orderItems,
      paymentMode: paymentMode || 'counter',
      totalAmount,
      status: 'Placed'
    }], { session });

    await session.commitTransaction();

    // Populate user details
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('userId', 'name email');

    // Emit socket event (will be handled in server.js)
    if (req.io) {
      req.io.to('admin_room').emit('order:new', populatedOrder);
    }

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin/staff
    if (order.userId._id.toString() !== req.user._id.toString() &&
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/user/me
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all orders (admin/staff)
// @route   GET /api/orders
// @access  Private (Admin/Staff)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Staff)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.updateStatus(status);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email');

    // Emit socket events
    if (req.io) {
      req.io.to('admin_room').emit('order:update', populatedOrder);
      req.io.to(`user_${order.userId}`).emit('notify:user', {
        type: 'order_status',
        message: `Your order ${order.orderToken} is now ${status}`,
        order: populatedOrder
      });
    }

    res.status(200).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
