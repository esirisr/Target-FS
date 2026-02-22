import React, { useState } from 'react';
import API from '../services/api';

export default function ProCard({ pro, onAction, userBookings = [], onNotify }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const data = pro.professional || pro;
  const displayName = data.name || "Professional";

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
      onNotify(
        'You already have a pending request for this professional (submitted within the last 2 hours).',
        'error'
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNotify('Please login first.', 'error');
        return;
      }

      setIsBooking(true);
      await API.post('/bookings/create', { proId: data._id });

      onNotify('Hiring request sent successfully!', 'success');
      onAction();
    } catch (err) {
      const msg = err.response?.data?.message || "";

      if (msg.includes("limit")) {
        onNotify('Daily limit reached for this professional.', 'error');
      } else {
        onNotify(
          err.response?.data?.message || 'Booking failed. Please try again.',
          'error'
        );
      }
    } finally {
      setIsBooking(false);
    }
  };

  // ✅ Removed built-in plumber fallback
  const skills = Array.isArray(data.skills) ? data.skills : [];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 30px -10px rgba(79,70,229,0.2), 0 8px 15px rgba(0,0,0,0.1)'
          : '0 10px 25px -5px rgba(0,0,0,0.05), 0 5px 10px -5px rgba(0,0,0,0.02)',
      }}
    >
      <div style={styles.statusBadge}>
        <span style={styles.statusDot}>●</span> Active & Verified
      </div>

      <h3 style={styles.name}>{displayName}</h3>

      {skills.length > 0 && (
        <div style={styles.skillContainer}>
          {skills.map((skill, index) => {
            let skillName;
            if (typeof skill === 'object' && skill !== null) {
              skillName =
                skill.name ||
                skill.skill ||
                skill.title ||
                skill.value ||
                String(skill);
            } else {
              skillName = String(skill);
            }

            return (
              <span key={index} style={styles.skillBadge}>
                {skillName}
              </span>
            );
          })}
        </div>
      )}

      <div style={styles.infoSection}>
        <div style={styles.infoItem}>📍 {data.location || "N/A"}</div>
        <div style={styles.infoItem}>📞 {data.phone || "N/A"}</div>
        <div style={styles.infoItem}>✉️ {data.email || "N/A"}</div>
        <div style={styles.infoItem}>
          ⭐ {averageRating} ({data.reviewCount || 0} reviews)
        </div>
      </div>

      <button
        onClick={handleHire}
        disabled={isBooking || data.dailyRequestCount >= 3}
        style={{
          ...styles.hireButton,
          opacity: (isBooking || data.dailyRequestCount >= 3) ? 0.7 : 1,
          cursor:
            (isBooking || data.dailyRequestCount >= 3)
              ? 'not-allowed'
              : 'pointer',
        }}
        className="hire-button"
      >
        {data.dailyRequestCount >= 3
          ? 'Daily Limit Reached'
          : isBooking
          ? 'Sending...'
          : 'Hire Now'}
      </button>

      <div style={styles.ratingSection}>
        <div style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              onMouseEnter={() => canRate && setHoverStar(s)}
              onMouseLeave={() => canRate && setHoverStar(0)}
              onClick={() => canRate && handleRate(s)}
              style={{
                ...styles.star,
                color:
                  s <= (hoverStar || data.rating)
                    ? '#f59e0b'
                    : '#e2e8f0',
                transform:
                  hoverStar === s ? 'scale(1.3)' : 'scale(1)',
                cursor: canRate ? 'pointer' : 'default',
              }}
            >
              ★
            </span>
          ))}
        </div>

        {canRate && (
          <div style={styles.rateNowText}>
            Please rate this professional!
          </div>
        )}
      </div>

      <style>{`
        .hire-button {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          border: none;
          color: white;
          font-weight: 700;
          padding: 14px;
          border-radius: 40px;
          width: 100%;
          font-size: 1rem;
          box-shadow: 0 8px 15px -5px rgba(79,70,229,0.3);
        }

        .hire-button:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 12px 20px -8px rgba(79,70,229,0.5);
          background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
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
    border: '1px solid rgba(226, 232, 240, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  statusBadge: {
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    color: '#166534',
    fontWeight: '700',
    fontSize: '14px',
    padding: '6px 16px',
    borderRadius: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(22,101,52,0.2)',
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
  skillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  skillBadge: {
    background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '40px',
    fontWeight: '600',
    fontSize: '13px',
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
  hireButton: {
    width: '100%',
    marginBottom: '16px',
  },
  ratingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
  },
  starRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
  },
  star: {
    fontSize: '28px',
    transition: 'all 0.2s ease',
    padding: '0 2px',
  },
  rateNowText: {
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '700',
    marginTop: '4px',
  },
};