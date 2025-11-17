import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Registration successful!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🍽️ Create Account</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
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
              placeholder="Enter password (min 6 characters)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? '⏳ Creating Account...' : '✨ Register'}
          </button>
        </form>
        <p style={styles.text}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
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
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    padding: '1rem'
  },
  card: { 
    background: 'white', 
    padding: '2.5rem', 
    borderRadius: '12px', 
    width: '100%',
    maxWidth: '450px',
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
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '1rem', 
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s'
  },
  text: { textAlign: 'center', color: '#666' },
  link: { color: '#f5576c', fontWeight: 'bold', textDecoration: 'none' }
};

export default Register;
