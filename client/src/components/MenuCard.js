import React from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  return (
    <div style={styles.card}>
      <img src={item.imageURL} alt={item.name} style={styles.image} />
      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.title}>{item.name}</h3>
          <span style={styles.badge}>{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
        </div>
        <p style={styles.desc}>{item.description}</p>
        <div style={styles.category}>
          <span style={styles.categoryBadge}>{item.category}</span>
        </div>
        <div style={styles.footer}>
          <span style={styles.price}>₹{item.price}</span>
          <span style={item.availableStock > 10 ? styles.stock : styles.stockLow}>
            Stock: {item.availableStock}
          </span>
        </div>
        <button 
          onClick={() => onAddToCart(item)}
          disabled={item.availableStock === 0 || !item.isActive}
          style={item.availableStock > 0 && item.isActive ? styles.btn : styles.btnDisabled}
        >
          {item.availableStock === 0 ? 'Out of Stock' : !item.isActive ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    overflow: 'hidden', 
    background: 'white',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  content: { padding: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { fontSize: '1.1rem', margin: 0 },
  badge: { fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: '#f8f9fa' },
  desc: { color: '#666', fontSize: '0.85rem', marginBottom: '0.8rem', minHeight: '40px' },
  category: { marginBottom: '0.8rem' },
  categoryBadge: { 
    fontSize: '0.75rem', 
    padding: '0.3rem 0.6rem', 
    background: '#e8f4f8', 
    color: '#3498db',
    borderRadius: '4px',
    textTransform: 'capitalize'
  },
  footer: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' },
  price: { fontSize: '1.3rem', fontWeight: 'bold', color: '#27ae60' },
  stock: { fontSize: '0.85rem', color: '#27ae60', fontWeight: 'bold' },
  stockLow: { fontSize: '0.85rem', color: '#e74c3c', fontWeight: 'bold' },
  btn: { 
    width: '100%', 
    padding: '0.75rem', 
    background: '#27ae60', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    transition: 'background 0.3s'
  },
  btnDisabled: { 
    width: '100%', 
    padding: '0.75rem', 
    background: '#95a5a6', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'not-allowed',
    fontWeight: 'bold',
    fontSize: '0.95rem'
  }
};

export default MenuCard;
