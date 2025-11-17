const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['snacks', 'drinks', 'meals', 'desserts', 'beverages'],
    default: 'snacks'
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  availableStock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  imageURL: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Food+Item'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
menuItemSchema.index({ category: 1, isActive: 1 });
menuItemSchema.index({ name: 'text' });
menuItemSchema.index({ price: 1 });

// Virtual for availability status
menuItemSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.availableStock > 0;
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
