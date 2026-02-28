import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const navigate = useNavigate();
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
    "Cleaner",
    "Gardener",
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
      console.log('Dashboard data:', res.data);
      
      // Get verified professionals
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    loadData();
    // Poll for status updates every 20 seconds
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter pros by selected skill
  const filteredPros = pros.filter(pro => {
    if (selectedSkill === "All") return true;
    const rawSkills = pro.skills || [];
    const skillList = rawSkills.map(s => String(s).toLowerCase());
    return skillList.includes(selectedSkill.toLowerCase());
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
        {/* Sidebar - Request Panel */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Your Requests</h3>
          {requests.length === 0 ? (
            <p style={styles.noRequests}>No requests yet</p>
          ) : (
            <div style={styles.requestList}>
              {requests.map(req => (
                <div key={req._id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <span style={styles.requestProName}>{req.professional?.name || 'Professional'}</span>
                    <span style={styles.statusBadge(req.status)}>
                      {req.status}
                    </span>
                  </div>
                  <div style={styles.requestDetails}>
                    <p style={styles.detailItem}>📅 {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p style={styles.detailItem}>📍 {req.professional?.location || 'Hargeisa'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Skills Filter Navbar */}
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

          {/* Professionals Grid */}
          <div style={styles.container}>
            {filteredPros.length > 0 ? (
              <div style={styles.proGrid}>
                {filteredPros.map((pro) => (
                  <ProCard
                    key={pro._id}
                    pro={pro}
                    userBookings={requests}
                    onAction={loadData}
                    onNotify={addNotification}
                    selectedSkill={selectedSkill}
                  />
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
        .toast-slide-in { 
          animation: slideIn 0.3s ease-out; 
        }
        
        @keyframes slideIn { 
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          } 
          to { 
            transform: translateX(0); 
            opacity: 1; 
          } 
        }
        
        .marketplace-loader { 
          width: 60px; 
          height: 60px; 
          border: 6px solid #e0e7ff; 
          border-top: 6px solid #1d4ed8; 
          border-radius: 50%; 
          animation: spin 1s linear infinite; 
        }
        
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }

        @media (max-width: 1024px) {
          .pro-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .layout {
            flex-direction: column !important;
            padding: 16px !important;
          }
          .sidebar {
            width: 100% !important;
            position: static !important;
          }
          .pro-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .pro-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .filterNav::-webkit-scrollbar {
          height: 6px;
        }
        .filterNav::-webkit-scrollbar-track {
          background: #e0e7ff;
          border-radius: 10px;
        }
        .filterNav::-webkit-scrollbar-thumb {
          background: #1d4ed8;
          border-radius: 10px;
          border: 1px solid #ffffff;
        }
      `}</style>
    </div>
  );
}

// Updated styles – larger, bolder text for better visibility
const styles = {
  page: { 
    background: '#ffffff', 
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    paddingTop: '20px',
    // subtle dot pattern
    backgroundImage: 'radial-gradient(circle at 10px 10px, #e0e7ff 2px, transparent 2px)',
    backgroundSize: '30px 30px',
  },
  layout: { 
    display: 'flex', 
    maxWidth: '1400px', 
    margin: '0 auto', 
    padding: '24px', 
    gap: '30px',
  },
  sidebar: { 
    flex: '0 0 280px', 
    background: '#ffffff', 
    borderRadius: '24px', 
    padding: '24px 20px', 
    height: 'fit-content', 
    position: 'sticky', 
    top: '20px', 
    boxShadow: '0 15px 35px -10px rgba(29, 78, 216, 0.2), 0 0 0 1px rgba(29, 78, 216, 0.1) inset', 
    border: '1px solid #e0e7ff',
  },
  sidebarTitle: { 
    fontSize: '1.3rem', 
    fontWeight: '800', 
    color: '#1d4ed8', 
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  noRequests: {
    color: '#1e293b',
    textAlign: 'center',
    padding: '24px 16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    background: '#ffffff',
    borderRadius: '16px',
    border: '2px dashed #e0e7ff',
    boxShadow: 'inset 0 2px 8px rgba(29,78,216,0.02)',
  },
  requestList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px',
  },
  requestCard: { 
    background: '#ffffff', 
    borderRadius: '16px', 
    padding: '14px', 
    border: '1px solid #e0e7ff',
    boxShadow: '0 4px 12px rgba(29,78,216,0.05)',
    transition: 'all 0.2s ease',
  },
  requestHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '10px' 
  },
  requestProName: { 
    fontWeight: '800', 
    color: '#1d4ed8', 
    fontSize: '1rem',
    textTransform: 'uppercase',
  },
  statusBadge: (status) => ({
    padding: '4px 10px', 
    borderRadius: '20px', 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    textTransform: 'uppercase',
    background: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef3c7',
    color: status === 'approved' ? '#166534' : status === 'rejected' ? '#991b1b' : '#92400e',
    border: '1px solid currentColor',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  }),
  requestDetails: { 
    fontSize: '0.9rem', 
    color: '#1e293b', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  detailItem: { 
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#334155',
    fontWeight: '700',
  },
  mainContent: { 
    flex: 1,
    minWidth: 0,
  },
  stickyNav: { 
    position: 'sticky', 
    top: '20px', 
    zIndex: 90, 
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '16px 0 12px 0', 
    marginBottom: '30px',
    borderRadius: '40px',
    boxShadow: '0 10px 25px -8px rgba(29,78,216,0.15), 0 0 0 1px rgba(29,78,216,0.1)',
  },
  filterNav: { 
    display: 'flex', 
    gap: '8px', 
    overflowX: 'auto', 
    padding: '0 8px 8px 8px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#1d4ed8 #e0e7ff',
  },
  filterButton: { 
    padding: '12px 24px', 
    borderRadius: '40px', 
    border: '1px solid #e0e7ff', 
    background: '#ffffff', 
    cursor: 'pointer', 
    fontWeight: '700', 
    color: '#1e293b', 
    whiteSpace: 'nowrap',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(29,78,216,0.05)',
  },
  filterActive: { 
    padding: '12px 24px', 
    borderRadius: '40px', 
    background: '#1d4ed8', 
    color: '#ffffff', 
    border: '1px solid #1d4ed8', 
    fontWeight: '800', 
    whiteSpace: 'nowrap',
    fontSize: '1rem',
    boxShadow: '0 8px 16px -6px #1d4ed8',
    transform: 'scale(1.02)',
  },
  container: { 
    paddingBottom: '40px',
  },
  proGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '24px',
  },
  toastContainer: { 
    position: 'fixed', 
    top: '80px', 
    right: '20px', 
    zIndex: 10000, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    maxWidth: '360px',
  },
  notificationItem: { 
    background: '#ffffff', 
    padding: '14px 18px', 
    borderRadius: '16px', 
    boxShadow: '0 15px 30px -10px rgba(29, 78, 216, 0.25), 0 0 0 1px rgba(29,78,216,0.1)', 
    borderLeft: '4px solid', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    minWidth: '260px',
    backdropFilter: 'blur(8px)',
  },
  notificationIcon: { 
    fontSize: '1.4rem' 
  },
  notificationMessage: { 
    fontSize: '0.95rem', 
    fontWeight: '700', 
    color: '#1e293b',
    flex: 1,
  },
  loaderContainer: { 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#ffffff',
    backgroundImage: 'radial-gradient(circle at 20px 20px, #e0e7ff 3px, transparent 3px)',
    backgroundSize: '40px 40px',
  },
  loaderText: { 
    marginTop: '24px', 
    color: '#1d4ed8', 
    fontWeight: '800',
    fontSize: '1.2rem',
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(29,78,216,0.2)',
  },
  emptyState: { 
    textAlign: 'center', 
    marginTop: '80px',
    padding: '40px 20px',
    background: '#ffffff',
    borderRadius: '48px',
    boxShadow: '0 20px 40px -15px rgba(29,78,216,0.2), inset 0 1px 3px rgba(255,255,255,0.9)',
    border: '1px solid #e0e7ff',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  emptyIcon: { 
    fontSize: '4rem',
    display: 'block',
    marginBottom: '16px',
    color: '#1d4ed8',
    opacity: 0.8,
    filter: 'drop-shadow(0 8px 12px rgba(29,78,216,0.3))',
  },
  emptyText: { 
    fontWeight: '800', 
    fontSize: '1.5rem', 
    color: '#1d4ed8',
    marginBottom: '8px',
  },
  emptySubtext: { 
    color: '#475569',
    fontSize: '1.1rem',
    fontWeight: '700',
  }
};