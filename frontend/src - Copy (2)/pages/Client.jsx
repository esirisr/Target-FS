import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const prevRequestsRef = useRef([]);

  // Skills navbar
  const [selectedSkill, setSelectedSkill] = useState("All");
  const skills = [
    "All",
    "Plumber",
    "Painter",
    "Mechanic",
    "Electrician",
    "Carpenter",
    "Mason"
  ];

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const loadData = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      const verifiedPros = (res.data.allPros || []).filter(
        p => p.isVerified && !p.isSuspended
      );
      setPros(verifiedPros);

      const token = localStorage.getItem('token');
      if (token) {
        const bookRes = await API.get('/bookings/my-bookings');
        const newRequests = bookRes.data.bookings || [];

        // Check for status changes to trigger notifications
        const prev = prevRequestsRef.current;
        if (prev.length > 0) {
          newRequests.forEach(newReq => {
            const oldReq = prev.find(r => r._id === newReq._id);
            if (oldReq && oldReq.status !== newReq.status) {
              const proName = newReq.professional?.name || 'Professional';
              if (newReq.status === 'approved' || newReq.status === 'accepted') {
                addNotification(`✅ Your request with ${proName} has been accepted!`, 'success');
              } else if (newReq.status === 'rejected') {
                addNotification(`❌ Your request with ${proName} was declined.`, 'error');
              }
            }
          });
        }
        prevRequestsRef.current = newRequests;
        setRequests(newRequests);
      }
    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll for status updates every 20 seconds
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter pros by selected skill
  const filteredPros = pros.filter(pro => {
    const rawSkills = pro.skills || [];
    const skillList = rawSkills.map(s => String(s).toLowerCase());
    return selectedSkill === "All" || skillList.includes(selectedSkill.toLowerCase());
  });

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="marketplace-loader"></div>
        <p style={styles.loaderText}>Discovering top professionals…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Toast Notifications */}
      <div style={styles.toastContainer}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              ...styles.notificationItem,
              borderLeftColor: n.type === 'success' ? '#22c55e' : '#ef4444',
            }}
            className="toast-slide-in"
          >
            <span style={styles.notificationIcon}>
              {n.type === 'success' ? '🎉' : '⚠️'}
            </span>
            <span style={styles.notificationMessage}>{n.message}</span>
          </div>
        ))}
      </div>

      <div style={styles.layout}>
        {/* Sidebar - Request Panel (Skill removed per request) */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>📬 Your Requests</h3>
          {requests.length === 0 ? (
            <p style={styles.noRequests}>No requests yet</p>
          ) : (
            <div style={styles.requestList}>
              {requests.map(req => (
                <div key={req._id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <span style={styles.proName}>{req.professional?.name || 'Professional'}</span>
                    <span style={styles.statusBadge(req.status)}>
                      {req.status}
                    </span>
                  </div>
                  <div style={styles.requestDetails}>
                    <p style={styles.detailItem}>📅 {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p style={styles.detailItem}>📍 {req.professional?.location || 'Hargeisa'}</p>
                    <p style={styles.detailItem}>📞 {req.professional?.phone || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <nav style={styles.stickyNav}>
            <div style={styles.filterNav}>
              {skills.map(skill => (
                <button
                  key={skill}
                  style={selectedSkill === skill ? styles.filterActive : styles.filterButton}
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </nav>

          <div style={styles.container}>
            {filteredPros.length > 0 ? (
              <div style={styles.proGrid}>
                {filteredPros.map((p, index) => (
                  <div
                    key={p._id}
                    style={{
                      ...styles.cardWrapper,
                      animationDelay: `${index * 0.1}s`,
                    }}
                    className="pro-card-wrapper"
                  >
                    <ProCard
                      pro={p}
                      onAction={loadData}
                      userBookings={requests}
                      onNotify={addNotification}
                      selectedSkill={selectedSkill}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🔎</span>
                <p style={styles.emptyText}>No {selectedSkill}s found</p>
                <p style={styles.emptySubtext}>Try another category</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .toast-slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .marketplace-loader { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .pro-card-wrapper { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh' },
  layout: { display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '20px', gap: '30px' },
  sidebar: { flex: '0 0 320px', background: '#fff', borderRadius: '24px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  sidebarTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px' },
  requestList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  requestCard: { background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  proName: { fontWeight: '700', color: '#1e293b' },
  statusBadge: (status) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
    background: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
    color: status === 'approved' ? '#166534' : status === 'rejected' ? '#991b1b' : '#92400e'
  }),
  requestDetails: { fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' },
  detailItem: { margin: 0 },
  mainContent: { flex: 1 },
  stickyNav: { position: 'sticky', top: 0, zIndex: 10, background: 'rgba(248, 250, 252, 0.9)', backdropFilter: 'blur(10px)', padding: '10px 0', marginBottom: '20px' },
  filterNav: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' },
  filterButton: { padding: '8px 20px', borderRadius: '25px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', whiteSpace: 'nowrap' },
  filterActive: { padding: '8px 20px', borderRadius: '25px', background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5', fontWeight: '600', whiteSpace: 'nowrap' },
  container: { paddingBottom: '40px' },
  proGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '35px' },
  cardWrapper: { display: 'flex', justifyContent: 'center' },
  toastContainer: { position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '10px' },
  notificationItem: { background: '#fff', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderLeft: '6px solid', display: 'flex', alignItems: 'center', gap: '15px', minWidth: '300px' },
  notificationIcon: { fontSize: '1.4rem' },
  notificationMessage: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' },
  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: '20px', color: '#4f46e5', fontWeight: 'bold' },
  emptyState: { textAlign: 'center', marginTop: '100px' },
  emptyIcon: { fontSize: '3rem' },
  emptyText: { fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' },
  emptySubtext: { color: '#64748b' }
};