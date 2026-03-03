import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false); // Close menu when resizing to desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo} onClick={handleLinkClick}>
        <div style={styles.logoBadge}>H</div>
        <span style={styles.logoText}>HOME-MAN</span>
      </Link>

      {/* Hamburger Icon */}
      {isMobile && (
        <button onClick={toggleMenu} style={styles.hamburger} aria-label="Toggle menu">
          <div style={{
            ...styles.bar,
            transform: menuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none',
          }} />
          <div style={{
            ...styles.bar,
            opacity: menuOpen ? 0 : 1,
          }} />
          <div style={{
            ...styles.bar,
            transform: menuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none',
          }} />
        </button>
      )}

      {/* Navigation Links */}
      <div style={{
        ...styles.linksContainer,
        ...(isMobile
          ? (menuOpen ? styles.mobileMenuOpen : styles.mobileMenuClosed)
          : {}),
      }}>
        <Link to="/" style={styles.navLink} onClick={handleLinkClick}>Home</Link>

        {token && role !== 'client' && role !== 'pro' && (
          <Link to="/analytics" style={styles.navLink} onClick={handleLinkClick}>Dashboard</Link>
        )}

        {!token ? (
          <>
            <Link to="/login" style={styles.navLink} onClick={handleLinkClick}>Login</Link>
            <Link to="/register" style={styles.registerBtn} onClick={handleLinkClick}>Register Now</Link>
          </>
        ) : (
          <>
            {role === 'admin' && <Link to="/admin" style={styles.navLink} onClick={handleLinkClick}>Management</Link>}
            {role === 'pro' && <Link to="/pro-dashboard" style={styles.navLink} onClick={handleLinkClick}>Workspace</Link>}
            {role === 'client' && (
              <Link to="/client-home" style={styles.marketplaceBtn} onClick={handleLinkClick}>
                Marketplace
              </Link>
            )}
            <button onClick={() => { handleLogout(); handleLinkClick(); }} style={styles.logoutBtn}>
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
    padding: '0.8rem 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 89, 255, 0.2)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
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
    fontSize: '1.3rem',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: '900',
    letterSpacing: '0.5px',
  },

  // Desktop container
  linksContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },

  // Mobile menu – closed
  mobileMenuClosed: {
    display: 'none',
  },

  // Mobile menu – open
  mobileMenuOpen: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#0059FF',
    padding: '1.5rem',
    gap: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 999,
  },

  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '30px',
    height: '25px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 10,
  },
  bar: {
    width: '30px',
    height: '3px',
    backgroundColor: 'white',
    borderRadius: '10px',
    transition: 'all 0.3s linear',
    transformOrigin: '1px',
  },

  // Shared link styles
  navLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: 'clamp(0.9rem, 4vw, 1rem)', // responsive font
    padding: '0.75rem 1rem',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%', // full width on mobile
    '@media (min-width: 768px)': {
      width: 'auto',
    },
  },

  marketplaceBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: 'clamp(0.9rem, 4vw, 1rem)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%',
    '@media (min-width: 768px)': {
      width: 'auto',
    },
  },

  registerBtn: {
    backgroundColor: '#ffffff',
    color: '#0059FF',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: 'clamp(0.9rem, 4vw, 1rem)',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%',
    '@media (min-width: 768px)': {
      width: 'auto',
    },
  },

  logoutBtn: {
    backgroundColor: '#ffffff',
    color: '#0059FF',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '900',
    fontSize: 'clamp(0.9rem, 4vw, 1rem)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%',
    '@media (min-width: 768px)': {
      width: 'auto',
    },
  },
};