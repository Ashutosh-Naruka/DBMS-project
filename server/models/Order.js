const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  orderToken: {
    type: String,
    required: true,
    unique: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order must have at least one item'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  paymentMode: {
    type: String,
    enum: ['counter', 'online'],
    required: [true, 'Payment mode is required'],
    default: 'counter'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Placed', 'In Preparation', 'Ready', 'Completed', 'Cancelled'],
    default: 'Placed'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderToken: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Add initial status to history on creation
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

// Method to update status with history
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus });
};

module.exports = mongoose.model('Order', orderSchema);
