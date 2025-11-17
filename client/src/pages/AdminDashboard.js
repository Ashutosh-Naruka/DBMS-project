import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [salesRes, topItemsRes] = await Promise.all([
        api.get('/reports/daily-sales'),
        api.get('/reports/top-items?limit=5')
      ]);

      if (salesRes.data.data) {
        setStats(salesRes.data.data);
      }
      setTopItems(topItemsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total Orders</h3>
          <p style={styles.statValue}>{stats.totalOrders || 0}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Revenue</h3>
          <p style={styles.statValue}>₹{stats.totalRevenue || 0}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Avg Order Value</h3>
          <p style={styles.statValue}>₹{Math.round(stats.avgOrderValue || 0)}</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2>Top Selling Items</h2>
        {topItems.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Quantity Sold</th>
                <th style={styles.th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.itemName}</td>
                  <td style={styles.td}>{item.totalQuantity}</td>
                  <td style={styles.td}>₹{item.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  loading: { textAlign: 'center', padding: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' },
  statValue: { fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60', margin: 0 },
  section: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '1rem', background: '#f8f9fa', borderBottom: '2px solid #ddd' },
  td: { padding: '1rem', borderBottom: '1px solid #eee' }
};

export default AdminDashboard;
