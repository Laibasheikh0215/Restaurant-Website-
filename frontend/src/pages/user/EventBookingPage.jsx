import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import EventCalendar from '../../components/EventCalendar';

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

  const handleDateSelect = (date) => {
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
    if (!bookingData.booking_date) {
      toast.error('Please select a date');
      return;
    }
    if (isDateBooked(bookingData.booking_date)) {
      toast.error('This date is already booked');
      return;
    }
    
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

  // Step 1: Location Selection
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Book an Event 🎉</h1>
          
          {/* Calendar Component */}
          <div style={{ marginBottom: '30px' }}>
            <EventCalendar onDateSelect={handleDateSelect} />
          </div>
          
          {/* Selected Date Display */}
          {bookingData.booking_date && (
            <div style={{ 
              background: '#e0e7ff', 
              padding: '15px', 
              borderRadius: '10px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>📅 Selected Date: </span>
              <span>{bookingData.booking_date}</span>
              <button 
                onClick={() => setBookingData({ ...bookingData, booking_date: '' })}
                style={{ 
                  marginLeft: '10px', 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  padding: '2px 10px', 
                  cursor: 'pointer' 
                }}
              >
                Clear
              </button>
            </div>
          )}
          
          {/* Locations List */}
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
          
          {/* Continue Button */}
          {selectedLocation && bookingData.booking_date && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                onClick={() => setStep(2)} 
                style={{ 
                  background: '#4c1d95', 
                  color: 'white', 
                  padding: '15px 40px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Continue to Booking Details →
              </button>
            </div>
          )}
          
          {selectedLocation && !bookingData.booking_date && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <p style={{ color: '#f59e0b' }}>⚠️ Please select a date from the calendar above</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Event Details (No date picker - only readonly)
  if (step === 2) {
    const location = locations.find(l => l.id === selectedLocation);
    
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '30px' }}>Event Details</h1>
          
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Selected Date - Readonly (No date picker) */}
            <div style={{ 
              marginBottom: '20px', 
              background: '#ecfdf5', 
              padding: '15px', 
              borderRadius: '10px',
              border: '1px solid #10b981'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>📅 Selected Date: </span>
                  <span style={{ color: '#4c1d95', fontWeight: 'bold' }}>{bookingData.booking_date}</span>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  style={{ 
                    background: '#4c1d95', 
                    color: 'white', 
                    padding: '5px 15px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Change Date
                </button>
              </div>
              {isDateBooked(bookingData.booking_date) && (
                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '10px', marginBottom: 0 }}>
                  ❌ This date is already booked for this location. Please go back and select another date.
                </p>
              )}
            </div>
            
            {/* Event Name */}
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
            
            {/* Number of Guests */}
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
            
            {/* Price Summary */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Price per guest:</span>
                <span>$25</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#4c1d95' }}>${bookingData.total_amount}</span>
              </div>
            </div>
            
            {/* Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  border: '1px solid #4c1d95', 
                  background: 'white', 
                  color: '#4c1d95', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!bookingData.event_name || isDateBooked(bookingData.booking_date) || loading}
                style={{ 
                  flex: 1, 
                  background: (!bookingData.event_name || isDateBooked(bookingData.booking_date)) ? '#9ca3af' : '#4c1d95', 
                  color: 'white', 
                  padding: '12px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: (!bookingData.event_name || isDateBooked(bookingData.booking_date)) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success Message
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '15px', padding: '40px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: '60px' }}>🎉</span>
        <h2 style={{ marginTop: '20px', color: '#4c1d95' }}>Event Booked Successfully!</h2>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>A confirmation email has been sent to your email address.</p>
        <p style={{ fontSize: '14px', color: '#10b981', marginTop: '10px' }}>
          📍 Location: {locations.find(l => l.id === selectedLocation)?.name}
        </p>
        <p style={{ fontSize: '14px', color: '#10b981' }}>
          📅 Date: {bookingData.booking_date} | 👥 Guests: {bookingData.number_of_guests}
        </p>
        <button 
          onClick={() => window.location.href = '/'} 
          style={{ 
            marginTop: '30px', 
            background: '#4c1d95', 
            color: 'white', 
            padding: '12px 30px', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default EventBookingPage;