import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────*/
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .au-page  { animation: fadeSlideUp 0.6s ease 0.05s both; }
  .au-row-0 { animation: fadeSlideUp 0.5s ease 0.1s  both; }
  .au-row-1 { animation: fadeSlideUp 0.5s ease 0.18s both; }

  .au-table-row {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    transition: background 0.15s;
  }
  .au-table-row:last-child { border-bottom: none; }
  .au-table-row:hover { background: rgba(255,255,255,0.025); }

  .au-input {
    padding: 8px 12px;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .au-input::placeholder { color: rgba(255,255,255,0.3); }
  .au-input:focus { border-color: #E8441A; background: rgba(232,68,26,0.06); }
  .au-input option { background: #1a1a1a; color: #fff; }

  .au-btn-edit {
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: rgba(59,130,246,0.15);
    color: #60a5fa;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .au-btn-edit:hover { background: rgba(59,130,246,0.3); color: #93c5fd; }

  .au-btn-delete {
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: rgba(239,68,68,0.12);
    color: #f87171;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .au-btn-delete:hover { background: rgba(239,68,68,0.25); color: #fca5a5; }

  .au-btn-save {
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: rgba(16,185,129,0.15);
    color: #34d399;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .au-btn-save:hover { background: rgba(16,185,129,0.3); color: #6ee7b7; }

  .au-btn-cancel {
    padding: 6px 14px;
    border: none;
    border-radius: 8px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.5);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .au-btn-cancel:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

  .au-th {
    padding: 12px 16px;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    white-space: nowrap;
  }

  .au-td {
    padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    vertical-align: middle;
  }
`;

const ROLE_COLORS = {
  admin: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  staff: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  customer: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
};

function RoleBadge({ role }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.customer;
  return (
    <span style={{
      background: colors.bg,
      color: colors.color,
      padding: '3px 10px',
      borderRadius: '50px',
      fontFamily: "'DM Sans',sans-serif",
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }}>
      {role}
    </span>
  );
}

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

  // Inject CSS
  useEffect(() => {
    if (document.getElementById('au-css')) return;
    const s = document.createElement('style');
    s.id = 'au-css';
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => { const el = document.getElementById('au-css'); if (el) el.remove(); };
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
    setFormData({ full_name: user.full_name, email: user.email, phone: user.phone || "", role: user.role });
  };

  const handleUpdate = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(232,68,26,0.2)', borderTopColor: '#E8441A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading users…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans',sans-serif", color: '#fff', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="au-page">

        {/* Header */}
        <div className="au-row-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase', color: '#E8441A', marginBottom: '8px' }}>
              Admin Panel
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,3vw,38px)', fontWeight: '700', color: '#fff', lineHeight: '1.1' }}>
              User <span style={{ color: '#E8441A', fontStyle: 'italic' }}>Management</span>
            </h1>
          </div>
          <div style={{ padding: '10px 20px', background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            👥 &nbsp;<strong style={{ color: '#fff' }}>{users.length}</strong> &nbsp;Total Users
          </div>
        </div>

        {/* Table card */}
        <div className="au-row-1" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  {['ID', 'Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="au-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="au-table-row">
                    {editingUser === user.id ? (
                      <>
                        <td className="au-td" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>#{user.id}</td>
                        <td className="au-td">
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="au-input"
                            style={{ minWidth: '130px' }}
                          />
                        </td>
                        <td className="au-td">
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="au-input"
                            style={{ minWidth: '170px' }}
                          />
                        </td>
                        <td className="au-td">
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="au-input"
                            style={{ minWidth: '110px' }}
                            placeholder="—"
                          />
                        </td>
                        <td className="au-td">
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="au-input"
                            style={{ minWidth: '100px' }}
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                          </select>
                        </td>
                        <td className="au-td" style={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="au-td">
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="au-btn-save" onClick={() => handleUpdate(user.id)}>Save</button>
                            <button className="au-btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="au-td" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '600' }}>#{user.id}</td>
                        <td className="au-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Avatar */}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8441A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                              {user.full_name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <span style={{ fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>{user.full_name}</span>
                          </div>
                        </td>
                        <td className="au-td">{user.email}</td>
                        <td className="au-td" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.phone || '—'}</td>
                        <td className="au-td"><RoleBadge role={user.role} /></td>
                        <td className="au-td" style={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="au-td">
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="au-btn-edit" onClick={() => handleEdit(user)}>Edit</button>
                            <button className="au-btn-delete" onClick={() => handleDelete(user.id, user.full_name)}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '40px', marginBottom: '14px' }}>👥</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fff', marginBottom: '6px' }}>No users found</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Users will appear here once they register.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;