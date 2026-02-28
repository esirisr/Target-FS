import React, { useState } from 'react';

export default function AdminProCard({ pro, onDelete, onSuspend }) {
  const [isCardHovered, setIsCardHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      style={{
        ...styles.card,
        border: pro.isSuspended ? '2px solid #ef4444' : '1px solid #e2e8f0',
        transform: isCardHovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
    >
      <div style={{
        ...styles.ribbon,
        backgroundColor: pro.isSuspended ? '#fee2e2' : '#f8fafc',
        color: pro.isSuspended ? '#ef4444' : '#64748b'
      }}>
        {pro.isSuspended ? 'Account Suspended' : 'Active Account'}
      </div>

      <div style={styles.header}>
        <h2 style={styles.name}>{pro.name}</h2>
        <span style={styles.idBadge}>ID: {pro._id?.slice(-6)}</span>
      </div>
      
      <div style={styles.divider} />

      <div style={styles.infoSection}>
        <div style={styles.infoRow}>📞 {pro.phone || 'No Phone'}</div>
        <div style={styles.infoRow}>📧 {pro.email || 'No Email'}</div>
      </div>

      <div style={styles.adminActionGroup}>
        <button
          onClick={() => onSuspend(pro._id)}
          style={{
            ...styles.button,
            backgroundColor: pro.isSuspended ? '#22c55e' : '#f59e0b',
            color: '#fff',
          }}
        >
          {pro.isSuspended ? 'Activate' : 'Suspend'}
        </button>
        
        <button
          onClick={() => {
            if(window.confirm(`Permanently delete ${pro.name}?`)) onDelete(pro._id);
          }}
          style={{ ...styles.button, backgroundColor: '#ef4444', color: '#fff' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { position: 'relative', padding: '40px 24px 24px 24px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease' },
  ribbon: { marginBottom: '12px', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' },
  header: { marginBottom: '16px' },
  name: { fontSize: '1.3rem', fontWeight: '800', margin: '0 0 5px 0', color: '#0f172a', textTransform: 'capitalize' },
  idBadge: { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', width: '80%', margin: '15px 0' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', color: '#475569', fontSize: '0.9rem' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  adminActionGroup: { display: 'flex', gap: '8px', width: '100%' },
  button: { flex: 1, padding: '12px 5px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }
};