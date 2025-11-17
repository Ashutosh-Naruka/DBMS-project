const Order = require('../models/Order');

// @desc    Get daily sales report
// @route   GET /api/reports/daily-sales
// @access  Private (Admin/Staff)
exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          counterPayments: {
            $sum: { $cond: [{ $eq: ['$paymentMode', 'counter'] }, '$totalAmount', 0] }
          },
          onlinePayments: {
            $sum: { $cond: [{ $eq: ['$paymentMode', 'online'] }, '$totalAmount', 0] }
          }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary: sales[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          counterPayments: 0,
          onlinePayments: 0
        },
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get top selling items
// @route   GET /api/reports/top-items
// @access  Private (Admin/Staff)
exports.getTopItems = async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const topItems = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'Cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          itemName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      data: topItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get hourly demand
// @route   GET /api/reports/hourly-demand
// @access  Private (Admin/Staff)
exports.getHourlyDemand = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const hourlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          totalAmount: 1
        }
      },
      {
        $group: {
          _id: '$hour',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: hourlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
