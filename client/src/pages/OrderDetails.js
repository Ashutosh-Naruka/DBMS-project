import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      toast.error('Failed to load order details');
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
  if (!order) return <div style={styles.loading}>Order not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Order Details</h1>
          <Link to="/my-orders" style={styles.backLink}>← Back to Orders</Link>
        </div>
        
        <div style={styles.section}>
          <h2>Order Token: {order.orderToken}</h2>
          <span style={{...styles.status, background: getStatusColor(order.status)}}>
            {order.status}
          </span>
        </div>

        <div style={styles.section}>
          <h3>Order Information</h3>
          <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Payment Mode:</strong> {order.paymentMode === 'counter' ? 'Pay at Counter' : 'Online Payment'}</p>
          <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
        </div>

        <div style={styles.section}>
          <h3>Items</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Subtotal</th>
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
        </div>

        <div style={styles.section}>
          <h3>Status History</h3>
          {order.statusHistory && order.statusHistory.map((history, idx) => (
            <div key={idx} style={styles.historyItem}>
              <span style={styles.historyStatus}>{history.status}</span>
              <span style={styles.historyDate}>{new Date(history.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {order.status === 'Completed' && (
          <Link to={`/receipt/${order._id}`} style={styles.receiptBtn}>
            View Receipt
          </Link>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  loading: { textAlign: 'center', padding: '2rem' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  backLink: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold' },
  section: { marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  status: { display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '20px', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.8rem', background: '#f8f9fa', borderBottom: '2px solid #ddd' },
  td: { padding: '0.8rem', borderBottom: '1px solid #eee' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' },
  historyStatus: { fontWeight: 'bold' },
  historyDate: { color: '#666', fontSize: '0.9rem' },
  receiptBtn: { display: 'inline-block', padding: '1rem 2rem', background: '#27ae60', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '1rem' }
};

export default OrderDetails;
