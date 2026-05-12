import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, menuItems]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
      const cats = [...new Set(response.data.map(item => item.category))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...menuItems];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Voice Search Function
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onstart = () => {
      console.log('Voice recognition started. Speak now...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Recognized text:', transcript);
      setSearchTerm(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice search.');
      } else if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading menu...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '20px' }}>Our Menu 🍽️</h1>
        
        {/* Search Bar with Voice */}
        <div style={{ 
          maxWidth: '500px', 
          margin: '0 auto 30px auto',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            background: 'white',
            borderRadius: '50px',
            padding: '5px 5px 5px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            alignItems: 'center'
          }}>
            {/* Search Icon */}
            <span style={{ fontSize: '18px', color: '#9ca3af' }}>🔍</span>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 0',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                background: 'transparent'
              }}
            />
            
            {/* Voice Search Button */}
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              style={{
                background: isListening ? '#10b981' : '#4c1d95',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
              title="Voice Search"
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            
            {/* Clear Button */}
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6b7280',
                  padding: '0 10px'
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Listening Indicator */}
          {isListening && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              padding: '8px',
              background: '#f0fdf4',
              borderRadius: '20px',
              color: '#166534',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🎤</span>
              <span>Listening... Speak now</span>
              <span style={{ fontSize: '12px', animation: 'pulse 1s infinite' }}>●</span>
            </div>
          )}
          
          {/* Search Results Count */}
          {searchTerm && !isListening && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '10px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Found {filteredItems.length} item(s) for "{searchTerm}"
            </div>
          )}
        </div>
        
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedCategory('all')} 
            style={{ 
              padding: '8px 20px', 
              background: selectedCategory === 'all' ? '#4c1d95' : '#e5e7eb', 
              color: selectedCategory === 'all' ? 'white' : '#333', 
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              style={{ 
                padding: '8px 20px', 
                background: selectedCategory === cat ? '#4c1d95' : '#e5e7eb', 
                color: selectedCategory === cat ? 'white' : '#333', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* No Results Message */}
        {filteredItems.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            background: 'white',
            borderRadius: '15px'
          }}>
            <span style={{ fontSize: '60px' }}>🍽️</span>
            <h3 style={{ marginTop: '20px', color: '#4c1d95' }}>No items found</h3>
            <p style={{ color: '#6b7280' }}>Try searching with different keywords or use voice search 🎤</p>
            <button 
              onClick={clearSearch}
              style={{
                marginTop: '20px',
                background: '#4c1d95',
                color: 'white',
                padding: '10px 30px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        )}
        
        {/* Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}>
              <div style={{ height: '180px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: '60px' }}>🍕</span>
                {/* Highlight if searched */}
                {searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    Match
                  </div>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{item.name}</h3>
                <p style={{ color: '#6b7280', marginBottom: '15px', minHeight: '60px' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4c1d95' }}>${item.price}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      background: '#4c1d95', 
                      color: 'white', 
                      padding: '8px 20px', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Add to Cart 🛒
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS for animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default MenuPage;