import React, { useState } from 'react';

const LoginPortal = ({ onLogin }) => {
  const [method, setMethod] = useState('username'); // Changed from email to username
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- STRICT ADMIN CREDENTIALS ---
  const ADMIN_USERNAME = "admin";
  const ADMIN_PHONE = "252634450898";
  const ADMIN_PASSWORD = "12345"; 
  // --------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate based on the selected method
    const isCorrectUser = (method === 'username' && userId === ADMIN_USERNAME) || 
                          (method === 'phone' && userId === ADMIN_PHONE);

    const isCorrectPassword = password === ADMIN_PASSWORD;

    if (isCorrectUser && isCorrectPassword) {
      setError('');
      onLogin(); // Successful verification
    } else {
      setError("Aqoonsig**at**gu waa khal**at**d. Kaliy**at** Admin b**at**n loo ogoly**at**h**at**y.");
      setPassword(''); 
    }
  };

  return (
    <div className="login-portal animate-fade-in">
      <div className="login-card">
        <div className="avatar" style={{ margin: '0 auto 20px' }}>👤</div>
        <h2 className="user-name">Admin Only</h2>
        <p className="subtitle">Agent 377 266 Verification</p>

        <div className="auth-toggle">
          <button 
            type="button"
            className={method === 'username' ? 'active' : ''} 
            onClick={() => {setMethod('username'); setError(''); setUserId('');}}
          >Username</button>
          <button 
            type="button"
            className={method === 'phone' ? 'active' : ''} 
            onClick={() => {setMethod('phone'); setError(''); setUserId('');}}
          >Phone</button>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{method === 'username' ? 'Admin Username' : 'Admin Phone'}</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder={method === 'username' ? 'Gali admin' : '252634450898'} 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Security Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '800', marginTop: '10px' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-submit add" style={{ width: '100%', marginTop: '20px' }}>
            Verify Identity
          </button>
        </form>
        
        <div style={{ marginTop: '25px', opacity: 0.6, fontSize: '0.75rem' }}>
          <p>System Protected by Expert<span>at</span> Hub Security</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;