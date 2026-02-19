import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function ProDashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  // Memoized fetch to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, profileRes] = await Promise.all([
        axios.get('https://tsbe-production.up.railway.app/api/bookings/my-bookings', { headers }),
        axios.get('https://tsbe-production.up.railway.app/api/pros/profile', { headers })
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // LOGIC FIX: Sending 'accepted' instead of 'approved' to satisfy Backend Enum
      await axios.patch('https://tsbe-production.up.railway.app/api/bookings/update-status', 
        { 
          bookingId: bookingId, 
          status: newStatus 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification(`Request ${newStatus} successfully!`);
      fetchData(); 
    } catch (err) {
      console.error("400 Error Details:", err.response?.data);
      showNotification(err.response?.data?.message || "Update failed", "error");
    }
  };

  if (loading) return <div style={styles.loader}>Opening Professional Workspace...</div>;

  const isVerified = user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={styles.container}>
      {/* Centered Header Section */}
      <header style={styles.header}>
        <h1 style={styles.title}>Professional Workspace</h1>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>Manage your incoming hire requests and track your status.</p>
      </header>

      {/* Notification Toast */}
      {notification.msg && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981'
        }}>
          {notification.msg}
        </div>
      )}

      <div style={styles.layoutGrid}>
        {/* Main Section: Requests */}
        <div style={styles.mainCard}>
          <h3 style={styles.cardTitle}>Incoming Requests</h3>
          
          {bookings.length > 0 ? (
            bookings.map((req) => (
              <div key={req._id} style={{
                ...styles.requestItem,
                borderLeft: req.status === 'accepted' ? '6px solid #10b981' : req.status === 'rejected' ? '6px solid #ef4444' : '6px solid #f59e0b'
              }}>
                <div style={styles.itemContent}>
                  <div>
                    <p style={styles.clientName}><strong>Customer:</strong> {req.client?.name || 'Client'}</p>
                    <p style={styles.clientEmail}>{req.client?.email}</p>
                    <p style={styles.statusLabel}>
                      Status: <span style={{ color: req.status === 'accepted' ? '#10b981' : '#64748b', fontWeight: '800' }}>
                        {req.status.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div style={styles.actionGroup}>
                      {isVerified ? (
                        <>
                          {/* KEY FIX: Value is 'accepted' */}
                          <button onClick={() => handleStatusUpdate(req._id, 'accepted')} style={styles.btnAccept}>Accept</button>
                          <button onClick={() => handleStatusUpdate(req._id, 'rejected')} style={styles.btnReject}>Reject</button>
                        </>
                      ) : (
                        <span style={styles.lockedBadge}>Pending Verification</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No requests found at this time.</p>
          )}
        </div>

        {/* Side Section: Profile Status */}
        <aside style={{
          ...styles.sideCard,
          border: isVerified ? '1px solid #e2e8f0' : '2px solid #fbbf24',
          backgroundColor: isVerified ? '#ffffff' : '#fffdfa'
        }}>
          <h3 style={styles.sideTitle}>Account Status</h3>
          <div style={{ 
            color: isVerified ? '#10b981' : '#ea580c', 
            fontWeight: '900',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{isVerified ? '✓' : '●'}</span> 
            {isVerified ? 'VERIFIED' : 'PENDING'}
          </div>
          <hr style={styles.divider} />
          <p style={styles.tipText}>
            {isVerified 
              ? "You are live! Customers in Hargeisa can now see your profile." 
              : "An admin is currently reviewing your documents. Please wait for approval."}
          </p>
        </aside>
      </div>
    </div>
  );
}

// --- Styles with Centering Logic ---
const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', margin: 0 },
  underline: { width: '60px', height: '4px', backgroundColor: '#3b82f6', margin: '12px auto', borderRadius: '10px' },
  subtitle: { color: '#64748b', fontSize: '1.1rem' },
  notification: { position: 'fixed', top: '25px', padding: '12px 30px', color: '#fff', borderRadius: '50px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  layoutGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', width: '100%' },
  mainCard: { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  sideCard: { padding: '25px', borderRadius: '24px', height: 'fit-content' },
  cardTitle: { margin: '0 0 25px 0', fontSize: '1.4rem', color: '#1e293b' },
  requestItem: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '15px', border: '1px solid #f1f5f9' },
  itemContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { margin: 0, fontSize: '1.1rem', color: '#1e293b' },
  clientEmail: { margin: '2px 0', fontSize: '0.85rem', color: '#64748b' },
  statusLabel: { margin: '8px 0 0 0', fontSize: '0.85rem' },
  actionGroup: { display: 'flex', gap: '10px' },
  btnAccept: { padding: '10px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  btnReject: { padding: '10px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  lockedBadge: { color: '#f59e0b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' },
  sideTitle: { margin: '0 0 10px 0', fontSize: '1.1rem' },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' },
  tipText: { fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: '40px' },
  loader: { textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#64748b' }
};
