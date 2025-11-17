import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket, joinAdminRoom } from '../services/socket';
import { toast } from 'react-toastify';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    joinAdminRoom();

    const socket = getSocket();
    socket.on('order:new', () => {
      toast.info('New order received!');
      fetchOrders();
    });
    socket.on('order:update', () => fetchOrders());

    return () => {
      socket.off('order:new');
      socket.off('order:update');
    };
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/orders', { params });
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
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
      <h1>Order Management</h1>
      
      <div style={styles.filters}>
        <button onClick={() => setStatusFilter('all')} style={statusFilter === 'all' ? styles.filterActive : styles.filter}>All</button>
        <button onClick={() => setStatusFilter('Placed')} style={statusFilter === 'Placed' ? styles.filterActive : styles.filter}>Placed</button>
        <button onClick={() => setStatusFilter('In Preparation')} style={statusFilter === 'In Preparation' ? styles.filterActive : styles.filter}>In Preparation</button>
        <button onClick={() => setStatusFilter('Ready')} style={statusFilter === 'Ready' ? styles.filterActive : styles.filter}>Ready</button>
        <button onClick={() => setStatusFilter('Completed')} style={statusFilter === 'Completed' ? styles.filterActive : styles.filter}>Completed</button>
      </div>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.header}>
                <div>
                  <h3>Token: {order.orderToken}</h3>
                  <p>{order.userId?.name || 'Unknown'} | {order.userId?.email || 'N/A'}</p>
                </div>
                <span style={{...styles.status, background: getStatusColor(order.status)}}>
                  {order.status}
                </span>
              </div>

              <div style={styles.items}>
                {order.items.map((item, idx) => (
                  <span key={idx} style={styles.item}>
                    {item.name} x {item.qty}
                  </span>
                ))}
              </div>

              <div style={styles.footer}>
                <div>
                  <strong>Total: ₹{order.totalAmount}</strong> | {order.paymentMode}
                  <br />
                  <small>{new Date(order.createdAt).toLocaleString()}</small>
                </div>
                <div style={styles.actions}>
                  {order.status === 'Placed' && (
                    <button onClick={() => updateOrderStatus(order._id, 'In Preparation')} style={styles.btnPrimary}>
                      Start Preparation
                    </button>
                  )}
                  {order.status === 'In Preparation' && (
                    <button onClick={() => updateOrderStatus(order._id, 'Ready')} style={styles.btnSuccess}>
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button onClick={() => updateOrderStatus(order._id, 'Completed')} style={styles.btnInfo}>
                      Complete
                    </button>
                  )}
                  <Link to={`/orders/${order._id}`} style={styles.link}>Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  loading: { textAlign: 'center', padding: '2rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
  filter: { padding: '0.5rem 1rem', background: '#ecf0f1', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  filterActive: { padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  orderCard: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' },
  status: { padding: '0.5rem 1rem', borderRadius: '20px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold' },
  items: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  item: { padding: '0.3rem 0.8rem', background: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #eee' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  btnPrimary: { padding: '0.5rem 1rem', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnSuccess: { padding: '0.5rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnInfo: { padding: '0.5rem 1rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  link: { padding: '0.5rem 1rem', background: '#95a5a6', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }
};

export default AdminOrderManagement;
