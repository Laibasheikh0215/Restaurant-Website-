import React from 'react';

function TableLayout({ bookings, selectedDate, selectedTime }) {
    const tables = [
        { number: 1, capacity: 2, type: 'window', shape: 'circle' },
        { number: 2, capacity: 2, type: 'window', shape: 'circle' },
        { number: 3, capacity: 4, type: 'standard', shape: 'square' },
        { number: 4, capacity: 4, type: 'standard', shape: 'square' },
        { number: 5, capacity: 4, type: 'standard', shape: 'square' },
        { number: 6, capacity: 6, type: 'booth', shape: 'rectangle' },
        { number: 7, capacity: 6, type: 'booth', shape: 'rectangle' },
        { number: 8, capacity: 8, type: 'private', shape: 'large' },
        { number: 9, capacity: 8, type: 'private', shape: 'large' },
        { number: 10, capacity: 10, type: 'private', shape: 'large' }
    ];
    
    const bookedTableNumbers = bookings?.map(b => b.table_number) || [];
    
    return (
        <div style={{ 
            background: '#f3f4f6', 
            borderRadius: '15px', 
            padding: '20px',
            border: '2px solid #e5e7eb',
            marginTop: '20px'
        }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>🗺️ Restaurant Table Layout</h3>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
                📅 {selectedDate} {selectedTime && `at ${selectedTime}`}
            </p>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '30px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {tables.map(table => {
                    const isBooked = bookedTableNumbers.includes(table.number);
                    
                    return (
                        <div
                            key={table.number}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '15px',
                                background: isBooked ? '#fef3c7' : '#ffffff',
                                border: isBooked ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                                borderRadius: table.shape === 'circle' ? '50%' : '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: isBooked ? '0 4px 6px rgba(245, 158, 11, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '30px' }}>
                                {table.type === 'window' ? '🪑' : table.type === 'booth' ? '🛋️' : '🍽️'}
                            </div>
                            <div style={{ fontWeight: 'bold', marginTop: '5px' }}>Table {table.number}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{table.capacity} seats</div>
                            {isBooked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    📍
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Legend */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#ffffff', border: '2px solid #e5e7eb', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '12px' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '12px' }}>Booked</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🪑</span>
                    <span style={{ fontSize: '12px' }}>2-Seater</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🛋️</span>
                    <span style={{ fontSize: '12px' }}>Booth (6 seats)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🍽️</span>
                    <span style={{ fontSize: '12px' }}>4-8 Seater</span>
                </div>
            </div>
        </div>
    );
}

export default TableLayout;