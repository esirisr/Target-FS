import React, { useState } from 'react';

export default function AdminCard({ pro, onAction }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPending = !pro.isVerified;
  const isUnrated = !pro.reviewCount || pro.reviewCount === 0;
  const displayRating = isUnrated ? "0.0" : Number(pro.rating).toFixed(1);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        boxShadow: isHovered 
          ? '0 20px 30px -10px rgba(79,70,229,0.2), 0 8px 15px rgba(0,0,0,0.1)' 
          : '0 10px 25px -5px rgba(0,0,0,0.05), 0 5px 10px -5px rgba(0,0,0,0.02)',
        borderColor: isPending ? '#3b82f6' : '#e2e8f0',
      }}
    >
      {/* Status Badge */}
      <div style={{
        ...styles.statusBadge,
        background: isPending
          ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
          : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        color: isPending ? '#1e40af' : '#166534',
        borderColor: isPending ? '#3b82f6' : '#22c55e',
      }}>
        <span style={styles.statusDot}>●</span>
        {isPending ? 'Pending Approval' : 'Active & Verified'}
      </div>

      {/* Name */}
      <h3 style={styles.name}>{pro.name}</h3>

      {/* Skills Tag (if any) */}
      {pro.skills?.length > 0 && (
        <div style={styles.skillTag}>
          {pro.skills.join(', ')}
        </div>
      )}

      {/* Info Section - reordered to match example: location, phone, email */}
      <div style={styles.infoSection}>
        <div style={styles.infoItem}>📍 {pro.location || "N/A"}</div>
        <div style={styles.infoItem}>📞 {pro.phone || "N/A"}</div>
        <div style={styles.infoItem}>✉️ {pro.email || "N/A"}</div>
      </div>

      {/* Rating Pill */}
      <div style={styles.ratingPill}>
        <span style={styles.ratingLabel}>⭐ Rating</span>
        <span style={{
          ...styles.ratingValue,
          color: isUnrated ? '#94a3b8' : '#f59e0b',
        }}>
          {displayRating}
        </span>
        <span style={styles.reviewCount}>({pro.reviewCount || 0} reviews)</span>
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
            ✓ Approve Professional
          </button>
        )}

        <button
          onClick={() => onAction(pro._id, 'delete')}
          className="admin-button delete"
          style={styles.deleteButton}
        >
          🗑️ Delete Permanently
        </button>
      </div>

      {/* Hover styles for buttons */}
      <style>{`
        .admin-button {
          transition: all 0.3s ease;
          padding: 12px;
          border-radius: 40px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          width: 100%;
          font-size: 0.95rem;
        }
        .admin-button.approve {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 8px 15px -5px rgba(59,130,246,0.3);
        }
        .admin-button.approve:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 12px 20px -8px rgba(59,130,246,0.5);
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }
        .admin-button.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 8px 15px -5px rgba(239,68,68,0.3);
        }
        .admin-button.delete:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 12px 20px -8px rgba(239,68,68,0.5);
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '24px 20px',
    width: '320px',
    border: '2px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
    position: 'relative',
    backdropFilter: 'blur(4px)',
  },
  statusBadge: {
    fontWeight: '700',
    fontSize: '14px',
    padding: '6px 16px',
    borderRadius: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid',
  },
  statusDot: {
    fontSize: '18px',
    lineHeight: 1,
  },
  name: {
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: '#0f172a',
  },
  skillTag: {
    background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '40px',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '20px',
    boxShadow: '0 4px 10px -2px rgba(79,70,229,0.3)',
    display: 'inline-block',
  },
  infoSection: {
    width: '100%',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
    color: '#334155',
    fontWeight: '500',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  ratingPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '10px 16px',
    borderRadius: '40px',
    marginBottom: '16px',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ratingLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  ratingValue: {
    fontSize: '18px',
    fontWeight: '800',
  },
  reviewCount: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
    marginBottom: '16px',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  approveButton: {
    // Base styles handled by className; this object is merged with inline style
  },
  deleteButton: {
    // Same here
  },
};