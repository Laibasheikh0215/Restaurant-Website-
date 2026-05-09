import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function EventGuestManagement({ bookingId, fetchData }) {
    const [guests, setGuests] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGuest, setNewGuest] = useState({
        name: '',
        email: '',
        phone: '',
        dietary_restrictions: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (bookingId) {
            fetchGuests();
        }
    }, [bookingId]);

    const fetchGuests = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/event-bookings/${bookingId}/guests`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setGuests(response.data);
        } catch (error) {
            console.error('Error fetching guests:', error);
        }
    };

    const handleAddGuest = async (e) => {
        e.preventDefault();
        if (!newGuest.name) {
            toast.error('Guest name is required');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/event-bookings/${bookingId}/guests`,
                newGuest,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            
            if (response.data.success) {
                toast.success('Guest added successfully!');
                setNewGuest({
                    name: '',
                    email: '',
                    phone: '',
                    dietary_restrictions: ''
                });
                setShowAddForm(false);
                fetchGuests();
                if (fetchData) fetchData();
            }
        } catch (error) {
            toast.error('Failed to add guest');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (window.confirm('Are you sure you want to remove this guest?')) {
            try {
                await axios.delete(`http://localhost:5000/api/event-guests/${guestId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                toast.success('Guest removed');
                fetchGuests();
                if (fetchData) fetchData();
            } catch (error) {
                toast.error('Failed to remove guest');
            }
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4>👥 Guest List ({guests.length})</h4>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        background: '#4c1d95',
                        color: 'white',
                        padding: '8px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    + Add Guest
                </button>
            </div>
            
            {showAddForm && (
                <form onSubmit={handleAddGuest} style={{
                    background: '#f3f4f6',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '15px'
                }}>
                    <input
                        type="text"
                        placeholder="Guest Name *"
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newGuest.email}
                        onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <textarea
                        placeholder="Dietary Restrictions"
                        value={newGuest.dietary_restrictions}
                        onChange={(e) => setNewGuest({...newGuest, dietary_restrictions: e.target.value})}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '60px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" disabled={loading} style={{ background: '#10b981', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            {loading ? 'Adding...' : 'Add Guest'}
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} style={{ background: '#6b7280', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            
            {guests.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No guests added yet</p>
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {guests.map(guest => (
                        <div key={guest.id} style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '10px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ×
                            </button>
                            <div><strong>{guest.name}</strong></div>
                            {guest.email && <div style={{ fontSize: '12px', color: '#6b7280' }}>📧 {guest.email}</div>}
                            {guest.phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>📞 {guest.phone}</div>}
                            {guest.dietary_restrictions && (
                                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '5px' }}>
                                    🍽️ {guest.dietary_restrictions}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EventGuestManagement;