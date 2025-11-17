import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user && window.location.pathname === '/display') {
    return null; // Hide navbar on kiosk display
  }

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
                  <span style={styles.cartBadge}>🛒 Cart ({cart.length})</span>
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
              <span style={styles.user}>👤 {user.name} ({user.role})</span>
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
  nav: { background: '#2c3e50', padding: '1rem', color: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  container: { display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' },
  menu: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', transition: 'background 0.3s', borderRadius: '4px' },
  btn: { padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cartBadge: { padding: '0.5rem 1rem', background: '#3498db', borderRadius: '20px', fontSize: '0.9rem' },
  user: { color: '#ecf0f1', fontSize: '0.9rem' }
};

export default Navbar;
