import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/admin/menu/${editingItem.id}`, formData);
        toast.success('Menu item updated!');
      } else {
        await axios.post('http://localhost:5000/api/admin/menu', formData);
        toast.success('Menu item added!');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category: '', image_url: '' });
      fetchMenu();
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/menu/${id}`);
        toast.success('Menu item deleted!');
        fetchMenu();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const categories = ['Pizza', 'Burgers', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px' }}>Manage Menu 🍕</h1>
          <button onClick={() => { setShowForm(true); setEditingItem(null); setFormData({ name: '', description: '', price: '', category: '', image_url: '' }); }} style={{ background: '#4c1d95', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            + Add New Item
          </button>
        </div>
        
        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Item Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Image URL (optional)</label>
                <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" style={{ background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} style={{ background: '#6b7280', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        
        {/* Menu Items List */}
        <div style={{ display: 'grid', gap: '15px' }}>
          {menuItems.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '15px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '5px' }}>{item.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>{item.description}</p>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ color: '#4c1d95', fontWeight: 'bold' }}>${item.price}</span>
                  <span style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>{item.category}</span>
                  <span style={{ color: item.is_available ? '#10b981' : '#ef4444', fontSize: '12px' }}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEdit(item)} style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ background: '#ef4444', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminMenu;