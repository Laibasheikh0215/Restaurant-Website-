import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EventCalendar({ onDateSelect }) {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedDate && events.length > 0) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const filtered = events.filter(event => event.start === dateStr);
            setSelectedDateEvents(filtered);
        }
    }, [selectedDate, events]);

    const fetchEvents = async () => {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6);
            
            const response = await axios.get(
                `http://localhost:5000/api/event-bookings/calendar?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
            );
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ HANDLE DATE CLICK FUNCTION
    const handleDateClick = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (onDateSelect) {
            onDateSelect(dateStr);
        }
        setSelectedDate(date);
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = events.filter(event => event.start === dateStr);
            
            if (dayEvents.length > 0) {
                return (
                    <div style={{ 
                        background: '#4c1d95', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '20px', 
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        fontSize: '10px',
                        marginTop: '5px'
                    }}>
                        {dayEvents.length}
                    </div>
                );
            }
        }
        return null;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading calendar...</div>;

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📅 Event Calendar</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* ✅ CALENDAR WITH handleDateClick */}
                <Calendar
                    onChange={handleDateClick}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="event-calendar"
                />
                
                <div>
                    <h4 style={{ marginBottom: '15px' }}>
                        Events on {selectedDate.toDateString()}
                    </h4>
                    {selectedDateEvents.length === 0 ? (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                            No events scheduled on this date
                        </p>
                    ) : (
                        selectedDateEvents.map(event => (
                            <div
                                key={event.id}
                                style={{
                                    background: '#f3f4f6',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/event-details/${event.id}`)}
                            >
                                <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    📍 {event.location} | 👥 {event.guests} guests
                                </div>
                                <div style={{ fontSize: '12px', color: '#4c1d95' }}>
                                    💰 ${event.total_amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <style>
                {`
                    .event-calendar {
                        border: none;
                        width: 100%;
                    }
                    .event-calendar .react-calendar__tile {
                        padding: 10px;
                    }
                    .event-calendar .react-calendar__tile--active {
                        background: #4c1d95;
                        color: white;
                    }
                `}
            </style>
        </div>
    );
}

export default EventCalendar;