# College Canteen Manager System

A complete full-stack canteen management system with real-time order tracking, payment processing, and admin dashboard.

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication (Access + Refresh tokens)
- **Socket.IO** for real-time communication
- **bcryptjs** for password hashing

### Frontend
- **React.js** with Context API
- **Axios** for API requests
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **React Toastify** for notifications

## 📋 Features

### Student Features
- ✅ Browse menu items by category
- ✅ Add items to cart
- ✅ Place orders with payment options
- ✅ View real-time order status (Placed → In Preparation → Ready → Completed)
- ✅ View order history
- ✅ Receive notifications on order status changes
- ✅ Download/Print e-receipt

### Admin/Staff Features
- ✅ Add, edit, delete menu items
- ✅ Update stock levels
- ✅ View all orders with filters
- ✅ Update order status with real-time broadcast
- ✅ Daily sales reports
- ✅ Top selling items analytics
- ✅ Hourly demand analysis

### Payment Options
- **Pay at Counter**: Fully functional
- **Online Payment**: Coming Soon (UI placeholder)

### Real-time Features
- Live order status updates
- Admin dashboard real-time notifications
- Kiosk display screen with auto-updates

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique, indexed),
  passwordHash: String,
  role: Enum['student', 'staff', 'admin'],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Menu Items Collection
```javascript
{
  name: String,
  description: String,
  category: Enum['snacks', 'drinks', 'meals', 'desserts', 'beverages'],
  price: Number,
  isVeg: Boolean,
  availableStock: Number,
  imageURL: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  userId: ObjectId (ref: User),
  orderToken: String (unique, e.g., TKN0001),
  items: [{
    itemId: ObjectId,
    name: String,
    price: Number,
    qty: Number
  }],
  paymentMode: Enum['counter', 'online'],
  totalAmount: Number,
  status: Enum['Placed', 'In Preparation', 'Ready', 'Completed', 'Cancelled'],
  statusHistory: [{
    status: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Counters Collection
```javascript
{
  name: String (unique),
  seq: Number
}
```

## 🔐 Authentication & Authorization

### JWT Implementation
- **Access Token**: Short-lived (1 hour), used for API requests
- **Refresh Token**: Long-lived (7 days), used to refresh access tokens
- **Password Security**: bcrypt with salt rounds (10)

### Role-Based Access Control (RBAC)
```
Student: Browse menu, place orders, view own orders
Staff: All student permissions + manage orders, view reports
Admin: All staff permissions + manage menu items, manage users
```

## 📊 Database Features

### 1. Normalization (DBMS Concept)

**1NF (First Normal Form)**
- All tables have atomic values (no multi-valued attributes)
- Each record is unique (primary keys: _id)

**2NF (Second Normal Form)**
- Meets 1NF requirements
- No partial dependencies (all non-key attributes depend on the entire primary key)
- Example: Order items are embedded but could be normalized further for better 2NF

**3NF (Third Normal Form)**
- Meets 2NF requirements
- No transitive dependencies
- User data is separate from Order data (referenced via userId)

### 2. Indexes for Performance
```javascript
// User indexes
{ email: 1 }
{ role: 1 }

// MenuItem indexes
{ category: 1, isActive: 1 }
{ name: 'text' }  // For search functionality
{ price: 1 }

// Order indexes
{ userId: 1, createdAt: -1 }  // Compound index for user order history
{ orderToken: 1 }  // Unique index
{ status: 1 }
{ createdAt: -1 }  // For date range queries
```

### 3. ACID Properties in MongoDB Transactions

Our order placement uses MongoDB transactions to ensure ACID compliance:

```javascript
// Example Transaction (from orderController.js)
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Atomicity: All or nothing
  // 1. Decrement stock
  menuItem.availableStock -= item.qty;
  await menuItem.save({ session });
  
  // 2. Create order
  const order = await Order.create([{...}], { session });
  
  // 3. Generate token
  const tokenNum = await getNextSequence('orderToken', session);
  
  // Consistency: Database remains in valid state
  // Isolation: Concurrent transactions don't interfere
  // Durability: Changes are permanent after commit
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();  // Rollback on error
  throw error;
} finally {
  session.endSession();
}
```

### 4. Aggregation Pipeline Examples

**Daily Sales Report**
```javascript
Order.aggregate([
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
      avgOrderValue: { $avg: '$totalAmount' }
    }
  }
]);
```

**Top Selling Items**
```javascript
Order.aggregate([
  { $match: { status: { $ne: 'Cancelled' } } },
  { $unwind: '$items' },
  {
    $group: {
      _id: '$items.itemId',
      itemName: { $first: '$items.name' },
      totalQuantity: { $sum: '$items.qty' },
      totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
    }
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 }
]);
```

### 5. Change Streams (MongoDB Feature)

Change Streams can be used to listen to database changes in real-time:

```javascript
// Example: Listen to order updates
const orderChangeStream = Order.watch();

orderChangeStream.on('change', (change) => {
  if (change.operationType === 'update') {
    // Notify relevant users via Socket.IO
    io.to(`user_${change.fullDocument.userId}`).emit('order:update', change.fullDocument);
  }
});
```

## 🔌 Socket.IO Events

### Client → Server
- `join:user` - Student joins their personal room
- `join:admin` - Admin/Staff joins admin room
- `join:kiosk` - Kiosk display joins admin room

### Server → Client
- `order:new` - New order created (to admin room)
- `order:update` - Order status changed (to admin + specific user)
- `notify:user` - Custom notification to user

## 🌐 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### POST /api/auth/login
Login existing user
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/refresh
Refresh access token
```json
Request:
{
  "refreshToken": "..."
}
```

### Menu Endpoints

#### GET /api/menu
Get all menu items (Public)
- Query params: `category`, `isActive`, `search`

#### GET /api/menu/:id
Get single menu item (Public)

#### POST /api/menu
Create menu item (Admin only)

#### PUT /api/menu/:id
Update menu item (Admin only)

#### DELETE /api/menu/:id
Delete menu item (Admin only)

### Order Endpoints

#### POST /api/orders
Create new order (Authenticated)
```json
Request:
{
  "items": [
    { "itemId": "...", "qty": 2 }
  ],
  "paymentMode": "counter"
}
```

#### GET /api/orders/:id
Get single order (Owner/Admin/Staff)

#### GET /api/orders/user/me
Get current user's orders (Authenticated)

#### GET /api/orders
Get all orders (Admin/Staff)
- Query params: `status`, `date`

#### PUT /api/orders/:id/status
Update order status (Admin/Staff)
```json
Request:
{
  "status": "In Preparation"
}
```

### Reports Endpoints (Admin/Staff)

#### GET /api/reports/daily-sales
Get daily sales summary
- Query params: `date` (default: today)

#### GET /api/reports/top-items
Get top selling items
- Query params: `limit` (default: 10), `days` (default: 30)

#### GET /api/reports/hourly-demand
Get hourly order distribution
- Query params: `date`

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### Backend Setup

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Edit `.env` file:
```
PORT=5000
MONGO_URI=mongodb+srv://ashutoshnarukamongodb:ashutoshnaruka1234@cluster0.scapknn.mongodb.net/canteen?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_this
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

4. **Seed database**
```bash
npm run seed
```

5. **Start server**
```bash
npm run dev
```

Server runs on http://localhost:5000

### Frontend Setup

1. **Navigate to client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. **Start React app**
```bash
npm start
```

App runs on http://localhost:3000

### Default Login Credentials

After running seed script:

- **Admin**: admin@canteen.com / Admin@123
- **Staff**: staff@canteen.com / Staff@123
- **Student**: student@college.com / Student@123

## 📱 Kiosk Display

Access the kiosk display at `/display` route. Features:
- Real-time order list
- Token numbers prominently displayed
- Status color coding (Ready orders in green)
- Auto-refresh every 5 seconds
- Audio notification on ready orders (optional)

## 🎨 Project Structure

```
college-canteen-manager/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   └── reportsController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Counter.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── jwt.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── MenuCard.js
│   │   │   ├── CartDrawer.js
│   │   │   ├── OrderStatusTracker.js
│   │   │   ├── AdminTable.js
│   │   │   └── KioskOrderList.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Menu.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── MyOrders.js
│   │   │   ├── OrderDetails.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminMenuManagement.js
│   │   │   ├── AdminOrderManagement.js
│   │   │   ├── DisplayKiosk.js
│   │   │   └── Receipt.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🎓 DBMS Concepts Implemented

### 1. Database Design
- Entity-Relationship modeling
- Proper normalization (1NF, 2NF, 3NF)
- Referential integrity (foreign keys via ObjectId references)

### 2. Transactions (ACID)
- **Atomicity**: All operations in transaction complete or none
- **Consistency**: Database maintains valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

### 3. Indexing
- B-tree indexes on frequently queried fields
- Compound indexes for multi-field queries
- Text indexes for search functionality
- Performance optimization through proper indexing

### 4. Aggregation Framework
- Complex data analysis queries
- Group by operations
- Statistical calculations (sum, avg, count)
- Data transformation pipelines

### 5. Concurrency Control
- MongoDB's document-level locking
- Transaction isolation levels
- Optimistic concurrency with version numbers

### 6. Security
- Authentication and Authorization
- Password hashing (bcrypt)
- JWT token-based security
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries via Mongoose)

### 7. Query Optimization
- Proper use of indexes
- Efficient aggregation pipelines
- Limiting result sets
- Projection to return only needed fields

## 📈 Performance Considerations

- Index usage on frequently queried fields
- Connection pooling in MongoDB
- JWT for stateless authentication
- Socket.IO for real-time updates (reduces polling)
- Lazy loading of data
- Pagination for large datasets

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies (can be implemented)
- CORS configuration
- Input validation
- SQL injection prevention (NoSQL)
- XSS protection
- Rate limiting (can be added)

## 🚀 Future Enhancements

- Online payment integration (Razorpay/Stripe)
- Email notifications
- SMS notifications
- QR code for order tracking
- Mobile app (React Native)
- Advanced analytics dashboard
- Inventory management
- Multi-canteen support
- Rating and review system

## 👨‍💻 Developer

Developed as a College Canteen Management System project demonstrating full-stack development with MERN stack, real-time communication, and database management concepts.

---

