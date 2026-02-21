import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>HOME-MAN-PLATFORM</Link>
      
      <div style={styles.linksContainer}>
        {!token ? (
          <>
      
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" isBtn>Register Now</NavLink>
          </>
        ) : (
          <>
     
            {role === 'admin' && <NavLink to="/admin">Management Console</NavLink>}
            {role === 'pro' && <NavLink to="/pro-dashboard">Workspace</NavLink>}
            {role === 'client' && <NavLink to="/client-home">Marketplace</NavLink>}
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, isBtn }) {
  const [isHovered, setIsHovered] = useState(false);

  const linkStyle = isBtn
    ? {
        ...styles.registerBtn,
        background: isHovered 
          ? 'linear-gradient(135deg, #4f46e5, #6366f1)' 
          : '#fff',
        color: isHovered ? '#fff' : '#1f2937',
        boxShadow: isHovered ? '0 6px 18px rgba(79,70,229,0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.25s ease',
      }
    : { 
        ...styles.link, 
        color: isHovered ? '#a5b4fc' : '#fff',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        textShadow: isHovered ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.25s ease',
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
    backgroundColor: 'rgba(0,0,0,0.92)', 
    padding: '20px 50px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    boxShadow: '0 6px 25px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  },
  logo: { 
    color: '#fff', 
    textDecoration: 'none', 
    fontSize: '24px', 
    fontWeight: '900', 
    letterSpacing: '-1px',
    textShadow: '0 3px 10px rgba(0,0,0,0.6)',
    transition: 'all 0.3s ease',
  },
  linksContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '32px',
  },
  link: { 
    textDecoration: 'none', 
    fontSize: '16px', 
    fontWeight: '600', 
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s ease',
  },
  registerBtn: {
    padding: '10px 24px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'inline-block',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.25s ease',
  },
  logoutBtn: { 
    background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
    border: 'none', 
    color: '#fff', 
    padding: '8px 22px',
    borderRadius: '14px',
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  }
};