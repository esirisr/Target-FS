import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AdminCard from '../components/AdminCard';

export default function AdminDashboard() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      setPros(res.data.allPros || []);
    } catch (err) {
      console.error("Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, type) => {
    if (type === 'delete' && !window.confirm("Delete this professional?")) {
      return;
    }

    try {
      await API.post(`/admin/${type}`, { id });
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        Loading Admin Console...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a' }}>
          Management Console
        </h1>
        <p style={{ color: '#64748b' }}>
          Manage Users, Pros, and Site Analytics.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        {pros.map((pro) => (
          <AdminCard
            key={pro._id}
            pro={pro}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
}
