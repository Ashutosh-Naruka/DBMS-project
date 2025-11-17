import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, clearCart, removeFromCart, updateQuantity } = useAuth();
  const [paymentMode, setPaymentMode] = useState('counter');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({ itemId: item._id, qty: item.qty })),
        paymentMode
      };

      const response = await api.post('/orders', orderData);
      toast.success(`Order placed! Token: ${response.data.data.orderToken}`);
      clearCart();
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/')} style={styles.btn}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Checkout</h1>
      
      <div style={styles.content}>
        <div style={styles.cartSection}>
          <h2>Your Order</h2>
          {cart.map((item) => (
            <div key={item._id} style={styles.cartItem}>
              <img src={item.imageURL} alt={item.name} style={styles.image} />
              <div style={styles.itemDetails}>
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
              </div>
              <div style={styles.quantityControls}>
                <button onClick={() => updateQuantity(item._id, -1)} style={styles.qtyBtn}>-</button>
                <span style={styles.qty}>{item.qty}</span>
                <button onClick={() => updateQuantity(item._id, 1)} style={styles.qtyBtn}>+</button>
              </div>
              <div style={styles.itemTotal}>
                ₹{item.price * item.qty}
              </div>
              <button onClick={() => removeFromCart(item._id)} style={styles.removeBtn}>×</button>
            </div>
          ))}
        </div>

        <div style={styles.summarySection}>
          <h2>Order Summary</h2>
          <div style={styles.summaryItem}>
            <span>Subtotal:</span>
            <span>₹{calculateTotal()}</span>
          </div>
          <div style={styles.summaryItem}>
            <span>Tax:</span>
            <span>₹0</span>
          </div>
          <div style={styles.summaryTotal}>
            <span><strong>Total:</strong></span>
            <span><strong>₹{calculateTotal()}</strong></span>
          </div>

          <div style={styles.paymentSection}>
            <h3>Payment Method</h3>
            <label style={styles.radioLabel}>
              <input 
                type="radio" 
                value="counter" 
                checked={paymentMode === 'counter'}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              <span style={styles.radioText}>Pay at Counter</span>
            </label>
            <label style={styles.radioLabel}>
              <input 
                type="radio" 
                value="online" 
                checked={paymentMode === 'online'}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              <span style={styles.radioText}>Online Payment (Coming Soon)</span>
            </label>
          </div>

          <button 
            onClick={handlePlaceOrder} 
            disabled={loading || paymentMode === 'online'}
            style={loading || paymentMode === 'online' ? styles.btnDisabled : styles.btn}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  empty: { textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px' },
  content: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' },
  cartSection: { background: 'white', padding: '2rem', borderRadius: '8px' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #eee' },
  image: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
  itemDetails: { flex: 1 },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qtyBtn: { width: '30px', height: '30px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' },
  qty: { padding: '0 1rem', fontWeight: 'bold' },
  itemTotal: { fontWeight: 'bold', minWidth: '80px', textAlign: 'right' },
  removeBtn: { width: '30px', height: '30px', border: 'none', background: '#e74c3c', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1' },
  summarySection: { background: 'white', padding: '2rem', borderRadius: '8px', height: 'fit-content' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.2rem', borderTop: '2px solid #ddd', marginTop: '1rem' },
  paymentSection: { marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', cursor: 'pointer' },
  radioText: { fontSize: '1rem' },
  btn: { width: '100%', padding: '1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem', fontWeight: 'bold' },
  btnDisabled: { width: '100%', padding: '1rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'not-allowed', marginTop: '1rem', fontWeight: 'bold' }
};

export default Checkout;
