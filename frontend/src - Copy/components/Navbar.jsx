import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Retrieve authentication details from localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>HOME-MAN-PLATFORM</Link>

      <div style={styles.linksContainer}>
        <Link to="/" style={styles.link}>Home</Link>

        {/* UPDATED LOGIC: 
            Dashboard only appears for logged-in Admins. 
            Clients and Pros will not see this button.
        */}
        {token && role === 'admin' && (
          <Link to="/analytics" style={styles.link}>Dashboard</Link>
        )}

        {!token ? (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register Now</Link>
          </>
        ) : (
          <>
            {/* Role-based navigation links */}
            {role === 'admin' && <Link to="/admin" style={styles.link}>Management</Link>}
            {role === 'pro' && <Link to="/pro-dashboard" style={styles.link}>Workspace</Link>}
            {role === 'client' && <Link to="/client-home" style={styles.link}>Marketplace</Link>}
            
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { 
    backgroundColor: '#0f172a', 
    padding: '1rem 2rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000 
  },
  logo: { 
    color: '#f8fafc', 
    textDecoration: 'none', 
    fontSize: '1.25rem', 
    fontWeight: '800' 
  },
  linksContainer: { 
    display: 'flex', 
    gap: '1.5rem', 
    alignItems: 'center' 
  },
  link: { 
    color: '#cbd5e1', 
    textDecoration: 'none', 
    fontWeight: '500', 
    fontSize: '0.9rem' 
  },
  registerBtn: { 
    backgroundColor: '#3b82f6', 
    color: '#fff', 
    textDecoration: 'none', 
    padding: '0.5rem 1.25rem', 
    borderRadius: '0.5rem', 
    fontWeight: '600' 
  },
  logoutBtn: { 
    backgroundColor: '#ef4444', 
    color: '#fff', 
    border: 'none', 
    padding: '0.5rem 1.25rem', 
    borderRadius: '0.5rem', 
    fontWeight: '600', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};