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
          <p><strong>Customer:</strong> {order.userId?.name || 'N/A'}</p>
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
