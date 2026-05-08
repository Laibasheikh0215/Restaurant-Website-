import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function EventBookingPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bookingData, setBookingData] = useState({
    event_location_id: '',
    booking_date: '',
    event_name: '',
    number_of_guests: 1,
    total_amount: 0
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation && bookingData.booking_date) {
      checkAvailability();
    }
  }, [selectedLocation, bookingData.booking_date]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/event-locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/event-locations/${selectedLocation}/availability`);
      setBookedDates(response.data.booked_dates);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const calculateTotal = (guests, locationId) => {
    const location = locations.find(l => l.id === locationId);
    if (!location) return 0;
    // Base price per guest (you can modify this)
    const pricePerGuest = 25;
    return guests * pricePerGuest;
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.id);
    setBookingData({
      ...bookingData,
      event_location_id: location.id,
      total_amount: calculateTotal(bookingData.number_of_guests, location.id)
    });
  };

  const handleDateChange = (date) => {
    setBookingData({
      ...bookingData,
      booking_date: date,
      total_amount: calculateTotal(bookingData.number_of_guests, selectedLocation)
    });
  };

  const handleGuestsChange = (guests) => {
    setBookingData({
      ...bookingData,
      number_of_guests: guests,
      total_amount: calculateTotal(guests, selectedLocation)
    });
  };

  const isDateBooked = (date) => {
    return bookedDates.includes(date);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/event-bookings', bookingData);
      
      if (response.data.success) {
        toast.success('Event booked successfully! Check your email.');
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Book an Event 🎉</h1>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {locations.map(location => (
              <div
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '25px',
                  cursor: 'pointer',
                  border: selectedLocation === location.id ? '2px solid #4c1d95' : '1px solid #e5e7eb',
                  transition: 'all 0.3s'
                }}
              >
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{location.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '5px' }}>{location.address}</p>
                <p style={{ color: '#6b7280' }}>Capacity: {location.capacity} guests</p>
              </div>
            ))}
          </div>
          
          {selectedLocation && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button onClick={() => setStep(2)} style={{ background: '#4c1d95', color: 'white', padding: '15px 40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Continue to Booking Details →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 2) {
    const location = locations.find(l => l.id === selectedLocation);
    
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Event Details</h1>
          
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Event Name</label>
              <input
                type="text"
                placeholder="e.g., Birthday Party, Wedding Reception, Corporate Event"
                value={bookingData.event_name}
                onChange={(e) => setBookingData({ ...bookingData, event_name: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date</label>
              <input
                type="date"
                min={minDate}
                max={maxDateStr}
                value={bookingData.booking_date}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              {bookingData.booking_date && isDateBooked(bookingData.booking_date) && (
                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                  ❌ This date is already booked for this location
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Number of Guests</label>
              <input
                type="number"
                min="1"
                max={location?.capacity}
                value={bookingData.number_of_guests}
                onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                required
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>Maximum capacity: {location?.capacity} guests</p>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Price per guest:</span>
                <span>$25</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Total Amount:</span>
                <span>${bookingData.total_amount}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', border: '1px solid #4c1d95', background: 'white', color: '#4c1d95', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
              <button
                onClick={handleSubmit}
                disabled={!bookingData.booking_date || !bookingData.event_name || isDateBooked(bookingData.booking_date) || loading}
                style={{ flex: 1, background: '#4c1d95', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
        <span style={{ fontSize: '60px' }}>🎉</span>
        <h2 style={{ marginTop: '20px' }}>Event Booked Successfully!</h2>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>A confirmation email has been sent to your email address.</p>
        <button onClick={() => window.location.href = '/'} style={{ marginTop: '30px', background: '#4c1d95', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go to Home</button>
      </div>
    </div>
  );
}

export default EventBookingPage;