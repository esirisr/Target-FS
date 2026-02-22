import React, { useState } from 'react';
import axios from 'axios';

export default function ProCard({
  pro,
  onAction,
  userBookings = [],
  role = "guest"
}) {

  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const data = pro.professional || pro;
  const displayName = data.name || "Professional";
  const displaySkills = data.skills?.length > 0
    ? data.skills.join(', ')
    : "No Skills";

  const bookingToRate = userBookings.find(b =>
    b.professional?._id === data._id &&
    (b.status === 'approved' || b.status === 'accepted') &&
    !b.rating
  );

  const canRate = !!bookingToRate;
  const averageRating = data.rating
    ? Number(data.rating).toFixed(1)
    : "0.0";

  // RATE
  const handleRate = async (val) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'https://hbe-production.up.railway.app/api/bookings/rate',
        { bookingId: bookingToRate._id, ratingValue: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Rating submitted!");
      onAction && onAction();

    } catch (err) {
      alert("Error saving rating.");
    }
  };

  // HIRE
  const handleHire = async () => {
    const hasPending = userBookings.some(
      b => b.professional?._id === data._id && b.status === 'pending'
    );

    if (hasPending) {
      return alert(`You already requested this service!`);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Please login first.");

      setIsBooking(true);

      await axios.post(
        'https://hbe-production.up.railway.app/api/bookings/create',
        { proId: data._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Hiring request sent successfully!");
      onAction && onAction();

    } catch (err) {
      alert("Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div style={styles.card}>

      <div style={styles.statusBadge}>
        <span style={styles.statusDot}>●</span> Active & Verified
      </div>

      <h3 style={styles.name}>{displayName}</h3>

      <div style={styles.skillTag}>
        {displaySkills}
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoItem}>
          📍 {data.location || "Unknown"}
        </div>

        {/* PHONE ONLY FOR PRO OR ADMIN */}
        {(role === 'pro' || role === 'admin') && data.phone && (
          <div style={styles.infoItem}>
            📞 {data.phone}
          </div>
        )}

        <div style={styles.infoItem}>
          ✉️ {data.email || "N/A"}
        </div>

        <div style={styles.infoItem}>
          ⭐ {averageRating} ({data.reviewCount || 0} reviews)
        </div>
      </div>

      <button
        onClick={handleHire}
        disabled={isBooking || data.dailyRequestCount >= 3}
        style={styles.hireButton}
      >
        {data.dailyRequestCount >= 3
          ? 'Daily Limit Reached'
          : (isBooking ? 'Sending...' : 'Hire Now')}
      </button>

      <div style={styles.ratingSection}>
        <div style={styles.starRow}>
          {[1,2,3,4,5].map((s) => (
            <span
              key={s}
              onMouseEnter={() => canRate && setHoverStar(s)}
              onMouseLeave={() => canRate && setHoverStar(0)}
              onClick={() => canRate && handleRate(s)}
              style={{
                ...styles.star,
                color: s <= (hoverStar || data.rating) ? '#f59e0b' : '#e2e8f0',
                transform: hoverStar === s ? 'scale(1.3)' : 'scale(1)',
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
    </div>
  );
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '24px 20px',
    width: '320px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  statusBadge: {
    background: '#dcfce7',
    color: '#166534',
    padding: '6px 16px',
    borderRadius: '40px',
    marginBottom: '12px',
  },
  statusDot: { fontSize: '18px' },
  name: { fontSize: '1.8rem', fontWeight: '800' },
  skillTag: { marginBottom: '12px', color: '#4f46e5' },
  infoSection: { marginBottom: '12px' },
  infoItem: { marginBottom: '6px' },
  hireButton: {
    width: '100%',
    padding: '12px',
    borderRadius: '40px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
  },
  ratingSection: { marginTop: '12px' },
  starRow: { display: 'flex', justifyContent: 'center', gap: '4px' },
  star: { fontSize: '28px' },
  rateNowText: { fontSize: '13px', color: '#10b981' },
};
