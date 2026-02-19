import React, { useState } from 'react';

export default function AdminCard({ pro, onAction }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPending = !pro.isVerified;
  
  // RATING LOGIC (Customer Feedback)
  const isUnrated = !pro.reviewCount || pro.reviewCount === 0;
  const displayRating = isUnrated ? "0.0" : Number(pro.rating).toFixed(1);

  // REGISTRATION DATA (Pro-Provided)
  // Note: Register.jsx sends location as 'location' and skills as an array ['trade']
  const proLocation = pro.location || 'Not specified';
  const proTrade = Array.isArray(pro.skills) ? pro.skills[0] : pro.skills;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        border: isPending ? '2px dashed #3b82f6' : '1px solid #e2e8f0',
      }}
    >
      {/* Verification Badge */}
      <div style={{
        ...styles.statusHeader, 
        backgroundColor: isPending ? '#eff6ff' : '#f0fdf4'
      }}>
        <span style={{
          color: isPending ? '#3b82f6' : '#16a34a', 
          fontWeight: '900', fontSize: '11px', letterSpacing: '0.8px'
        }}>
          {isPending ? '⏳ NEW REGISTRATION' : '✅ VERIFIED PROFESSIONAL'}
        </span>
      </div>

      <div style={styles.content}>
        {/* IDENTITY SECTION */}
   

        {/* REGISTRATION DETAILS (Dropdown Data) */}
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.label}>Registered Location</span>
            <span style={styles.value}>📍 {proLocation}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.label}>Contact Phone</span>
            <span style={styles.value}>📞 {pro.phone}</span>
          </div>
        </div>

        <div style={styles.infoItem}>
           <span style={styles.label}>Registered Email</span>
           <span style={styles.value}>{pro.email}</span>
        </div>

        <div style={styles.divider} />

        {/* PERFORMANCE SECTION (Customer Data) */}
        <div style={styles.ratingRow}>
          <div style={styles.ratingBox}>
            <span style={styles.label}>Avg Rating</span>
            <span style={{...styles.ratingText, color: isUnrated ? '#94a3b8' : '#f59e0b'}}>
              ⭐ {displayRating}
            </span>
          </div>
          <div style={styles.ratingBox}>
            <span style={styles.label}>Review Count</span>
            <span style={styles.value}>{pro.reviewCount || 0} Total</span>
          </div>
        </div>

        {/* ADMIN ACTIONS */}
        <div style={styles.buttonGroup}>
          {isPending && (
            <button 
              onClick={() => onAction(pro._id, 'verify')}
              style={{ ...styles.actionBtn, backgroundColor: '#3b82f6' }}
            >
              Approve Professional
            </button>
          )}
          
          <button 
            onClick={() => onAction(pro._id, 'delete')}
            style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', transition: '0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  statusHeader: { padding: '12px', textAlign: 'center' },
  content: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' },
  section: { marginBottom: '5px' },
  name: { fontSize: '1.4rem', fontWeight: '800', margin: '0 0 5px 0', color: '#0f172a' },
  tradeBadge: { display: 'inline-block', backgroundColor: '#000', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '5px 12px', borderRadius: '6px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  infoItem: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' },
  value: { fontSize: '14px', fontWeight: '600', color: '#334155', textTransform: 'capitalize' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', margin: '5px 0' },
  ratingRow: { display: 'flex', gap: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px' },
  ratingBox: { flex: 1 },
  ratingText: { fontSize: '18px', fontWeight: '900', display: 'block' },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  actionBtn: { width: '100%', padding: '14px', borderRadius: '10px', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }
};