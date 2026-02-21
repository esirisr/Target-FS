import React, { useState, useEffect } from 'react';
import {
  fetchDashboard,
  verifyPro,
  suspendPro,
  deleteUser
} from '../services/api';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  const loadData = async () => {
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, type) => {
    try {
      if (type === 'verify') {
        await verifyPro(id);
      } 
      else if (type === 'suspend') {
        await suspendPro(id);
      } 
      else if (type === 'delete') {
        if (window.confirm("Permanently Delete This Professional?")) {
          await deleteUser(id);
        }
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Action Failed!");
    }
  };

  const filteredPros = data.allPros.filter(pro => {
    const searchTerm = filterText.toLowerCase().trim();
    if (!searchTerm) return true;

    const target = pro.professional || pro;
    const nameMatch = target.name?.toLowerCase().includes(searchTerm) || false;
    const emailMatch = target.email?.toLowerCase().includes(searchTerm) || false;
    const phoneMatch = target.phone?.toLowerCase().includes(searchTerm) || false;

    let skillsMatch = false;
    if (target.skills) {
      if (Array.isArray(target.skills)) {
        skillsMatch = target.skills.some(skill => 
          String(skill).toLowerCase().includes(searchTerm)
        );
      } else if (typeof target.skills === 'string') {
        skillsMatch = target.skills.toLowerCase().includes(searchTerm);
      }
    }

    return nameMatch || emailMatch || phoneMatch || skillsMatch;
  });

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner" style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading Management Console...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const pendingPros = data.stats?.pendingPros || data.allPros.filter(p => !p.isVerified).length;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .blob {
          position: fixed; /* Changed to fixed so they don't jump during scroll */
          border-radius: 50%;
          filter: blur(70px);
          z-index: 0;
          animation: float 10s infinite ease-in-out;
        }
        .blob1 { top: -150px; left: -100px; width: 400px; height: 400px; background: rgba(79, 70, 229, 0.15); }
        .blob2 { bottom: -100px; right: -50px; width: 350px; height: 350px; background: rgba(236, 72, 153, 0.1); animation-delay: -3s; }
        .blob3 { top: 40%; left: 60%; width: 300px; height: 300px; background: rgba(59, 130, 246, 0.1); animation-delay: -6s; }
        
        .admin-card-wrapper {
          transition: transform 0.3s ease;
        }
        .admin-card-wrapper:hover {
          transform: translateY(-8px);
        }
      `}</style>

      {/* Decorative background blobs */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.gradientText}>Management Console</span>
          </h1>
          <div style={styles.underline}></div>

          <div style={styles.filterContainer}>
            <input
              type="text"
              placeholder="Filter by name, email, phone, or skill..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Showing</span>
              <span style={styles.statNumber}>{filteredPros.length}</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Pending Verification</span>
              <span style={styles.statNumber}>{pendingPros}</span>
            </div>
          </div>
        </header>

        <main style={styles.grid}>
          {filteredPros.length > 0 ? (
            filteredPros.map((pro) => (
              <div key={pro._id} className="admin-card-wrapper">
                <AdminCard
                  pro={pro}
                  onAction={handleAction}
                />
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <p>No professionals match your filter.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '0 20px 80px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: 'relative',
    overflow: 'visible' // Standard scroll behavior
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    zIndex: 1,
  },
  header: {
    /* STICKY CONFIG */
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(248, 250, 252, 0.85)', // Slight transparency
    backdropFilter: 'blur(12px)', // Frosted glass effect
    WebkitBackdropFilter: 'blur(12px)', // Safari support
    
    textAlign: 'center',
    padding: '30px 10px 20px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
  },
  title: {
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: '900',
    margin: '0',
    lineHeight: '1.1'
  },
  gradientText: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  underline: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 100%)',
    margin: '15px auto',
    borderRadius: '2px',
  },
  filterContainer: {
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto 20px auto',
  },
  filterInput: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '40px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    outline: 'none',
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  statBox: {
    background: 'white',
    padding: '10px 24px',
    borderRadius: '50px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    minWidth: '140px',
  },
  statLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '2px'
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
    marginTop: '30px',
    zIndex: 1
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px',
    color: '#94a3b8',
    background: 'white',
    borderRadius: '32px',
    border: '1px dashed #cbd5e1',
  },
  loaderContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    border: '4px solid rgba(0,0,0,0.1)',
    borderLeftColor: '#4f46e5',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loaderText: {
    fontSize: '1.1rem',
    color: '#334155',
    fontWeight: '600'
  }
};