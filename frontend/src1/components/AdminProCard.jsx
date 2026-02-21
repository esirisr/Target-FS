import React, { useState } from 'react';

export default function AdminProCard({ pro, onDelete, onSuspend }) {
  const [isCardHovered, setIsCardHovered] = useState(false);

  const isSuspended = pro.isSuspended;

  return (
    <div 
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      style={{
        ...styles.card,
        border: isSuspended ? '2px dashed #ef4444' : '1px solid #e2e8f0',
        transform: isCardHovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: isCardHovered 
          ? '0 15px 35px rgba(0,0,0,0.15), 0 0 20px rgba(239,68,68,0.15)' 
          : '0 6px 18px rgba(0,0,0,0.05)'
      }}
    >
      {/* Ribbon / Status */}
      <div style={{
        ...styles.ribbon,
        background: isSuspended 
          ? 'linear-gradient(to right, #fee2e2, #fef2f2)' 
          : 'linear-gradient(to right, #dbeafe, #eff6ff)',
        color: isSuspended ? '#b91c1c' : '#1d4ed8',
        fontWeight: '800'
      }}>
        {isSuspended ? 'Suspended Account' : 'Active Account'}
      </div>

      {/* Avatar + Name */}
      <div style={styles.header}>
        <div style={styles.avatar}>{pro.name[0]}</div>
        <h2 style={styles.name}>{pro.name}</h2>
        <span style={styles.idBadge}>ID: {pro._id?.slice(-6)}</span>
      </div>
      
      <div style={styles.divider} />

      {/* Info Section */}
      <div style={styles.infoSection}>
        <div style={styles.infoRow}>📞 {pro.phone || 'No Phone'}</div>
        <div style={styles.infoRow}>📧 {pro.email || 'No Email'}</div>
        <div style={styles.infoRow}>🎯 Skill: {pro.skills?.[0] || 'N/A'}</div>
        <div style={styles.infoRow}>📍 Location: {pro.location || 'Unknown'}</div>
      </div>

      {/* Action Buttons */}
      <div style={styles.adminActionGroup}>
        <button
          onClick={() => onSuspend(pro._id)}
          style={{
            ...styles.button,
            background: isSuspended 
              ? 'linear-gradient(to right, #22c55e, #16a34a)'
              : 'linear-gradient(to right, #f59e0b, #d97706)',
            color: '#fff',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isSuspended ? 'Activate' : 'Suspend'}
        </button>

        <button
          onClick={() => { if(window.confirm(`Permanently delete ${pro.name}?`)) onDelete(pro._id); }}
          style={{
            ...styles.button,
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            color: '#fff',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    padding: '48px 28px 28px 28px',
    borderRadius: '24px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.35s ease'
  },
  ribbon: {
    marginBottom: '16px',
    padding: '6px 16px',
    borderRadius: '24px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  header: { 
    marginBottom: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '8px' 
  },
  avatar: {
    width: '56px', height: '56px',
    borderRadius: '50%',
    backgroundColor: '#e0e7ff',
    color: '#1e3a8a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '22px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  name: { fontSize: '1.35rem', fontWeight: '900', margin: '0', color: '#0f172a', textTransform: 'capitalize' },
  idBadge: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', width: '80%', margin: '18px 0' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', color: '#475569', fontSize: '0.95rem' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  adminActionGroup: { display: 'flex', gap: '10px', width: '100%' },
  button: { flex: 1, padding: '14px 5px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer' }
};