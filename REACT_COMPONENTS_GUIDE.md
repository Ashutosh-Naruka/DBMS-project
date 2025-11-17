# React Frontend Components Guide

This file contains all React components and pages. Create each file in the specified directory.

## Components

### src/components/Navbar.js
```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>🍽️ Canteen Manager</Link>
        <div style={styles.menu}>
          {user ? (
            <>
              <Link to="/" style={styles.link}>Menu</Link>
              {user.role === 'student' && (
                <>
                  <Link to="/my-orders" style={styles.link}>My Orders</Link>
                  <button onClick={() => setShowCart(!showCart)} style={styles.cartBtn}>
                    🛒 Cart ({cart.length})
                  </button>
                </>
              )}
              {(user.role === 'admin' || user.role === 'staff') && (
                <>
                  <Link to="/admin" style={styles.link}>Dashboard</Link>
                  <Link to="/admin/orders" style={styles.link}>Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/menu" style={styles.link}>Manage Menu</Link>
                  )}
                </>
              )}
              <span style={styles.user}>👤 {user.name}</span>
              <button onClick={handleLogout} style={styles.btn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { background: '#2c3e50', padding: '1rem', color: 'white' },
  container: { display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' },
  menu: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' },
  btn: { padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cartBtn: { padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  user: { color: '#ecf0f1' }
};

export default Navbar;
```

### src/components/MenuCard.js
```jsx
import React from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  return (
    <div style={styles.card}>
      <img src={item.imageURL} alt={item.name} style={styles.image} />
      <div style={styles.content}>
        <h3>{item.name} {item.isVeg ? '🟢' : '🔴'}</h3>
        <p style={styles.desc}>{item.description}</p>
        <div style={styles.footer}>
          <span style={styles.price}>₹{item.price}</span>
          <span style={styles.stock}>Stock: {item.availableStock}</span>
        </div>
        <button 
          onClick={() => onAddToCart(item)}
          disabled={item.availableStock === 0 || !item.isActive}
          style={item.availableStock > 0 && item.isActive ? styles.btn : styles.btnDisabled}
        >
          {item.availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  content: { padding: '1rem' },
  desc: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem' },
  footer: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  price: { fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' },
  stock: { fontSize: '0.9rem', color: '#666' },
  btn: { width: '100%', padding: '0.7rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnDisabled: { width: '100%', padding: '0.7rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed' }
};

export default MenuCard;
```

## Pages

### src/pages/Login.js
```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
        <div style={styles.demo}>
          <p><strong>Demo Accounts:</strong></p>
          <p>Student: student@college.com / Student@123</p>
          <p>Admin: admin@canteen.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecf0f1' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.8rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' },
  demo: { marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.85rem' }
};

export default Login;
```

### src/pages/Register.js
```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" style={styles.input} />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecf0f1' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.8rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }
};

export default Register;
```

### src/pages/Menu.js
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MenuCard from '../components/MenuCard';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      const params = category !== 'all' ? { category } : {};
      const response = await api.get('/menu', { params });
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1>Menu</h1>
      
      <div style={styles.filters}>
        <button onClick={() => setCategory('all')} style={category === 'all' ? styles.filterActive : styles.filter}>All</button>
        <button onClick={() => setCategory('snacks')} style={category === 'snacks' ? styles.filterActive : styles.filter}>Snacks</button>
        <button onClick={() => setCategory('meals')} style={category === 'meals' ? styles.filterActive : styles.filter}>Meals</button>
        <button onClick={() => setCategory('beverages')} style={category === 'beverages' ? styles.filterActive : styles.filter}>Beverages</button>
        <button onClick={() => setCategory('desserts')} style={category === 'desserts' ? styles.filterActive : styles.filter}>Desserts</button>
      </div>

      {user?.role === 'student' && cart.length > 0 && (
        <div style={styles.cartSummary}>
          <span>Cart: {cart.length} items | Total: ₹{calculateTotal()}</span>
          <button onClick={handleCheckout} style={styles.checkoutBtn}>Checkout →</button>
        </div>
      )}

      <div style={styles.grid}>
        {menuItems.map((item) => (
          <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
  filter: { padding: '0.5rem 1rem', background: '#ecf0f1', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  filterActive: { padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  loading: { textAlign: 'center', padding: '2rem' },
  cartSummary: { background: '#3498db', color: 'white', padding: '1rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  checkoutBtn: { padding: '0.5rem 1.5rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Menu;
```

### src/pages/MyOrders.js
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { toast } from 'react-toastify';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    const socket = getSocket();
    socket.on('notify:user', (data) => {
      if (data.type === 'order_status') {
        toast.info(data.message);
        fetchOrders();
      }
    });

    return () => {
      socket.off('notify:user');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/user/me');
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Placed': '#3498db',
      'In Preparation': '#f39c12',
      'Ready': '#27ae60',
      'Completed': '#95a5a6',
      'Cancelled': '#e74c3c'
    };
    return colors[status] || '#666';
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.header}>
                <h3>Token: {order.orderToken}</h3>
                <span style={{...styles.status, background: getStatusColor(order.status)}}>
                  {order.status}
                </span>
              </div>
              <p>Items: {order.items.length} | Total: ₹{order.totalAmount}</p>
              <p>Payment: {order.paymentMode === 'counter' ? 'Pay at Counter' : 'Online'}</p>
              <p style={styles.date}>{new Date(order.createdAt).toLocaleString()}</p>
              <div style={styles.actions}>
                <Link to={`/orders/${order._id}`} style={styles.link}>View Details</Link>
                {order.status === 'Completed' && (
                  <Link to={`/receipt/${order._id}`} style={styles.receiptLink}>Receipt</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  loading: { textAlign: 'center', padding: '2rem' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  orderCard: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  status: { padding: '0.5rem 1rem', borderRadius: '20px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' },
  date: { color: '#666', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  link: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold' },
  receiptLink: { color: '#27ae60', textDecoration: 'none', fontWeight: 'bold' }
};

export default MyOrders;
```

### src/pages/DisplayKiosk.js
```jsx
import React, { useState, useEffect } from 'react';
import { joinKioskRoom, getSocket } from '../services/socket';
import api from '../services/api';

const DisplayKiosk = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    joinKioskRoom();

    const socket = getSocket();
    socket.on('order:new', () => fetchOrders());
    socket.on('order:update', () => fetchOrders());

    const interval = setInterval(fetchOrders, 5000);

    return () => {
      socket.off('order:new');
      socket.off('order:update');
      clearInterval(interval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders?status=Ready,In Preparation,Placed');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const getStatusColor = (status) => {
    return status === 'Ready' ? '#27ae60' : status === 'In Preparation' ? '#f39c12' : '#3498db';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍽️ Order Display Board</h1>
      <div style={styles.grid}>
        {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').map((order) => (
          <div key={order._id} style={{...styles.card, borderColor: getStatusColor(order.status)}}>
            <div style={styles.token}>{order.orderToken}</div>
            <div style={{...styles.status, background: getStatusColor(order.status)}}>
              {order.status}
            </div>
            <div style={styles.items}>
              {order.items.map((item, idx) => (
                <div key={idx}>{item.name} x {item.qty}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {orders.filter(o => o.status === 'Ready').length === 0 && (
        <p style={styles.empty}>No orders ready for pickup</p>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#2c3e50', color: 'white', padding: '2rem' },
  title: { textAlign: 'center', fontSize: '3rem', marginBottom: '2rem', color: '#ecf0f1' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' },
  card: { background: '#34495e', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '4px solid' },
  token: { fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ecf0f1' },
  status: { padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' },
  items: { fontSize: '1.1rem', lineHeight: '1.6' },
  empty: { textAlign: 'center', fontSize: '1.5rem', marginTop: '3rem', color: '#95a5a6' }
};

export default DisplayKiosk;
```

### src/pages/Receipt.js
```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Receipt = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to load order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.receipt}>
        <h1 style={styles.title}>🍽️ College Canteen</h1>
        <h2 style={styles.subtitle}>E-Receipt</h2>
        <div style={styles.divider}></div>
        
        <div style={styles.info}>
          <p><strong>Token Number:</strong> {order.orderToken}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Customer:</strong> {order.userId.name}</p>
          <p><strong>Payment:</strong> {order.paymentMode === 'counter' ? 'Pay at Counter' : 'Online'}</p>
        </div>

        <div style={styles.divider}></div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.qty}</td>
                <td style={styles.td}>₹{item.price}</td>
                <td style={styles.td}>₹{item.price * item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.divider}></div>

        <div style={styles.total}>
          <h2>Total: ₹{order.totalAmount}</h2>
        </div>

        <p style={styles.footer}>Thank you for your order!</p>
        <p style={styles.footer}>Status: {order.status}</p>

        <button onClick={handlePrint} style={styles.printBtn} className="no-print">
          🖨️ Print Receipt
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' },
  receipt: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '0.5rem' },
  subtitle: { textAlign: 'center', color: '#666', marginTop: 0 },
  divider: { borderTop: '2px dashed #ddd', margin: '1.5rem 0' },
  info: { marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd', background: '#f8f9fa' },
  td: { padding: '0.5rem', borderBottom: '1px solid #eee' },
  total: { textAlign: 'right', fontSize: '1.5rem', color: '#27ae60', marginTop: '1rem' },
  footer: { textAlign: 'center', color: '#666', marginTop: '1rem' },
  printBtn: { width: '100%', padding: '1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '2rem' }
};

export default Receipt;
```

## Admin Pages (Simplified)

Create AdminDashboard.js, AdminMenuManagement.js, AdminOrderManagement.js, and OrderDetails.js following similar patterns with:
- API calls to respective endpoints
- Real-time socket updates
- Forms for creating/editing
- Tables for displaying data
- Status update buttons for orders

## Additional Files Needed

### src/index.js
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### src/App.css
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
.loading { text-align: center; padding: 2rem; font-size: 1.2rem; }
@media print { .no-print { display: none; } }
```

### public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>College Canteen Manager</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```
