import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/event-locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/event-locations', formData);
      toast.success('Location added successfully!');
      setShowForm(false);
      setFormData({ name: '', address: '', capacity: '' });
      fetchLocations();
    } catch (error) {
      toast.error('Failed to add location');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/event-locations/${id}`);
        toast.success('Location deleted!');
        fetchLocations();
      } catch (error) {
        toast.error('Failed to delete location');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px' }}>Manage Event Locations 📍</h1>
          <button onClick={() => setShowForm(true)} style={{ background: '#4c1d95', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            + Add New Location
          </button>
        </div>
        
        {/* Add Location Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Event Location</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Capacity (max guests)</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} required />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" style={{ background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add Location</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#6b7280', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        
        {/* Locations List */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {locations.map(location => (
            <div key={location.id} style={{ background: 'white', borderRadius: '15px', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{location.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '5px' }}>{location.address}</p>
                <p style={{ color: '#4c1d95', fontWeight: 'bold' }}>Capacity: {location.capacity} guests</p>
              </div>
              <div>
                <button onClick={() => handleDelete(location.id)} style={{ background: '#ef4444', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        
        {locations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
            <p>No locations added yet. Click "Add New Location" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLocations;