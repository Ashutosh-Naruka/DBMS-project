require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB\n');

  try {
    // Q1: Retrieve all menu items in the category 'snacks'
    console.log('='.repeat(80));
    console.log('Q1: Retrieve all menu items in the category \'snacks\'');
    console.log('='.repeat(80));
    const snacks = await MenuItem.find(
      { category: 'snacks', isActive: true },
      'name description price availableStock'
    );
    console.table(snacks.map(item => ({
      name: item.name,
      description: item.description,
      price: item.price,
      availableStock: item.availableStock
    })));
    console.log('\n');

    // Q2: Retrieve all orders made by user with email "john@college.com"
    console.log('='.repeat(80));
    console.log('Q2: Retrieve all orders made by user with email "john@college.com"');
    console.log('='.repeat(80));
    const user = await User.findOne({ email: 'john@college.com' });
    if (user) {
      const orders = await Order.find(
        { userId: user._id },
        'orderToken totalAmount status'
      );
      console.table(orders.map(order => ({
        orderToken: order.orderToken,
        totalAmount: order.totalAmount,
        status: order.status
      })));
    } else {
      console.log('User with email "john@college.com" not found.');
    }
    console.log('\n');

    // Q3: Calculate total amount spent by each user
    console.log('='.repeat(80));
    console.log('Q3: Calculate the total amount spent by each user');
    console.log('='.repeat(80));
    const totalSpent = await Order.aggregate([
      {
        $group: {
          _id: '$userId',
          total_spent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          total_spent: 1
        }
      }
    ]);
    console.table(totalSpent.map(item => ({
      name: item.name,
      total_spent: item.total_spent
    })));
    console.log('\n');

    // Q4: List menu items, quantity, and price in order ID 1
    console.log('='.repeat(80));
    console.log('Q4: List menu items, quantity, and price in order ID 1');
    console.log('='.repeat(80));
    const orders = await Order.find({}).sort({ createdAt: 1 }).limit(1);
    if (orders.length > 0) {
      const order = orders[0];
      console.log(`Order ID: ${order._id}`);
      console.log(`Order Token: ${order.orderToken}\n`);
      console.table(order.items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price
      })));
    } else {
      console.log('No orders found.');
    }
    console.log('\n');

    // Q5: Retrieve all orders that are still pending
    console.log('='.repeat(80));
    console.log('Q5: Retrieve all orders that are still pending (status = "Placed")');
    console.log('='.repeat(80));
    const pendingOrders = await Order.find(
      { status: 'Placed' },
      'orderToken totalAmount paymentMode'
    );
    console.table(pendingOrders.map(order => ({
      orderToken: order.orderToken,
      totalAmount: order.totalAmount,
      paymentMode: order.paymentMode
    })));
    console.log('\n');

    // Q6: Retrieve all menu items with stock less than 10
    console.log('='.repeat(80));
    console.log('Q6: Retrieve all menu items with stock less than 10');
    console.log('='.repeat(80));
    const lowStock = await MenuItem.find(
      { availableStock: { $lt: 10 }, isActive: true },
      'name availableStock category'
    );
    console.table(lowStock.map(item => ({
      name: item.name,
      availableStock: item.availableStock,
      category: item.category
    })));
    console.log('\n');

  } catch (error) {
    console.error('Error executing queries:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
});
