import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "customer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
  };

  const handleUpdate = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (response.data.success) {
        toast.success("User updated successfully");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update user");
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`))
      return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading users...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: "32px" }}>👥 User Management</h1>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Total Users: {users.length}
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "15px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Joined</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  {editingUser === user.id ? (
                    <>
                      <td style={{ padding: "12px" }}>#{user.id}</td>
                      <td style={{ padding: "12px" }}>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                            width: "120px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                            width: "150px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                            width: "100px",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px" }}>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ddd",
                          }}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => handleUpdate(user.id)}
                          style={{
                            background: "#10b981",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          style={{
                            background: "#6b7280",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: "12px" }}>#{user.id}</td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {user.full_name}
                      </td>
                      <td style={{ padding: "12px" }}>{user.email}</td>
                      <td style={{ padding: "12px" }}>{user.phone || "-"}</td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            background:
                              user.role === "admin" ? "#ef4444" : "#10b981",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "12px",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "5px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.full_name)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
