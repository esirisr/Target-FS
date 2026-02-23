import React, { useState } from 'react';
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
      <Link to="/" style={styles.logo}>HOME-MAN-PLATFORM</Link>

      <div style={styles.linksContainer}>

        {/* HOME ALWAYS GOES TO LANDING */}
        <NavLink to="/">Home</NavLink>

        {!token ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" isBtn>Register Now</NavLink>
          </>
        ) : (
          <>
            {role === 'admin' && <NavLink to="/admin">Management</NavLink>}
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
  const [hover, setHover] = useState(false);

  const style = isBtn
    ? {
        ...styles.registerBtn,
        background: hover ? '#4f46e5' : '#fff',
        color: hover ? '#fff' : '#000'
      }
    : {
        ...styles.link,
        color: hover ? '#a5b4fc' : '#fff'
      };

  return (
    <Link
      to={to}
      style={{ ...style, transition: '0.25s' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

const styles = {
  nav: {
    background: '#000',
    padding: '16px 50px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '900'
  },
  linksContainer: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  link: {
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  registerBtn: {
    padding: '8px 18px',
    borderRadius: '10px',
    fontWeight: '700'
  },
  logoutBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '10px',
    cursor: 'pointer'
  }
};