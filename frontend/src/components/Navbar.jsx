import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoBadge}>H</div>
        <span style={styles.logoText}>HOME-MAN</span>
      </Link>

      <div style={styles.linksContainer}>
        {/* HOME LINK */}
        <Link to="/" style={styles.navLink}>Home</Link>

        {/* UPDATED LOGIC: 
            Hide "Dashboard" for both 'client' and 'pro' roles.
            Only users with other roles (like Admin) will see this.
        */}
        {token && role !== 'client' && role !== 'pro' && (
          <Link to="/analytics" style={styles.navLink}>Dashboard</Link>
        )}

        {!token ? (
          <>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register Now</Link>
          </>
        ) : (
          <>
            {/* ADMIN LINK */}
            {role === 'admin' && <Link to="/admin" style={styles.navLink}>Management</Link>}
            
            {/* PRO LINK - Renamed to Workspace for clarity */}
            {role === 'pro' && <Link to="/pro-dashboard" style={styles.navLink}>Workspace</Link>}
            
            {/* CLIENT LINK */}
            {role === 'client' && (
              <Link to="/client-home" style={styles.marketplaceBtn}>
                Marketplace
              </Link>
            )}
            
            {/* LOGOUT BUTTON */}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { 
    backgroundColor: '#0059FF', 
    padding: '0.8rem 40px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 89, 255, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  logo: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    textDecoration: 'none' 
  },
  logoBadge: {
    backgroundColor: '#ffffff',
    color: '#0059FF',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '900',
    fontSize: '1.3rem'
  },
  logoText: { 
    color: '#ffffff', 
    fontSize: '1.3rem', 
    fontWeight: '900', // Increased to 900
    letterSpacing: '0.5px' 
  },
  linksContainer: { 
    display: 'flex', 
    gap: '1.2rem', 
    alignItems: 'center' 
  },
  navLink: { 
    color: 'rgba(255, 255, 255, 0.9)', 
    textDecoration: 'none', 
    fontWeight: '900', // Increased to 900 for bold consistency
    fontSize: '1rem', 
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
    textTransform: 'uppercase' // Added for professional look
  },
  marketplaceBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: '900', // Increased to 900
    fontSize: '0.95rem',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(5px)',
    textTransform: 'uppercase'
  },
  registerBtn: { 
    backgroundColor: '#ffffff', 
    color: '#0059FF', 
    textDecoration: 'none', 
    padding: '10px 24px', 
    borderRadius: '12px', 
    fontWeight: '900', // Increased to 900
    fontSize: '1rem', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textTransform: 'uppercase'
  },
  logoutBtn: { 
    backgroundColor: '#ffffff', 
    color: '#0059FF', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '12px', 
    fontWeight: '900', // Increased to 900
    fontSize: '0.95rem', 
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    textTransform: 'uppercase'
  }
};