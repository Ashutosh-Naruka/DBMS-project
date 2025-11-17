require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Counter = require('./models/Counter');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Counter.deleteMany({});

    // Create users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@canteen.com',
      passwordHash: 'Admin@123',
      role: 'admin'
    });

    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@canteen.com',
      passwordHash: 'Staff@123',
      role: 'staff'
    });

    const student = await User.create({
      name: 'John Doe',
      email: 'student@college.com',
      passwordHash: 'Student@123',
      role: 'student'
    });

    console.log('Users created:', { admin: admin.email, staff: staff.email, student: student.email });

    // Create menu items
    console.log('Creating menu items...');
    const menuItems = [
      {
        name: 'Samosa',
        description: 'Crispy fried triangular pastry filled with spiced potatoes',
        category: 'snacks',
        price: 20,
        isVeg: true,
        availableStock: 50,
        imageURL: 'https://via.placeholder.com/300x200?text=Samosa',
        isActive: true
      },
      {
        name: 'Vada Pav',
        description: 'Mumbai style spicy potato fritter in a bun',
        category: 'snacks',
        price: 25,
        isVeg: true,
        availableStock: 40,
        imageURL: 'https://via.placeholder.com/300x200?text=Vada+Pav',
        isActive: true
      },
      {
        name: 'Masala Dosa',
        description: 'South Indian crispy crepe with potato filling',
        category: 'meals',
        price: 60,
        isVeg: true,
        availableStock: 30,
        imageURL: 'https://via.placeholder.com/300x200?text=Masala+Dosa',
        isActive: true
      },
      {
        name: 'Idli Sambar',
        description: 'Steamed rice cakes with lentil soup',
        category: 'meals',
        price: 40,
        isVeg: true,
        availableStock: 35,
        imageURL: 'https://via.placeholder.com/300x200?text=Idli+Sambar',
        isActive: true
      },
      {
        name: 'Chicken Biryani',
        description: 'Aromatic rice with spiced chicken',
        category: 'meals',
        price: 120,
        isVeg: false,
        availableStock: 20,
        imageURL: 'https://via.placeholder.com/300x200?text=Chicken+Biryani',
        isActive: true
      },
      {
        name: 'Chai',
        description: 'Indian spiced tea',
        category: 'beverages',
        price: 10,
        isVeg: true,
        availableStock: 100,
        imageURL: 'https://via.placeholder.com/300x200?text=Chai',
        isActive: true
      },
      {
        name: 'Cold Coffee',
        description: 'Chilled coffee with ice cream',
        category: 'beverages',
        price: 50,
        isVeg: true,
        availableStock: 40,
        imageURL: 'https://via.placeholder.com/300x200?text=Cold+Coffee',
        isActive: true
      },
      {
        name: 'Mango Juice',
        description: 'Fresh mango juice',
        category: 'drinks',
        price: 35,
        isVeg: true,
        availableStock: 50,
        imageURL: 'https://via.placeholder.com/300x200?text=Mango+Juice',
        isActive: true
      },
      {
        name: 'Gulab Jamun',
        description: 'Sweet deep-fried dumplings in sugar syrup',
        category: 'desserts',
        price: 30,
        isVeg: true,
        availableStock: 45,
        imageURL: 'https://via.placeholder.com/300x200?text=Gulab+Jamun',
        isActive: true
      },
      {
        name: 'Ice Cream',
        description: 'Vanilla ice cream scoop',
        category: 'desserts',
        price: 40,
        isVeg: true,
        availableStock: 50,
        imageURL: 'https://via.placeholder.com/300x200?text=Ice+Cream',
        isActive: true
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log(`${menuItems.length} menu items created`);

    // Initialize counter
    await Counter.create({ name: 'orderToken', seq: 0 });
    console.log('Order counter initialized');

    console.log('\n=================================');
    console.log('Seed completed successfully!');
    console.log('=================================');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@canteen.com / Admin@123');
    console.log('Staff: staff@canteen.com / Staff@123');
    console.log('Student: student@college.com / Student@123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
