import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPros = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://hfe-production.up.railway.app/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPros(res.data.allPros || []);
    } catch (err) {
      console.error("Admin fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPros(); }, []);

  const handleApprove = async (id) => {
    // Your existing approve logic
    alert("Professional Approved!");
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Admin Panel...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage Professionals and verify accounts.</p>
      </header>

      <div style={styles.grid}>
        {pros.map(pro => {
          const data = pro.professional || pro;
          // LOGIC FIX: If rating is 0 or null, show 0.0, not 5.0
          const displayRating = data.rating && data.rating > 0 ? Number(data.rating).toFixed(1) : "0.0";
          const reviewCount = data.reviewCount || 0;

          return (
            <div key={pro._id} style={styles.card}>
              <div style={styles.statusBadge}>
                {data.isVerified ? "✅ VERIFIED" : "⏳ PENDING APPROVAL"}
              </div>
              
              <h3 style={styles.name}>{data.businessName || data.name}</h3>
              <p style={styles.email}>{pro.email}</p>
              
              <div style={styles.statsRow}>
                <div style={styles.statItem}>
                  <span>Jobs</span>
                  <strong>{data.dailyRequestCount || 0}/3</strong>
                </div>
                <div style={styles.statItem}>
                  <span>Rating</span>
                  {/* FIXED RATING DISPLAY */}
                  <strong>⭐ {displayRating} ({reviewCount})</strong>
                </div>
              </div>

              <div style={styles.actions}>
                {!data.isVerified && (
                  <button onClick={() => handleApprove(pro._id)} style={styles.approveBtn}>
                    Approve Professional
                  </button>
                )}
                <button style={styles.deleteBtn}>Delete Permanently</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
  statusBadge: { fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '10px' },
  name: { fontSize: '1.2rem', fontWeight: '800', margin: '0 0 5px 0' },
  email: { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
  statItem: { display: 'flex', flexDirection: 'column', fontSize: '12px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  approveBtn: { padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  deleteBtn: { padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};