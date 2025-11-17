import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Login successful!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🍽️ Canteen Manager Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? '⏳ Logging in...' : '🔑 Login'}
          </button>
        </form>
        <p style={styles.text}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
        <div style={styles.demo}>
          <p style={styles.demoTitle}><strong>📋 Demo Accounts:</strong></p>
          <div style={styles.demoGrid}>
            <div style={styles.demoItem}>
              <p><strong>👨‍🎓 Student</strong></p>
              <p style={styles.demoText}>student@college.com</p>
              <p style={styles.demoText}>Student@123</p>
            </div>
            <div style={styles.demoItem}>
              <p><strong>👨‍💼 Admin</strong></p>
              <p style={styles.demoText}>admin@canteen.com</p>
              <p style={styles.demoText}>Admin@123</p>
            </div>
            <div style={styles.demoItem}>
              <p><strong>👨‍🍳 Staff</strong></p>
              <p style={styles.demoText}>staff@canteen.com</p>
              <p style={styles.demoText}>Staff@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    minHeight: 'calc(100vh - 60px)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem'
  },
  card: { 
    background: 'white', 
    padding: '2.5rem', 
    borderRadius: '12px', 
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)' 
  },
  heading: { textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#555' },
  input: { 
    padding: '0.9rem', 
    border: '2px solid #e0e0e0', 
    borderRadius: '6px', 
    fontSize: '1rem',
    transition: 'border-color 0.3s'
  },
  btn: { 
    padding: '1rem', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '1rem', 
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s'
  },
  text: { textAlign: 'center', color: '#666', marginBottom: '1rem' },
  link: { color: '#667eea', fontWeight: 'bold', textDecoration: 'none' },
  demo: { 
    marginTop: '1.5rem', 
    padding: '1.2rem', 
    background: '#f8f9fa', 
    borderRadius: '8px', 
    border: '1px solid #e0e0e0'
  },
  demoTitle: { marginBottom: '0.8rem', textAlign: 'center', color: '#2c3e50' },
  demoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' },
  demoItem: { textAlign: 'center', padding: '0.5rem' },
  demoText: { fontSize: '0.8rem', color: '#666', margin: '0.2rem 0' }
};

export default Login;
