import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from 'lodash';

const MenuItem = memo(({ item, onAddToCart }) => (
    <div style={{ background: 'white', borderRadius: '15px', padding: '20px' }}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <button onClick={() => onAddToCart(item)}>Add to Cart</button>
    </div>
));

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, menuItems]);

  
const debouncedSearch = useCallback(
    debounce((value) => {
        setSearchTerm(value);
    }, 300),
    []
);

const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
};

// Input
<input
    type="text"
    placeholder="Search..."
    onChange={handleSearchChange}
/>

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
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search term (name or description)
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

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading menu...</div>;

  return (
    
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '20px' }}>Our Menu 🍽️</h1>
        
        {/* Search Bar */}
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
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <input
              type="text"
              placeholder="🔍 Search by name or description..."
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
            <button
              onClick={filterItems}
              style={{
                background: '#4c1d95',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '10px 25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Search
            </button>
          </div>
          
          {/* Search Results Count */}
          {searchTerm && (
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
            <p style={{ color: '#6b7280' }}>Try searching with different keywords or clear the search</p>
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
    </div>
  );
}

export default MenuPage;