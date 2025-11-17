# Database Queries
## College Canteen Manager System

---

## Table of Contents
1. [Database Setup](#1-database-setup)
2. [Collection Creation](#2-collection-creation)
3. [Index Creation](#3-index-creation)
4. [Data Insertion (CRUD - Create)](#4-data-insertion-crud---create)
5. [Data Retrieval (CRUD - Read)](#5-data-retrieval-crud---read)
6. [Data Update (CRUD - Update)](#6-data-update-crud---update)
7. [Data Deletion (CRUD - Delete)](#7-data-deletion-crud---delete)
8. [Advanced Queries](#8-advanced-queries)
9. [Aggregation Queries](#9-aggregation-queries)
10. [Transaction Queries](#10-transaction-queries)

---

## 1. Database Setup

### 1.1 Connect to MongoDB
```javascript
// Using Mongoose (Node.js)
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
```

### 1.2 MongoDB Shell Commands
```bash
# Connect to MongoDB
mongo "mongodb://localhost:27017/canteen"

# Or for MongoDB Atlas
mongo "mongodb+srv://username:password@cluster.mongodb.net/canteen"

# Show all databases
show dbs

# Use canteen database
use canteen

# Show all collections
show collections
```

---

## 2. Collection Creation

### 2.1 Create Collections with Validation

#### Users Collection
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "passwordHash", "role"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 50,
          description: "User name - required, max 50 chars"
        },
        email: {
          bsonType: "string",
          pattern: "^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$",
          description: "Valid email - required"
        },
        passwordHash: {
          bsonType: "string",
          description: "Hashed password - required"
        },
        role: {
          enum: ["student", "staff", "admin"],
          description: "User role - required"
        },
        refreshToken: {
          bsonType: "string"
        }
      }
    }
  }
});
```

#### Menu Items Collection
```javascript
db.createCollection("menuitems", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "price", "availableStock"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 100,
          description: "Item name - required"
        },
        description: {
          bsonType: "string",
          maxLength: 500
        },
        category: {
          enum: ["snacks", "drinks", "meals", "desserts", "beverages"],
          description: "Item category - required"
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Price - required, non-negative"
        },
        isVeg: {
          bsonType: "bool"
        },
        availableStock: {
          bsonType: "int",
          minimum: 0,
          description: "Stock count - required, non-negative"
        },
        imageURL: {
          bsonType: "string"
        },
        isActive: {
          bsonType: "bool"
        }
      }
    }
  }
});
```

#### Orders Collection
```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "orderToken", "items", "paymentMode", "totalAmount", "status"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID reference - required"
        },
        orderToken: {
          bsonType: "string",
          description: "Unique order token - required"
        },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["itemId", "name", "price", "qty"],
            properties: {
              itemId: {
                bsonType: "objectId"
              },
              name: {
                bsonType: "string"
              },
              price: {
                bsonType: "number",
                minimum: 0
              },
              qty: {
                bsonType: "int",
                minimum: 1
              }
            }
          }
        },
        paymentMode: {
          enum: ["counter", "online"],
          description: "Payment mode - required"
        },
        totalAmount: {
          bsonType: "number",
          minimum: 0,
          description: "Total amount - required"
        },
        status: {
          enum: ["Placed", "In Preparation", "Ready", "Completed", "Cancelled"],
          description: "Order status - required"
        }
      }
    }
  }
});
```

---

## 3. Index Creation

### 3.1 User Collection Indexes
```javascript
// Unique index on email
db.users.createIndex({ email: 1 }, { unique: true });

// Index on role for filtering
db.users.createIndex({ role: 1 });

// Compound index for efficient lookups
db.users.createIndex({ email: 1, role: 1 });
```

### 3.2 Menu Item Collection Indexes
```javascript
// Compound index for category and availability
db.menuitems.createIndex({ category: 1, isActive: 1 });

// Text index for search functionality
db.menuitems.createIndex({ name: "text", description: "text" });

// Index on price for sorting
db.menuitems.createIndex({ price: 1 });

// Index on stock for availability checks
db.menuitems.createIndex({ availableStock: 1 });
```

### 3.3 Order Collection Indexes
```javascript
// Compound index for user orders sorted by date
db.orders.createIndex({ userId: 1, createdAt: -1 });

// Unique index on order token
db.orders.createIndex({ orderToken: 1 }, { unique: true });

// Index on status for filtering
db.orders.createIndex({ status: 1 });

// Index on creation date for time-based queries
db.orders.createIndex({ createdAt: -1 });

// Compound index for date range queries
db.orders.createIndex({ createdAt: -1, status: 1 });
```

### 3.4 Counter Collection Indexes
```javascript
// Unique index on counter name
db.counters.createIndex({ name: 1 }, { unique: true });
```

---

## 4. Data Insertion (CRUD - Create)

### 4.1 Insert Users

#### Single User
```javascript
// MongoDB Shell
db.users.insertOne({
  name: "John Doe",
  email: "john@college.com",
  passwordHash: "$2a$10$...", // Hashed password
  role: "student",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Mongoose (Node.js)
const user = await User.create({
  name: "John Doe",
  email: "john@college.com",
  passwordHash: "password123", // Will be hashed by middleware
  role: "student"
});
```

#### Multiple Users
```javascript
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@canteen.com",
    passwordHash: "$2a$10$...",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Staff Member",
    email: "staff@canteen.com",
    passwordHash: "$2a$10$...",
    role: "staff",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Student User",
    email: "student@college.com",
    passwordHash: "$2a$10$...",
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### 4.2 Insert Menu Items

```javascript
// Single Menu Item
db.menuitems.insertOne({
  name: "Samosa",
  description: "Crispy potato-filled samosa",
  category: "snacks",
  price: 20,
  isVeg: true,
  availableStock: 50,
  imageURL: "https://example.com/samosa.jpg",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Multiple Menu Items
db.menuitems.insertMany([
  {
    name: "Coffee",
    description: "Hot brewed coffee",
    category: "beverages",
    price: 30,
    isVeg: true,
    availableStock: 100,
    imageURL: "https://example.com/coffee.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Veg Burger",
    description: "Delicious vegetarian burger",
    category: "meals",
    price: 80,
    isVeg: true,
    availableStock: 30,
    imageURL: "https://example.com/burger.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Fruit Juice",
    description: "Fresh fruit juice",
    category: "drinks",
    price: 40,
    isVeg: true,
    availableStock: 60,
    imageURL: "https://example.com/juice.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### 4.3 Insert Orders

```javascript
// Single Order
db.orders.insertOne({
  userId: ObjectId("507f1f77bcf86cd799439011"),
  orderToken: "1001",
  items: [
    {
      itemId: ObjectId("507f1f77bcf86cd799439013"),
      name: "Samosa",
      price: 20,
      qty: 2
    },
    {
      itemId: ObjectId("507f1f77bcf86cd799439014"),
      name: "Coffee",
      price: 30,
      qty: 1
    }
  ],
  paymentMode: "counter",
  totalAmount: 70,
  status: "Placed",
  statusHistory: [
    {
      status: "Placed",
      timestamp: new Date()
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Mongoose with auto-incrementing token
const Counter = require('./models/Counter');

async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { name: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

const orderToken = await getNextSequence('orderToken');
const order = await Order.create({
  userId: req.user._id,
  orderToken: orderToken.toString(),
  items: cartItems,
  paymentMode: "counter",
  totalAmount: total,
  status: "Placed"
});
```

---

## 5. Data Retrieval (CRUD - Read)

### 5.1 Find Users

```javascript
// Find all users
db.users.find();

// Find user by email
db.users.findOne({ email: "john@college.com" });

// Find all students
db.users.find({ role: "student" });

// Find users with projection (exclude password)
db.users.find({}, { passwordHash: 0, refreshToken: 0 });

// Mongoose queries
const user = await User.findById(userId);
const user = await User.findOne({ email: "john@college.com" });
const students = await User.find({ role: "student" });
const users = await User.find().select('-passwordHash -refreshToken');
```

### 5.2 Find Menu Items

```javascript
// Find all active menu items
db.menuitems.find({ isActive: true });

// Find items by category
db.menuitems.find({ category: "snacks" });

// Find vegetarian items
db.menuitems.find({ isVeg: true });

// Find items in stock
db.menuitems.find({ availableStock: { $gt: 0 } });

// Find items with price range
db.menuitems.find({ price: { $gte: 20, $lte: 50 } });

// Text search
db.menuitems.find({ $text: { $search: "coffee" } });

// Mongoose queries
const items = await MenuItem.find({ isActive: true, availableStock: { $gt: 0 } });
const snacks = await MenuItem.find({ category: "snacks" });
const vegItems = await MenuItem.find({ isVeg: true }).sort({ price: 1 });
```

### 5.3 Find Orders

```javascript
// Find all orders
db.orders.find();

// Find orders by user
db.orders.find({ userId: ObjectId("507f1f77bcf86cd799439011") });

// Find orders by status
db.orders.find({ status: "Placed" });

// Find orders by token
db.orders.findOne({ orderToken: "1001" });

// Find orders in date range
db.orders.find({
  createdAt: {
    $gte: ISODate("2024-01-01"),
    $lte: ISODate("2024-12-31")
  }
});

// Mongoose queries with population
const orders = await Order.find({ userId: req.user._id })
  .populate('userId', 'name email')
  .populate('items.itemId', 'name category')
  .sort({ createdAt: -1 });

const order = await Order.findOne({ orderToken: "1001" })
  .populate('userId', 'name email role');
```

---

## 6. Data Update (CRUD - Update)

### 6.1 Update Users

```javascript
// Update user name
db.users.updateOne(
  { email: "john@college.com" },
  { $set: { name: "John Smith", updatedAt: new Date() } }
);

// Update user role
db.users.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { role: "admin", updatedAt: new Date() } }
);

// Mongoose
const user = await User.findByIdAndUpdate(
  userId,
  { name: "John Smith" },
  { new: true, runValidators: true }
);
```

### 6.2 Update Menu Items

```javascript
// Update price
db.menuitems.updateOne(
  { name: "Samosa" },
  { $set: { price: 25, updatedAt: new Date() } }
);

// Update stock
db.menuitems.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439013") },
  { $inc: { availableStock: -5 }, $set: { updatedAt: new Date() } }
);

// Deactivate item
db.menuitems.updateOne(
  { name: "Old Item" },
  { $set: { isActive: false, updatedAt: new Date() } }
);

// Update multiple items
db.menuitems.updateMany(
  { category: "snacks" },
  { $mul: { price: 1.1 }, $set: { updatedAt: new Date() } } // 10% price increase
);

// Mongoose
const item = await MenuItem.findByIdAndUpdate(
  itemId,
  { price: 25, availableStock: 45 },
  { new: true, runValidators: true }
);

// Decrease stock after order
await MenuItem.findByIdAndUpdate(
  itemId,
  { $inc: { availableStock: -quantity } }
);
```

### 6.3 Update Orders

```javascript
// Update order status
db.orders.updateOne(
  { orderToken: "1001" },
  {
    $set: {
      status: "In Preparation",
      updatedAt: new Date()
    },
    $push: {
      statusHistory: {
        status: "In Preparation",
        timestamp: new Date()
      }
    }
  }
);

// Cancel order
db.orders.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439012") },
  {
    $set: {
      status: "Cancelled",
      updatedAt: new Date()
    },
    $push: {
      statusHistory: {
        status: "Cancelled",
        timestamp: new Date()
      }
    }
  }
);

// Mongoose with method
const order = await Order.findOne({ orderToken: "1001" });
order.updateStatus("Ready");
await order.save();

// Or using static update
const order = await Order.findByIdAndUpdate(
  orderId,
  {
    status: "Completed",
    $push: {
      statusHistory: {
        status: "Completed",
        timestamp: new Date()
      }
    }
  },
  { new: true }
);
```

---

## 7. Data Deletion (CRUD - Delete)

### 7.1 Delete Users

```javascript
// Delete user by ID
db.users.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439011") });

// Delete user by email
db.users.deleteOne({ email: "test@test.com" });

// Delete multiple users
db.users.deleteMany({ role: "student", createdAt: { $lt: ISODate("2023-01-01") } });

// Mongoose
await User.findByIdAndDelete(userId);
await User.deleteOne({ email: "test@test.com" });
```

### 7.2 Delete Menu Items

```javascript
// Soft delete (recommended) - deactivate instead
db.menuitems.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439013") },
  { $set: { isActive: false, updatedAt: new Date() } }
);

// Hard delete
db.menuitems.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439013") });

// Delete all inactive items
db.menuitems.deleteMany({ isActive: false });

// Mongoose
await MenuItem.findByIdAndDelete(itemId);
```

### 7.3 Delete Orders

```javascript
// Delete order by ID
db.orders.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439012") });

// Delete old completed orders
db.orders.deleteMany({
  status: "Completed",
  createdAt: { $lt: ISODate("2023-01-01") }
});

// Mongoose
await Order.findByIdAndDelete(orderId);
```

---

## 8. Advanced Queries

### 8.1 Complex Filtering

```javascript
// Find available vegetarian snacks under ₹50
db.menuitems.find({
  category: "snacks",
  isVeg: true,
  price: { $lte: 50 },
  isActive: true,
  availableStock: { $gt: 0 }
}).sort({ price: 1 });

// Find users who haven't placed orders
db.users.find({
  _id: {
    $nin: db.orders.distinct("userId")
  }
});

// Mongoose
const items = await MenuItem.find({
  $or: [
    { category: "snacks" },
    { category: "drinks" }
  ],
  price: { $gte: 20, $lte: 50 },
  isActive: true
}).sort({ price: 1 }).limit(10);
```

### 8.2 Pagination

```javascript
// Page 1, 10 items per page
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

db.menuitems.find({ isActive: true })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

// Mongoose with count
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;

const items = await MenuItem.find({ isActive: true })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

const total = await MenuItem.countDocuments({ isActive: true });

res.json({
  items,
  currentPage: page,
  totalPages: Math.ceil(total / limit),
  totalItems: total
});
```

### 8.3 Sorting and Projection

```javascript
// Sort by price ascending
db.menuitems.find().sort({ price: 1 });

// Sort by multiple fields
db.orders.find().sort({ createdAt: -1, totalAmount: -1 });

// Projection - only specific fields
db.users.find(
  { role: "student" },
  { name: 1, email: 1, _id: 0 }
);

// Mongoose
const items = await MenuItem
  .find({ isActive: true })
  .select('name price category imageURL')
  .sort({ price: 1 });
```

---

## 9. Aggregation Queries

### 9.1 Revenue and Sales Analytics

```javascript
// Total revenue
db.orders.aggregate([
  {
    $match: { status: { $ne: "Cancelled" } }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmount" },
      totalOrders: { $sum: 1 }
    }
  }
]);

// Revenue by date
db.orders.aggregate([
  {
    $match: { status: { $ne: "Cancelled" } }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      dailyRevenue: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 }
  }
]);

// Revenue by payment mode
db.orders.aggregate([
  {
    $match: { status: { $ne: "Cancelled" } }
  },
  {
    $group: {
      _id: "$paymentMode",
      total: { $sum: "$totalAmount" },
      count: { $sum: 1 }
    }
  }
]);
```

### 9.2 Popular Items Analysis

```javascript
// Most ordered items
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.itemId",
      itemName: { $first: "$items.name" },
      totalQuantity: { $sum: "$items.qty" },
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      orderCount: { $sum: 1 }
    }
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 }
]);

// Items by category performance
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "menuitems",
      localField: "items.itemId",
      foreignField: "_id",
      as: "menuItem"
    }
  },
  { $unwind: "$menuItem" },
  {
    $group: {
      _id: "$menuItem.category",
      totalQuantity: { $sum: "$items.qty" },
      totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);
```

### 9.3 User Analytics

```javascript
// Top spending users
db.orders.aggregate([
  {
    $match: { status: { $ne: "Cancelled" } }
  },
  {
    $group: {
      _id: "$userId",
      totalSpent: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  {
    $project: {
      userName: "$user.name",
      userEmail: "$user.email",
      totalSpent: 1,
      orderCount: 1,
      avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] }
    }
  },
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]);

// Orders by user role
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" },
  {
    $group: {
      _id: "$user.role",
      orderCount: { $sum: 1 },
      totalRevenue: { $sum: "$totalAmount" }
    }
  }
]);
```

### 9.4 Order Status Analytics

```javascript
// Orders by status
db.orders.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
      totalAmount: { $sum: "$totalAmount" }
    }
  },
  { $sort: { count: -1 } }
]);

// Average preparation time
db.orders.aggregate([
  {
    $match: { status: "Completed" }
  },
  {
    $project: {
      preparationTime: {
        $subtract: ["$updatedAt", "$createdAt"]
      }
    }
  },
  {
    $group: {
      _id: null,
      avgPreparationTime: { $avg: "$preparationTime" }
    }
  }
]);
```

### 9.5 Stock and Inventory

```javascript
// Low stock items
db.menuitems.find({
  availableStock: { $lt: 10 },
  isActive: true
}).sort({ availableStock: 1 });

// Items never ordered
db.menuitems.aggregate([
  {
    $lookup: {
      from: "orders",
      let: { itemId: "$_id" },
      pipeline: [
        { $unwind: "$items" },
        {
          $match: {
            $expr: { $eq: ["$items.itemId", "$$itemId"] }
          }
        }
      ],
      as: "orders"
    }
  },
  {
    $match: { orders: { $size: 0 } }
  },
  {
    $project: {
      name: 1,
      category: 1,
      price: 1,
      availableStock: 1
    }
  }
]);
```

---

## 10. Transaction Queries

### 10.1 Place Order with Stock Update (Transaction)

```javascript
// Mongoose Transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Check and update stock
  for (const item of orderItems) {
    const menuItem = await MenuItem.findById(item.itemId).session(session);
    
    if (!menuItem || menuItem.availableStock < item.qty) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
    
    await MenuItem.findByIdAndUpdate(
      item.itemId,
      { $inc: { availableStock: -item.qty } },
      { session }
    );
  }
  
  // 2. Create order
  const orderToken = await getNextSequence('orderToken');
  const order = await Order.create([{
    userId: userId,
    orderToken: orderToken.toString(),
    items: orderItems,
    paymentMode: paymentMode,
    totalAmount: totalAmount,
    status: "Placed"
  }], { session });
  
  // 3. Commit transaction
  await session.commitTransaction();
  session.endSession();
  
  return order[0];
} catch (error) {
  await session.abortTransaction();
  session.endSession();
  throw error;
}
```

### 10.2 Cancel Order with Stock Refund

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Find order
  const order = await Order.findById(orderId).session(session);
  
  if (!order || order.status === "Cancelled") {
    throw new Error("Order not found or already cancelled");
  }
  
  // 2. Refund stock
  for (const item of order.items) {
    await MenuItem.findByIdAndUpdate(
      item.itemId,
      { $inc: { availableStock: item.qty } },
      { session }
    );
  }
  
  // 3. Update order status
  await Order.findByIdAndUpdate(
    orderId,
    {
      status: "Cancelled",
      $push: {
        statusHistory: {
          status: "Cancelled",
          timestamp: new Date()
        }
      }
    },
    { session }
  );
  
  await session.commitTransaction();
  session.endSession();
} catch (error) {
  await session.abortTransaction();
  session.endSession();
  throw error;
}
```

---

## 11. Utility Queries

### 11.1 Database Statistics

```javascript
// Collection statistics
db.users.stats();
db.menuitems.stats();
db.orders.stats();

// Database statistics
db.stats();

// Count documents
db.users.countDocuments();
db.menuitems.countDocuments({ isActive: true });
db.orders.countDocuments({ status: "Placed" });
```

### 11.2 Index Management

```javascript
// List all indexes
db.users.getIndexes();
db.menuitems.getIndexes();
db.orders.getIndexes();

// Drop index
db.menuitems.dropIndex("name_text");

// Rebuild indexes
db.menuitems.reIndex();
```

### 11.3 Backup and Restore

```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/canteen" --out=/backup/canteen

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/canteen" --collection=orders --out=/backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/canteen" /backup/canteen

# Restore specific collection
mongorestore --uri="mongodb://localhost:27017/canteen" --collection=orders /backup/canteen/orders.bson
```

---

## 12. Sample Complete Workflow

### 12.1 User Registration and Order Flow

```javascript
// 1. Register User
const user = await User.create({
  name: "Alice Smith",
  email: "alice@college.com",
  passwordHash: "securePassword123",
  role: "student"
});

// 2. Browse Menu Items
const availableItems = await MenuItem.find({
  isActive: true,
  availableStock: { $gt: 0 }
}).sort({ category: 1, name: 1 });

// 3. Place Order (with transaction)
const session = await mongoose.startSession();
session.startTransaction();

try {
  const orderItems = [
    { itemId: item1._id, name: "Samosa", price: 20, qty: 2 },
    { itemId: item2._id, name: "Coffee", price: 30, qty: 1 }
  ];
  
  // Update stock
  for (const item of orderItems) {
    await MenuItem.findByIdAndUpdate(
      item.itemId,
      { $inc: { availableStock: -item.qty } },
      { session }
    );
  }
  
  // Create order
  const orderToken = await getNextSequence('orderToken');
  const order = await Order.create([{
    userId: user._id,
    orderToken: orderToken.toString(),
    items: orderItems,
    paymentMode: "counter",
    totalAmount: 70,
    status: "Placed"
  }], { session });
  
  await session.commitTransaction();
  
  // 4. Track Order
  const myOrder = await Order.findOne({ orderToken: orderToken.toString() })
    .populate('userId', 'name email');
  
  // 5. Update Order Status
  await Order.findByIdAndUpdate(
    order[0]._id,
    {
      status: "Ready",
      $push: {
        statusHistory: {
          status: "Ready",
          timestamp: new Date()
        }
      }
    }
  );
  
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

This comprehensive query guide covers all aspects of database creation and management for the College Canteen Manager system.
