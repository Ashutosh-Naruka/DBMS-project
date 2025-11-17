import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import api from '../services/api';
import { toast } from 'react-toastify';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [paymentMode, setPaymentMode] = useState('counter');
  const [placing, setPlacing] = useState(false);
  const { addToCart, cart, user, removeFromCart, updateCartQty, clearCart } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      const params = category !== 'all' ? { category, isActive: true } : { isActive: true };
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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        items: cart.map(item => ({ itemId: item._id, qty: item.qty })),
        paymentMode
      };

      const response = await api.post('/orders', orderData);
      toast.success(`Order placed! Token: ${response.data.data.orderToken}`);
      clearCart();
      setShowCart(false);
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div style={styles.loading}>⏳ Loading menu...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🍽️ Our Menu</h1>
        {user?.role === 'student' && (
          <button onClick={() => setShowCart(true)} style={styles.cartBtn}>
            🛒 View Cart ({cart.length} items)
          </button>
        )}
      </div>
      
      <div style={styles.filters}>
        {['all', 'snacks', 'meals', 'beverages', 'desserts', 'drinks'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)} 
            style={category === cat ? styles.filterActive : styles.filter}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {menuItems.map((item) => (
          <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {menuItems.length === 0 && (
        <p style={styles.empty}>No items found in this category</p>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={styles.modal} onClick={() => setShowCart(false)}>
          <div style={styles.cartCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.cartHeader}>
              <h2>🛒 Your Cart</h2>
              <button onClick={() => setShowCart(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            {cart.length === 0 ? (
              <p style={styles.emptyCart}>Your cart is empty</p>
            ) : (
              <>
                <div style={styles.cartItems}>
                  {cart.map((item) => (
                    <div key={item._id} style={styles.cartItem}>
                      <div>
                        <strong>{item.name}</strong>
                        <p style={styles.itemPrice}>₹{item.price} each</p>
                      </div>
                      <div style={styles.qtyControls}>
                        <button onClick={() => updateCartQty(item._id, item.qty - 1)} style={styles.qtyBtn}>-</button>
                        <span style={styles.qty}>{item.qty}</span>
                        <button onClick={() => updateCartQty(item._id, item.qty + 1)} style={styles.qtyBtn}>+</button>
                        <button onClick={() => removeFromCart(item._id)} style={styles.removeBtn}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.paymentSection}>
                  <h3>Payment Method</h3>
                  <div style={styles.paymentOptions}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        value="counter" 
                        checked={paymentMode === 'counter'}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      />
                      <span>💵 Pay at Counter</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        value="online" 
                        checked={paymentMode === 'online'}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        disabled
                      />
                      <span>💳 Online Payment (Coming Soon)</span>
                    </label>
                  </div>
                </div>

                <div style={styles.cartFooter}>
                  <div style={styles.total}>
                    <span>Total:</span>
                    <span style={styles.totalAmount}>₹{calculateTotal()}</span>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={placing} style={styles.checkoutBtn}>
                    {placing ? '⏳ Placing Order...' : '✅ Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', color: '#2c3e50' },
  cartBtn: { padding: '0.7rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
  filter: { padding: '0.6rem 1.2rem', background: '#ecf0f1', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s', fontWeight: '500' },
  filterActive: { padding: '0.6rem 1.2rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  loading: { textAlign: 'center', padding: '3rem', fontSize: '1.2rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#666', fontSize: '1.1rem' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  cartCard: { background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #eee' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' },
  emptyCart: { padding: '3rem', textAlign: 'center', color: '#666' },
  cartItems: { padding: '1rem', maxHeight: '400px', overflowY: 'auto' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #f0f0f0' },
  itemPrice: { fontSize: '0.85rem', color: '#666', margin: '0.3rem 0' },
  qtyControls: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  qtyBtn: { padding: '0.3rem 0.7rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  qty: { padding: '0.3rem 0.8rem', background: '#f0f0f0', borderRadius: '4px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' },
  removeBtn: { padding: '0.3rem 0.7rem', background: '#e74c3c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  paymentSection: { padding: '1.5rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' },
  paymentOptions: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '6px', cursor: 'pointer' },
  cartFooter: { padding: '1.5rem' },
  total: { display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' },
  totalAmount: { color: '#27ae60' },
  checkoutBtn: { width: '100%', padding: '1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }
};

export default Menu;
