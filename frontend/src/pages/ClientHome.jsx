import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const prevRequestsRef = useRef([]);

  const [selectedSkill, setSelectedSkill] = useState("All");
  const skills = ["All", "Plumber", "Painter", "Mechanic", "Electrician", "Carpenter", "Cleaner", "Gardener", "Mason"];

  // UPDATED: Faster notification timing
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500); // 2.5 seconds (Half of original)
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

        const prev = prevRequestsRef.current;
        if (prev.length > 0) {
          newRequests.forEach(newReq => {
            const oldReq = prev.find(r => r._id === newReq._id);
            if (oldReq && oldReq.status !== newReq.status) {
              const proName = newReq.professional?.name || 'Professional';
              if (newReq.status === 'approved') {
                addNotification(`✅ Request with ${proName} accepted!`, 'success');
              } else if (newReq.status === 'rejected') {
                addNotification(`❌ Request with ${proName} declined.`, 'error');
              }
            }
          });
        }
        prevRequestsRef.current = newRequests;
        setRequests(newRequests);
      }
    } catch (err) {
      console.error("Error loading marketplace data:", err);
      addNotification('Failed to load professionals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPros = pros.filter(pro => {
    const rawSkills = pro.professional?.skills || pro.skills || [];
    const skillList = rawSkills.map(skill => {
      if (typeof skill === 'object' && skill !== null) {
        return String(skill.name || skill.skill || skill.title || skill.value).toLowerCase();
      }
      return String(skill).toLowerCase();
    });
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
      {/* UPDATED: Toast Notifications on the Left */}
      {notifications.length > 0 && (
        <div style={styles.toastContainer}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                ...styles.notificationItem,
                borderLeftColor: n.type === 'success' ? '#22c55e' : '#ef4444',
              }}
              className="toast-slide-in-left"
            >
              <span style={styles.notificationIcon}>
                {n.type === 'success' ? '🎉' : '⚠️'}
              </span>
              <span style={styles.notificationMessage}>{n.message}</span>
              <div
                style={{
                  ...styles.progressBar,
                  animation: `shrink 2.5s linear forwards`, // Match the 2.5s duration
                  backgroundColor: n.type === 'success' ? '#22c55e' : '#ef4444',
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={styles.layout}>
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
                    <span style={styles.statusBadge(req.status)}>{req.status}</span>
                  </div>
                  <div style={styles.requestDetails}>
                    <p style={styles.detailItem}>📅 {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p style={styles.detailItem}>🔧 {req.skill || 'N/A'}</p>
                    <p style={styles.detailItem}>📍 {req.professional?.location || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

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

          <div style={styles.backgroundBlobs}>
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>
          </div>

          <div style={styles.container}>
            <section>
              {filteredPros.length > 0 ? (
                <div style={styles.proGrid}>
                  {filteredPros.map((p, index) => (
                    <div key={p._id} style={{...styles.cardWrapper, animationDelay: `${index * 0.1}s`}}>
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
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <style>{`
        .toast-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .marketplace-loader {
          width: 70px; height: 70px;
          border: 5px solid #e2e8f0; border-top-color: #4f46e5;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: { position: 'relative', minHeight: '100vh', background: '#f8fafc' },
  layout: { display: 'flex', maxWidth: '1600px', margin: '0 auto', padding: '20px 24px', gap: '24px' },
  sidebar: {
    flex: '0 0 300px', background: '#ffffff', borderRadius: '24px', padding: '20px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', height: 'fit-content',
    maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', position: 'sticky', top: '90px', border: '1px solid #e2e8f0'
  },
  sidebarTitle: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 20px 0', color: '#0f172a' },
  noRequests: { textAlign: 'center', color: '#94a3b8', padding: '20px' },
  requestList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  requestCard: { background: '#f8fafc', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  proName: { fontWeight: '600', color: '#0f172a' },
  statusBadge: (status) => ({
    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
    background: status === 'approved' ? '#22c55e20' : status === 'rejected' ? '#ef444420' : '#f59e0b20',
    color: status === 'approved' ? '#22c55e' : status === 'rejected' ? '#ef4444' : '#f59e0b',
  }),
  requestDetails: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#475569' },
  detailItem: { margin: 0 },
  mainContent: { flex: 1, minWidth: 0 },
  stickyNav: { position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '10px 0', marginBottom: '20px' },
  filterNav: { display: 'flex', gap: '12px', padding: '0 24px', overflowX: 'auto' },
  filterButton: { padding: '8px 20px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' },
  filterActive: { padding: '8px 20px', borderRadius: '20px', background: '#4f46e5', color: 'white', fontWeight: '600' },
  container: { maxWidth: '1280px', margin: '0 auto', padding: '0 24px 40px', position: 'relative', zIndex: 2 },
  proGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' },
  cardWrapper: { display: 'flex', justifyContent: 'center' },
  emptyState: { textAlign: 'center', padding: '100px 20px' },
  emptyIcon: { fontSize: '3rem', display: 'block' },
  emptyText: { fontSize: '1.2rem', fontWeight: '600' },
  // UPDATED: Toast Container Position
  toastContainer: {
    position: 'fixed',
    bottom: '20px', // Bottom position
    left: '20px',   // Left side
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column-reverse', // Newest notifications at the bottom
    gap: '12px',
    maxWidth: '350px',
  },
  notificationItem: {
    position: 'relative', padding: '16px 20px', borderRadius: '12px', background: '#fff',
    borderLeft: '4px solid', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden',
  },
  notificationIcon: { fontSize: '1.5rem' },
  notificationMessage: { flex: 1, fontSize: '0.95rem', fontWeight: '500', color: '#1e293b' },
  progressBar: { position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%' },
  backgroundBlobs: { position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 },
  blob1: { position: 'absolute', top: '0', right: '0', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(100px)', borderRadius: '50%' },
  blob2: { position: 'absolute', bottom: '0', left: '0', width: '400px', height: '400px', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(100px)', borderRadius: '50%' },
  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: '20px', color: '#4f46e5', fontWeight: 'bold' }
};