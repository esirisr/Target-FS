import React, { useState } from 'react';

export default function AdminCard({ pro, onAction }) {
  const [isHovered, setIsHovered] = useState(false);

  const isPending = !pro.isVerified;
  const isUnrated = !pro.reviewCount || pro.reviewCount === 0;
  const displayRating = isUnrated ? "0.0" : Number(pro.rating).toFixed(1);

  // Extract initials for avatar
  const initials = pro.name
    ? pro.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 30px -10px rgba(37, 99, 235, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
          : '0 10px 20px -8px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.02)',
        borderColor: isPending ? '#94a3b8' : '#2563eb',
      }}
    >
      {/* Animated gradient border (blue on hover) */}
      {isHovered && <div style={styles.cardGlow} />}

      {/* Avatar with vibrant blue gradient */}
   

      {/* Status Badge – blue theme */}
      <div
        style={{
          ...styles.statusBadge,
          background: isPending
            ? 'linear-gradient(135deg, #e2e8f0, #cbd5e1)'
            : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          color: isPending ? '#334155' : '#1e40af',
          borderColor: isPending ? '#94a3b8' : '#2563eb',
        }}
      >
        <span style={styles.statusDot}>●</span>
        {isPending ? 'PENDING APPROVAL' : 'ACTIVE & VERIFIED'}
      </div>

      {/* Name */}
      <h3 style={styles.name}>{pro.name}</h3>

      {/* Skills Tag (vibrant blue) */}
      {pro.skills?.length > 0 && (
        <div style={styles.skillTag}>
          {pro.skills.join(' • ')}
        </div>
      )}

      {/* Info Section */}
      <div style={styles.infoSection}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📍</span> {pro.location?.toUpperCase() || 'N/A'}
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📞</span> {pro.phone || 'N/A'}
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>✉️</span> {pro.email?.toUpperCase() || 'N/A'}
        </div>
      </div>

      {/* Rating Pill */}
      <div style={styles.ratingPill}>
        <span style={styles.ratingLabel}>⭐ RATING</span>
        <span
          style={{
            ...styles.ratingValue,
            color: isUnrated ? '#94a3b8' : '#f59e0b',
          }}
        >
          {displayRating}
        </span>
        <span style={styles.reviewCount}>({pro.reviewCount || 0})</span>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Action Buttons */}
      <div style={styles.buttonGroup}>
        {isPending && (
          <button
            onClick={() => onAction(pro._id, 'verify')}
            className="admin-button approve"
            style={styles.approveButton}
          >
            <span style={styles.buttonIcon}>✓</span> APPROVE
          </button>
        )}

        <button
          onClick={() => onAction(pro._id, 'delete')}
          className="admin-button delete"
          style={styles.deleteButton}
        >
          <span style={styles.buttonIcon}>🗑️</span> DELETE
        </button>
      </div>

      {/* Global button styles */}
      <style>{`
        .admin-button {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 12px 18px;
          border-radius: 40px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          width: 100%;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 6px -2px rgba(0, 0, 0, 0.1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .admin-button.approve {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
        }
        .admin-button.approve:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 12px 20px -10px rgba(37, 99, 235, 0.4);
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
        }
        .admin-button.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }
        .admin-button.delete:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 12px 20px -10px rgba(239, 68, 68, 0.4);
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }
        .admin-button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: '28px',
    padding: '22px 19px',
    width: '272px',
    border: '1px solid #64748b', // darker border for visibility
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.25s ease, box-shadow 0.3s ease, border-color 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
    border: '3px solid white',
    boxShadow: '0 8px 15px -6px rgba(37, 99, 235, 0.4)',
  },
  avatarText: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    fontWeight: '700',
    fontSize: '0.85rem',        // increased
    padding: '6px 16px',         // more padding
    borderRadius: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '14px',
    boxShadow: '0 4px 8px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statusDot: {
    fontSize: '16px',
    lineHeight: 1,
  },
  name: {
    fontSize: '1.3rem',          // matched to ProCard name
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: '#0f172a',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  skillTag: {
    background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '40px',
    fontWeight: '700',
    fontSize: '0.85rem',          // increased
    marginBottom: '18px',
    boxShadow: '0 4px 10px -2px rgba(37, 99, 235, 0.3)',
    display: 'inline-block',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  infoSection: {
    width: '100%',
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.85rem',          // increased
    color: '#334155',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  infoIcon: {
    fontSize: '1rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
  ratingPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    padding: '8px 16px',
    borderRadius: '40px',
    marginBottom: '16px',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid #e2e8f0',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
  },
  ratingLabel: {
    fontSize: '0.8rem',           // increased
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  ratingValue: {
    fontSize: '1.3rem',           // slightly larger
    fontWeight: '800',
  },
  reviewCount: {
    fontSize: '0.8rem',           // increased
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)',
    marginBottom: '18px',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  buttonIcon: {
    fontSize: '1.1rem',
  },
};