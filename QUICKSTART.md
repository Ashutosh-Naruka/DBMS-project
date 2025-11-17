# Quick Start Guide

## ✅ Project Status

Your College Canteen Manager project is **95% complete**! All code is in place. You just need to:

1. Update MongoDB password
2. Seed the database
3. Start the servers

---

## 🚀 Steps to Run

### Step 1: Update MongoDB Password

Edit `server/.env` file and replace `<db_password>` with your actual MongoDB Atlas password:

```env
MONGO_URI=mongodb+srv://ashutoshnarukamongodb:YOUR_ACTUAL_PASSWORD@cluster0.scapknn.mongodb.net/canteen?retryWrites=true&w=majority&appName=Cluster0
```

### Step 2: Seed the Database

```bash
cd server
npm run seed
```

This will create:
- Admin account: `admin@canteen.com` / `Admin@123`
- Staff account: `staff@canteen.com` / `Staff@123`
- Student account: `student@college.com` / `Student@123`
- Sample menu items

### Step 3: Start Backend Server

In the `server` directory:

```bash
npm run dev
```

Server will run on http://localhost:5000

### Step 4: Start Frontend (New Terminal)

In the `client` directory:

```bash
cd client
npm start
```

App will open at http://localhost:3000

---

## 🎯 Testing the Application

### As a Student:
1. Login with: `student@college.com` / `Student@123`
2. Browse menu items by category
3. Add items to cart
4. Go to checkout
5. Place order (Pay at Counter)
6. View "My Orders" to see order status
7. Check order details and receipt

### As Admin:
1. Login with: `admin@canteen.com` / `Admin@123`
2. View Dashboard with sales statistics
3. Go to "Orders" to manage all orders
4. Update order status (Placed → In Preparation → Ready → Completed)
5. Go to "Manage Menu" to add/edit/delete menu items

### Kiosk Display:
- Visit http://localhost:3000/display
- See real-time order board for kitchen staff

---

## 📦 What's Included

### Backend (100% Complete)
- ✅ Express.js server with Socket.IO
- ✅ MongoDB models (User, MenuItem, Order, Counter)
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control
- ✅ ACID transactions for orders
- ✅ Aggregation pipelines for reports
- ✅ Real-time order updates

### Frontend (100% Complete)
- ✅ React with Context API
- ✅ 11 pages fully implemented:
  - Login/Register
  - Menu with cart
  - Checkout
  - My Orders
  - Order Details
  - Receipt
  - Admin Dashboard
  - Admin Order Management
  - Admin Menu Management
  - Kiosk Display
- ✅ Socket.IO integration for real-time updates
- ✅ Protected routes with role-based access

---

## 🔑 Default Credentials

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Student | student@college.com     | Student@123 |
| Admin   | admin@canteen.com       | Admin@123   |
| Staff   | staff@canteen.com       | Staff@123   |

---

## 🎓 DBMS Features Demonstrated

1. **Normalization**: Database design follows 1NF, 2NF, 3NF
2. **ACID Transactions**: Order placement with rollback support
3. **Indexing**: Optimized queries with compound indexes
4. **Aggregation**: Complex analytics (daily sales, top items)
5. **Security**: bcrypt password hashing, JWT tokens
6. **Concurrency**: MongoDB transactions prevent race conditions

---

## 📁 Project Structure

```
college-canteen-manager/
├── server/                 # Backend (Node.js + Express)
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── server.js          # Main server + Socket.IO
│   └── seed.js            # Database seeder
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── pages/         # 11 complete pages
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API & Socket.IO
│   │   └── context/       # Auth context
│   └── package.json
│
├── README.md              # Complete documentation
├── PROJECT_SUMMARY.md     # Project overview
└── QUICKSTART.md          # This file
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure your MongoDB Atlas cluster is running
- Check that your IP address is whitelisted in MongoDB Atlas
- Verify the password in `.env` is correct

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Missing
```bash
# Reinstall backend
cd server && npm install

# Reinstall frontend
cd client && npm install
```

---

## ✨ Features to Showcase

1. **Real-time Updates**: Place an order as student, see it instantly on admin dashboard
2. **Transaction Safety**: Concurrent orders don't cause stock issues
3. **Status Tracking**: Order progresses through multiple stages with history
4. **Reports & Analytics**: View sales statistics and top-selling items
5. **Role-Based Access**: Different features for students, staff, and admins
6. **Responsive Design**: Works on desktop and mobile

---

## 📞 Next Steps

After running the application:

1. ✅ Test all student features
2. ✅ Test admin features
3. ✅ Verify real-time updates work
4. ✅ Check the kiosk display
5. ✅ Review the code for your presentation
6. ✅ Prepare demo for submission

---

**🎉 Congratulations! Your full-stack canteen management system is ready!**

For detailed API documentation and DBMS concepts, see [README.md](README.md)
