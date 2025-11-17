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
