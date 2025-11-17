import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'snacks',
    price: '',
    isVeg: true,
    availableStock: '',
    imageURL: '',
    isActive: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, formData);
        toast.success('Menu item updated');
      } else {
        await api.post('/menu', formData);
        toast.success('Menu item created');
      }
      resetForm();
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      availableStock: item.availableStock,
      imageURL: item.imageURL,
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu/${id}`);
        toast.success('Menu item deleted');
        fetchMenuItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'snacks',
      price: '',
      isVeg: true,
      availableStock: '',
      imageURL: '',
      isActive: true
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Menu Management</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={styles.input} />
            </div>
            <div>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} style={styles.input}>
                <option value="snacks">Snacks</option>
                <option value="meals">Meals</option>
                <option value="beverages">Beverages</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>
            <div>
              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={styles.input} />
            </div>
            <div>
              <label>Stock</label>
              <input type="number" name="availableStock" value={formData.availableStock} onChange={handleInputChange} required style={styles.input} />
            </div>
          </div>
          <div>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} style={styles.textarea} />
          </div>
          <div>
            <label>Image URL</label>
            <input type="url" name="imageURL" value={formData.imageURL} onChange={handleInputChange} style={styles.input} />
          </div>
          <div style={styles.checkboxGroup}>
            <label>
              <input type="checkbox" name="isVeg" checked={formData.isVeg} onChange={handleInputChange} />
              Vegetarian
            </label>
            <label>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
              Active
            </label>
          </div>
          <button type="submit" style={styles.btnSuccess}>
            {editingItem ? 'Update' : 'Create'} Item
          </button>
        </form>
      )}

      <div style={styles.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id}>
                <td style={styles.td}>{item.name} {item.isVeg ? '🟢' : '🔴'}</td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>₹{item.price}</td>
                <td style={styles.td}>{item.availableStock}</td>
                <td style={styles.td}>
                  <span style={item.isActive ? styles.activeTag : styles.inactiveTag}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(item)} style={styles.btnEdit}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={styles.btnDelete}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  btnPrimary: { padding: '0.8rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  form: { background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' },
  input: { width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.3rem' },
  textarea: { width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.3rem', minHeight: '80px' },
  checkboxGroup: { display: 'flex', gap: '2rem', marginBottom: '1rem' },
  btnSuccess: { width: '100%', padding: '1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  table: { background: 'white', padding: '2rem', borderRadius: '8px' },
  th: { textAlign: 'left', padding: '1rem', background: '#f8f9fa', borderBottom: '2px solid #ddd' },
  td: { padding: '1rem', borderBottom: '1px solid #eee' },
  activeTag: { padding: '0.3rem 0.8rem', background: '#27ae60', color: 'white', borderRadius: '4px', fontSize: '0.85rem' },
  inactiveTag: { padding: '0.3rem 0.8rem', background: '#95a5a6', color: 'white', borderRadius: '4px', fontSize: '0.85rem' },
  btnEdit: { padding: '0.5rem 1rem', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' },
  btnDelete: { padding: '0.5rem 1rem', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default AdminMenuManagement;
