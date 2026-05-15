import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// GLOBAL CSS IN JS
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes formSlide {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .admin-menu { animation: fadeIn 0.4s ease both; font-family: 'DM Sans', sans-serif; }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 26px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    background: #E8441A;
    color: #fff;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(232,68,26,0.35);
  }
  .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,68,26,0.5); }

  .form-panel {
    background: #141414;
    border: 1px solid rgba(232,68,26,0.2);
    border-radius: 20px;
    padding: 36px;
    margin-bottom: 32px;
    animation: formSlide 0.35s ease both;
  }

  .dark-input, .dark-select, .dark-textarea {
    width: 100%;
    padding: 13px 18px;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .dark-input::placeholder,
  .dark-textarea::placeholder { color: rgba(255,255,255,0.25); }
  .dark-input:focus,
  .dark-select:focus,
  .dark-textarea:focus { border-color: #E8441A; background: rgba(232,68,26,0.05); }
  .dark-select option { background: #1a1a1a; color: #fff; }
  .dark-textarea { resize: vertical; }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 8px;
  }

  .submit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    padding: 13px 32px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    background: #E8441A;
    color: #fff;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 16px rgba(232,68,26,0.3);
  }
  .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,68,26,0.45); }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .cancel-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 13px 32px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.12);
    cursor: pointer;
    background: transparent;
    color: rgba(255,255,255,0.6);
    transition: border-color 0.2s, color 0.2s;
  }
  .cancel-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

  .menu-card {
    background: #141414;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 22px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeSlideUp 0.5s ease both;
  }
  .menu-card:hover { border-color: rgba(232,68,26,0.2); transform: translateY(-2px); }

  .toggle-btn-enable {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(52,211,153,0.3);
    cursor: pointer;
    background: rgba(16,185,129,0.08);
    color: #34d399;
    transition: all 0.2s;
  }
  .toggle-btn-enable:hover { background: rgba(16,185,129,0.18); border-color: #34d399; }

  .toggle-btn-disable {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(245,158,11,0.3);
    cursor: pointer;
    background: rgba(245,158,11,0.08);
    color: #f59e0b;
    transition: all 0.2s;
  }
  .toggle-btn-disable:hover { background: rgba(245,158,11,0.18); border-color: #f59e0b; }

  .edit-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(96,165,250,0.3);
    cursor: pointer;
    background: rgba(96,165,250,0.08);
    color: #60a5fa;
    transition: all 0.2s;
  }
  .edit-btn:hover { background: rgba(96,165,250,0.18); border-color: #60a5fa; }

  .delete-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(248,113,113,0.25);
    cursor: pointer;
    background: rgba(239,68,68,0.08);
    color: #f87171;
    transition: all 0.2s;
  }
  .delete-btn:hover { background: rgba(239,68,68,0.18); border-color: #f87171; }

  .category-chip {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 4px 10px;
    color: rgba(255,255,255,0.45);
  }

  .avail-badge-on  { font-size: 12px; font-weight: 700; color: #34d399; }
  .avail-badge-off { font-size: 12px; font-weight: 700; color: #f87171; }

  .upload-zone {
    width: 100%;
    padding: 18px;
    background: rgba(255,255,255,0.03);
    border: 1.5px dashed rgba(255,255,255,0.12);
    border-radius: 12px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    text-align: center;
  }
  .upload-zone:hover { border-color: rgba(232,68,26,0.4); background: rgba(232,68,26,0.04); }

  .toggle-checkbox {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }
  .toggle-checkbox input { display: none; }
  .toggle-track {
    width: 40px; height: 22px;
    border-radius: 11px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.2s;
    position: relative;
    flex-shrink: 0;
  }
  .toggle-track.on { background: #E8441A; border-color: #E8441A; }
  .toggle-thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .toggle-track.on .toggle-thumb { left: 20px; }

  .empty-state {
    background: #141414;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 72px 40px;
    text-align: center;
    color: rgba(255,255,255,0.25);
    font-size: 14px;
    animation: fadeSlideUp 0.5s ease both;
  }
`;

const CATEGORIES = [
  "Pizza",
  "Burgers",
  "Pasta",
  "Salads",
  "Desserts",
  "Beverages",
];

// TOGGLE COMPONENT
function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={`toggle-track${checked ? " on" : ""}`}>
        <span className="toggle-thumb" />
      </span>
      <span
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "14px",
          color: checked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
          fontWeight: "500",
        }}
      >
        {label}
      </span>
    </label>
  );
}

// MAIN COMPONENT
function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_available: true,
  });

  useEffect(() => {
    if (!document.getElementById("admin-menu-css")) {
      const s = document.createElement("style");
      s.id = "admin-menu-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    return () => {
      const el = document.getElementById("admin-menu-css");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);

  /* ── original logic (all unchanged) ── */
 const fetchMenu = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/menu");
        console.log("Full response:", response);
        console.log("Response data:", response.data);
        
        // ✅ Force set menuItems
        if (response.data && Array.isArray(response.data)) {
            setMenuItems(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            setMenuItems(response.data.data);
        } else {
            // Agar kuch aur structure hai to
            setMenuItems([]);
        }
        
        // Debug: Check state after set
        setTimeout(() => {
            console.log("menuItems state after fetch:", menuItems);
        }, 500);
        
    } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Failed to load menu");
    } finally {
        setLoading(false);
    }
};

 const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
    }
    
    const imgFormData = new FormData();  // ✅ Renamed to avoid conflict with state variable
    imgFormData.append('image', file);
    
    setUploading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/admin/upload', imgFormData, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.success) {
            setFormData({ ...formData, image_url: response.data.image_url });
            toast.success('Image uploaded successfully');
        }
    } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
        setUploading(false);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Use formData instead of individual variables
    const submitData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url,
      is_available: formData.is_available,
    };

    // Validate
    if (!submitData.name || !submitData.price) {
      toast.error("Name and price are required");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await axios.put(
          `http://localhost:5000/api/admin/menu/${editingItem.id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success("Menu item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/admin/menu", submitData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Menu item added successfully!");
      }

      setShowForm(false);
      setEditingItem(null);
      // Reset form using setFormData
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        is_available: true,
      });
      fetchMenu(); // Refresh the list
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.error || "Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category || "",
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/menu/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(response.data.message || "Menu item deleted");
      fetchMenu();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete item");
    }
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/menu/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(
        `Item ${response.data.item.is_available ? "available" : "unavailable"}`,
      );
      fetchMenu();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image_url: "",
      is_available: true,
    });
  };

  if (loading && menuItems.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(232,68,26,0.2)",
              borderTopColor: "#E8441A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            Loading menu…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="admin-menu"
      style={{ minHeight: "100vh", background: "#0a0a0a" }}
    >
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0f0f0f 0%,#1a0a04 60%,#0a0a0a 100%)",
          padding: "80px 60px 52px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "10%",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(232,68,26,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#E8441A",
                marginBottom: "14px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Admin Panel
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(34px,4vw,52px)",
                fontWeight: "700",
                color: "#fff",
                lineHeight: "1.08",
                marginBottom: "12px",
              }}
            >
              Manage{" "}
              <span style={{ color: "#E8441A", fontStyle: "italic" }}>
                Menu
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "15px",
                color: "rgba(255,255,255,0.4)",
                maxWidth: "400px",
                lineHeight: "1.7",
              }}
            >
              Add, edit, and control the availability of every item on your
              menu.
            </p>
          </div>
          <button
            className="add-btn"
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                image_url: "",
                is_available: true,
              });
            }}
          >
            <span style={{ fontSize: "16px" }}>+</span> Add New Item
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 60px" }}
      >
        {/* ── FORM PANEL ── */}
        {showForm && (
          <div className="form-panel">
            <div style={{ marginBottom: "28px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#E8441A",
                  marginBottom: "8px",
                }}
              >
                {editingItem ? "Editing" : "New Entry"}
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {editingItem ? "Edit Menu Item" : "Add New Item"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: "20px" }}>
                <label className="field-label">Item Name</label>
                <input
                  type="text"
                  className="dark-input"
                  placeholder="e.g. Spicy Tuna Roll"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label className="field-label">Description</label>
                <textarea
                  className="dark-textarea dark-input"
                  placeholder="Describe the dish..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  required
                />
              </div>

              {/* Price + Category */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label className="field-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="dark-input"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="dark-select dark-input"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label className="field-label">Item Image</label>
                <label className="upload-zone" style={{ display: "block" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  {uploading ? (
                    <span style={{ color: "#E8441A" }}>⏳ Uploading…</span>
                  ) : (
                    <span>📷 Click to upload image</span>
                  )}
                </label>
                {formData.image_url && (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <img
                      src={`http://localhost:5000${formData.image_url}`}
                      alt="Preview"
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: "13px",
                        color: "#34d399",
                      }}
                    >
                      ✓ Image ready
                    </span>
                  </div>
                )}
              </div>

              {/* Availability Toggle (edit mode only) */}
              {editingItem && (
                <div style={{ marginBottom: "24px" }}>
                  <Toggle
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_available: e.target.checked,
                      })
                    }
                    label="Available for order"
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading
                    ? "Saving…"
                    : editingItem
                      ? "Update Item"
                      : "Add Item"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── MENU ITEMS LIST ── */}
        <div style={{ display: "grid", gap: "14px" }}>
          {menuItems.map((item, i) => (
            <div
              key={item.id}
              className="menu-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Left: image + info */}
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {item.image_url ? (
                  <img
                    src={`http://localhost:5000${item.image_url}`}
                    alt={item.name}
                    style={{
                      width: "68px",
                      height: "68px",
                      objectFit: "cover",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.07)",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "14px",
                      background: "rgba(232,68,26,0.08)",
                      border: "1px solid rgba(232,68,26,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      flexShrink: 0,
                    }}
                  >
                    🍽️
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: "4px",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: "10px",
                      lineHeight: "1.5",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "360px",
                    }}
                  >
                    {item.description}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "17px",
                        fontWeight: "700",
                        color: "#E8441A",
                      }}
                    >
                      ${item.price}
                    </span>
                    <span className="category-chip">{item.category}</span>
                    <span
                      className={
                        item.is_available ? "avail-badge-on" : "avail-badge-off"
                      }
                    >
                      {item.is_available ? "✓ Available" : "✗ Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className={
                    item.is_available
                      ? "toggle-btn-disable"
                      : "toggle-btn-enable"
                  }
                  onClick={() =>
                    handleToggleAvailability(item.id, item.is_available)
                  }
                >
                  {item.is_available ? "Disable" : "Enable"}
                </button>
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {menuItems.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🍕</div>
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "20px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "10px",
              }}
            >
              No Menu Items Yet
            </h3>
            <p>Click "Add New Item" above to start building your menu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMenu;
