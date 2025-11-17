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
