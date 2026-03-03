import React, { useState } from 'react';
import API from '../services/api';

export default function ProCard({ pro, onAction, userBookings = [], onNotify, selectedSkill }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const data = pro.professional || pro;
  const displayName = data.name || "Professional";

  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bookingToRate = userBookings.find(b =>
    b.professional?._id === data._id &&
    (b.status === 'approved' || b.status === 'accepted') &&
    !b.rating
  );

  const canRate = !!bookingToRate;
  const averageRating = data.rating ? Number(data.rating).toFixed(1) : "0.0";

  const handleRate = async (val) => {
    try {
      await API.post('/bookings/rate', {
        bookingId: bookingToRate._id,
        ratingValue: val
      });
      onNotify('Rating submitted successfully!', 'success');
      onAction();
    } catch (err) {
      onNotify('Error saving rating.', 'error');
    }
  };

  const handleHire = async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const hasRecentPending = userBookings.some(b =>
      b.professional?._id === data._id &&
      b.status === 'pending' &&
      new Date(b.createdAt) > twoHoursAgo
    );

    if (hasRecentPending) {
      onNotify('You already have a pending request for this pro submitted recently.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNotify('Please login first.', 'error');
        return;
      }

      setIsBooking(true);
      const bookingCategory = (selectedSkill && selectedSkill !== "All") 
        ? selectedSkill 
        : (data.skills && data.skills[0]) || 'General Service';

      await API.post('/bookings/create', { 
        proId: data._id,
        category: bookingCategory
      });

      onNotify(`${bookingCategory} request sent successfully!`, 'success');
      onAction();
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed.";
      onNotify(msg, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const skills = Array.isArray(data.skills) ? data.skills : [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 30px -10px rgba(59,130,246,0.3), 0 10px 20px -5px rgba(0,0,0,0.1)'
          : '0 10px 20px -8px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.02)',
      }}
    >
      {/* Decorative top bar */}
      <div style={styles.cardTopBar} />

      {/* Avatar with verified badge */}
      <div style={styles.avatarContainer}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>{initials}</span>
        </div>
        <div style={styles.verifiedBadge}>✓</div>
      </div>

      <h4 style={styles.name}>{displayName}</h4>

      {skills.length > 0 && (
        <div style={styles.skillTag} title={skills.join(' • ')}>
          {skills[0]}{skills.length > 1 ? ' +' : ''}
        </div>
      )}

      <div style={styles.infoSection}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>📍</span> 
          <span style={styles.infoText}>{data.location?.split(',')[0] || 'Hargeisa'}</span>
        </div>
      </div>

      <div style={styles.ratingContainer}>
        <div style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              onMouseEnter={() => canRate && setHoverStar(s)}
              onMouseLeave={() => canRate && setHoverStar(0)}
              onClick={() => canRate && handleRate(s)}
              style={{
                ...styles.star,
                color: s <= (hoverStar || Math.floor(parseFloat(averageRating))) 
                  ? '#fbbf24' 
                  : '#e2e8f0',
                transform: hoverStar === s ? 'scale(1.2)' : 'scale(1)',
                cursor: canRate ? 'pointer' : 'default',
              }}
            >
              ★
            </span>
          ))}
        </div>
        {canRate && <div style={styles.rateNowText}>PLEASE RATE!</div>}
        {!canRate && (
          <span style={styles.ratingText}>
            {averageRating} ({data.reviewCount || 0} REVIEWS)
          </span>
        )}
      </div>

      <button
        onClick={handleHire}
        disabled={isBooking || data.dailyRequestCount >= 3}
        style={{
          ...styles.hireButton,
          opacity: (isBooking || data.dailyRequestCount >= 3) ? 0.7 : 1,
          cursor: (isBooking || data.dailyRequestCount >= 3) ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={styles.buttonIcon}>📨</span>
        {data.dailyRequestCount >= 3 ? 'LIMIT REACHED' : isBooking ? 'SENDING...' : 'HIRE NOW'}
      </button>

      {/* Hover glow effect */}
      {isHovered && <div style={styles.cardGlow} />}
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '28px',
    padding: '22px 16px',
    width: '100%',
    maxWidth: '300px',         // Cap maximum width
    margin: '0 auto',
    border: '1px solid #64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02), 0 10px 20px -8px rgba(0,0,0,0.08)',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  cardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
  },
  cardGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: '12px',
  },
  avatar: {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid white',
    boxShadow: '0 8px 12px -6px rgba(79,70,229,0.3)',
  },
  avatarText: {
    color: 'white',
    fontSize: '2.0rem',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: '0px',
    right: '0px',
    width: '24px',
    height: '24px',
    background: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '15px',
    fontWeight: '800',
    border: '2px solid white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  name: {
    fontSize: '1.4rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    color: '#0f172a',
    textTransform: 'uppercase',
    width: '100%',
  },
  skillTag: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '6px 18px',
    borderRadius: '30px',
    fontWeight: '800',
    fontSize: '0.95rem',
    marginBottom: '16px',
    border: '1px solid #cbd5e1',
    display: 'inline-block',
    textTransform: 'uppercase',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  infoSection: {
    width: '100%',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.95rem',
    color: '#334155',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  infoIcon: {
    fontSize: '1.1rem',
    fontWeight: '400',
  },
  infoText: {
    wordBreak: 'break-word',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '16px',
    width: '100%',
  },
  starsContainer: {
    display: 'flex',
    gap: '4px',
  },
  star: {
    fontSize: '1.4rem',
    transition: 'all 0.2s',
  },
  ratingText: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  rateNowText: {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  hireButton: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '12px 18px',
    fontSize: '1.0rem',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px -4px #3b82f6',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  buttonIcon: {
    fontSize: '1.1rem',
  },
};