import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: "",
    description: "",
    price_per_person: 25,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/event-locations",
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingLocation) {
        // Update existing location
        await axios.put(
          `http://localhost:5000/api/admin/event-locations/${editingLocation.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success("Location updated successfully!");
      } else {
        // Add new location
        await axios.post(
          "http://localhost:5000/api/admin/event-locations",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        toast.success("Location added successfully!");
      }

      setShowForm(false);
      setEditingLocation(null);
      setFormData({
        name: "",
        address: "",
        capacity: "",
        description: "",
        price_per_person: 25,
      });
      fetchLocations();
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error(error.response?.data?.error || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      capacity: location.capacity,
      description: location.description || "",
      price_per_person: location.price_per_person || 25,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/event-locations/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      toast.success(response.data.message || "Location deleted");
      fetchLocations();
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error(error.response?.data?.error || "Failed to delete location");
    }
  };

  if (loading && locations.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: "32px" }}>Manage Event Locations 📍</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingLocation(null);
              setFormData({
                name: "",
                address: "",
                capacity: "",
                description: "",
                price_per_person: 25,
              });
            }}
            style={{
              background: "#4c1d95",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + Add New Location
          </button>
        </div>

        {/* Add/Edit Location Form */}
        {showForm && (
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              marginBottom: "30px",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>
              {editingLocation ? "Edit Location" : "Add New Location"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Price per Person ($)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={formData.price_per_person}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_person: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="2"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#4c1d95",
                    color: "white",
                    padding: "12px 30px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Saving..." : editingLocation ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLocation(null);
                  }}
                  style={{
                    background: "#6b7280",
                    color: "white",
                    padding: "12px 30px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        <div style={{ display: "grid", gap: "20px" }}>
          {locations.map((location) => (
            <div
              key={location.id}
              style={{
                background: "white",
                borderRadius: "15px",
                padding: "25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
                  {location.name}
                </h3>
                <p style={{ color: "#6b7280", marginBottom: "5px" }}>
                  {location.address}
                </p>
                <p style={{ color: "#4c1d95", fontWeight: "bold" }}>
                  Capacity: {location.capacity} guests
                </p>
                <p style={{ fontSize: "14px", color: "#10b981" }}>
                  Price: ${location.price_per_person || 25}/person
                </p>
                {!location.is_active && (
                  <p style={{ color: "#ef4444", fontSize: "12px" }}>
                    ⚠️ Inactive
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(location)}
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(location.id, location.name)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              background: "white",
              borderRadius: "15px",
            }}
          >
            <p>
              No locations added yet. Click "Add New Location" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLocations;
