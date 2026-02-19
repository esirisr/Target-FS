import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear(); // Clears token and role in one go
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      {/* Clicking the Logo acts as the "Home" button */}
      <Link to="/" style={styles.logo}>HOME-MAN</Link>
      
      <div style={styles.linksContainer}>
        {!token ? (
          <>
            {/* Links for Guest Users */}
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" isBtn>Join US</NavLink>
          </>
        ) : (
          <>
            {/* Links for Logged-in Users - Hides generic "Home" to avoid duplication */}
            {role === 'admin' && (
              <NavLink to="/admin">Management Console</NavLink>
            )}

            {role === 'pro' && (
              <>
                <NavLink to="/pro-dashboard">Workspace</NavLink>
                {/* Add specific pro links here if needed */}
              </>
            )}

            {role === 'client' && (
              <>
                <NavLink to="/client-home">Marketplace</NavLink>
              </>
            )}

            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

/**
 * Enhanced NavLink with hover states and optional button styling
 */
function NavLink({ to, children, isBtn }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const linkStyle = isBtn ? styles.registerBtn : { 
    ...styles.link, 
    color: isHovered ? '#60a5fa' : '#ffffff' 
  };

  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={linkStyle}
    >
      {children}
    </Link>
  );
}

const styles = {
  nav: { 
    backgroundColor: '#000', 
    padding: '18px 40px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  logo: { 
    color: '#fff', 
    textDecoration: 'none', 
    fontSize: '22px', 
    fontWeight: '900', 
    letterSpacing: '-1px' 
  },
  linksContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '28px' 
  },
  link: { 
    textDecoration: 'none', 
    fontSize: '14px', 
    fontWeight: '600', 
    transition: '0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  registerBtn: {
    backgroundColor: '#fff',
    color: '#000',
    padding: '8px 20px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px',
    transition: '0.2s opacity'
  },
  logoutBtn: { 
    background: 'none', 
    border: '1px solid #ef4444', 
    color: '#ef4444', 
    padding: '6px 16px',
    borderRadius: '8px',
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '700',
    transition: '0.2s',
    marginLeft: '10px'
  }
};
