import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  // --- DATA LOADING LOGIC ---
  const loadData = useCallback(async (successMsg = null) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      /**
       * IMPORTANT: We hit '/api/admin/dashboard' because we updated 
       * the backend to allow the 'client' role for this specific route.
       */
      const [res, bookRes] = await Promise.all([
        axios.get('https://tsbe-production.up.railway.app/api/admin/dashboard', { headers }),
        axios.get('https://tsbe-production.up.railway.app/api/bookings/my-bookings', { headers })
      ]);

      // Robust extraction of professional list
      const fetchedPros = res.data.allPros || res.data.pros || (Array.isArray(res.data) ? res.data : []);
      
      // Filter for verified and active pros only
      setPros(fetchedPros.filter(p => p.isVerified && !p.isSuspended));
      setRequests(bookRes.data.bookings || []);
      setError(null);

      if (successMsg) showNotification(successMsg, 'success');
    } catch (err) {
      console.error("Fetch Error Details:", err.response || err);
      
      if (err.response?.status === 403) {
        setError("Access Denied (403): The backend is blocking your 'client' role. Check adminRoutes.js.");
      } else if (err.response?.status === 401) {
        setError("Unauthorized (401): Your token is invalid or expired.");
      } else {
        setError("Network Error: Could not reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- NOTIFICATION HANDLER ---
  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  // --- LIFECYCLE ---
  useEffect(() => { 
    loadData(); 
    const interval = setInterval(() => loadData(), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  // --- RENDER LOADING STATE ---
  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loaderText}>Opening Marketplace...</p>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      {/* SIDEBAR: ACTIVE BOOKINGS */}
      <aside style={styles.sidebar}>
        <div style={styles.hubHeader}>
          <h3 style={styles.hubTitle}>My Requests</h3>
          <div style={styles.liveBadge}>
            <span style={styles.livePulse}></span>
            LIVE
          </div>
        </div>

        <div style={styles.sidebarScrollArea}>
          {requests.length > 0 ? (
            requests.map(req => {
              const skillName = req.professional?.skills?.[0] || 'Expert';
              const isAccepted = req.status === 'accepted';
              
              return (
                <div key={req._id} style={{
                  ...styles.requestCard,
                  borderLeft: isAccepted ? '4px solid #10b981' : '4px solid #cbd5e1'
                }}>
                  <p style={styles.miniLabel}>{skillName.toUpperCase()}</p>
                  <p style={styles.reqProName}>{req.professional?.name}</p>
                  
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: isAccepted ? '#ecfdf5' : '#f8fafc',
                    color: isAccepted ? '#059669' : '#64748b'
                  }}>
                    {req.status?.toUpperCase()}
                  </div>

                  {isAccepted && (
                    <div style={styles.callAlert}>
                      <p style={styles.alertText}>📞 Professional calling soon</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>No active bookings</p>
            </div>
          )}
        </div>
        
        <div style={styles.sidebarFooter}>
            <p style={styles.footerText}>Secure Somali Platform</p>
        </div>
      </aside>

      {/* MAIN CONTENT: MARKETPLACE */}
      <main style={styles.mainContent}>
        {notification.msg && (
          <div style={{
            ...styles.notification,
            backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626'
          }}>
            {notification.msg}
          </div>
        )}

        <header style={styles.marketHeader}>
          <h2 style={styles.title}>Find a Local Professional</h2>
          <p style={styles.subtitle}>Verified plumbers, mechanics, and painters in Hargeisa.</p>
        </header>

        {error ? (
          <div style={styles.errorBox}>
            <p style={{ fontWeight: 'bold' }}>⚠️ Oops!</p>
            <p>{error}</p>
            <button onClick={() => { setLoading(true); loadData(); }} style={styles.retryBtn}>
              Retry Connection
            </button>
          </div>
        ) : (
          <div style={styles.proGrid}>
            {pros.length > 0 ? (
              pros.map(p => (
                <ProCard 
                  key={p._id} 
                  pro={p} 
                  onAction={(msg) => loadData(msg)} 
                  userBookings={requests} 
                />
              ))
            ) : (
              <div style={styles.noData}>
                <p>No professionals are currently online in Hargeisa.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// --- STYLES (NO CHANGES NEEDED) ---
const styles = {
  pageWrapper: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 15px', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
  hubHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  hubTitle: { fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' },
  livePulse: { width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' },
  sidebarScrollArea: { flex: 1, overflowY: 'auto' },
  requestCard: { padding: '12px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #f1f5f9', marginBottom: '10px' },
  miniLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', marginBottom: '4px' },
  reqProName: { fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  statusBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  callAlert: { padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginTop: '8px' },
  alertText: { fontSize: '11px', fontWeight: '700', color: '#166534', margin: 0 },
  sidebarFooter: { paddingTop: '15px', borderTop: '1px solid #f1f5f9' },
  footerText: { fontSize: '11px', color: '#94a3b8', textAlign: 'center' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  marketHeader: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '16px' },
  proGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  errorBox: { textAlign: 'center', padding: '40px', backgroundColor: '#fee2e2', borderRadius: '12px', color: '#b91c1c', border: '1px solid #fecaca' },
  retryBtn: { marginTop: '15px', padding: '10px 20px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  noData: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' },
  loaderContainer: { textAlign: 'center', marginTop: '30vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
  loaderText: { marginTop: '15px', fontWeight: '600', color: '#64748b' },
  notification: { position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', color: '#fff', borderRadius: '8px', zIndex: 100, fontWeight: 'bold' }
};
