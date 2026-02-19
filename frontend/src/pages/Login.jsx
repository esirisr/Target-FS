import React, { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ msg: '', isError: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ msg: '', isError: false });

    try {
      const res = await axios.post('https://tsbe-production.up.railway.app/api/auth/login', { 
        email: email.toLowerCase().trim(), // Ensure clean data
        password 
      });

      // CRITICAL: Save email for ProtectedRoute/SmartHome logic
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.user.email); 

      setStatus({ msg: "Success! Redirecting...", isError: false });

      // Use window.location to refresh the app state with new localStorage data
      setTimeout(() => {
        window.location.href = '/'; 
      }, 1000);

    } catch (err) {
      setStatus({ 
        msg: err.response?.data?.message || "Login failed. Please check credentials.", 
        isError: true 
      });
    }
  };

  return (
    <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: '800' }}>Login</h2>

        {status.msg && (
          <div style={{
            ...messageStyle,
            backgroundColor: status.isError ? '#fee2e2' : '#dcfce7',
            color: status.isError ? '#991b1b' : '#166534',
            border: `1px solid ${status.isError ? '#fecaca' : '#bbf7d0'}`
          }}>
            {status.msg}
          </div>
        )}

        <input type="email" placeholder="Email" style={inputStyle} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" style={inputStyle} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={buttonStyle}>Sign In</button>
      </form>
    </div>
  );
}

const formStyle = { padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '400px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const messageStyle = { padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' };
