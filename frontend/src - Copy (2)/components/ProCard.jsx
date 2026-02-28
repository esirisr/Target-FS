import React, { useState } from 'react';
import API from '../services/api';

export default function ProCard({ pro, onAction, userBookings = [], onNotify, selectedSkill }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  // Normalizing data to handle both direct pro objects and nested professional objects
  const data = pro.professional || pro;
  const displayName = data.name || "Professional";

  // Check if this specific professional has an accepted booking that needs a rating
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
    // Prevent spam: Check if a request was sent in the last 2 hours
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

      // --- THE FIX: CATEGORY LOGIC ---
      // If the user is filtering by "Plumber", we send "Plumber".
      // If "All" is selected, we send the Pro's first skill from the DB (e.g., "Carpenter").
      const bookingCategory = (selectedSkill && selectedSkill !== "All") 
        ? selectedSkill 
        : (data.skills && data.skills[0]) || 'General Service';

      await API.post('/bookings/create', { 
        proId: data._id,
        category: bookingCategory // This ensures "General" is overwritten
      });

      onNotify(`${bookingCategory} request sent successfully!`, 'success');
      onAction(); // Triggers ClientHome to refresh the sidebar
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

      <div style={styles.skillContainer}>
        {skills.map((skill, index) => (
          <span key={index} style={styles.skillBadge}>
            {typeof skill === 'object' ? (skill.name || skill.title) : String(skill)}
          </span>
        ))}
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoItem}>📍 {data.location || "N/A"}</div>

        <div style={styles.infoItem}>⭐ {averageRating} ({data.reviewCount || 0} reviews)</div>
      </div>

      <button
        onClick={handleHire}
        disabled={isBooking || data.dailyRequestCount >= 3}
        style={{
          ...styles.hireButton,
          opacity: (isBooking || data.dailyRequestCount >= 3) ? 0.7 : 1,
          cursor: (isBooking || data.dailyRequestCount >= 3) ? 'not-allowed' : 'pointer',
        }}
        className="hire-button"
      >
        {data.dailyRequestCount >= 3 ? 'Limit Reached' : isBooking ? 'Sending...' : 'Hire Now'}
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
                color: s <= (hoverStar || 0) ? '#f59e0b' : '#e2e8f0',
                transform: hoverStar === s ? 'scale(1.2)' : 'scale(1)',
                cursor: canRate ? 'pointer' : 'default',
              }}
            >
              ★
            </span>
          ))}
        </div>
        {canRate && <div style={styles.rateNowText}>Please rate your experience!</div>}
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
        }
        .hire-button:hover:not(:disabled) {
          transform: scale(1.02);
          background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
        }
      `}</style>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '24px', padding: '24px 20px', width: '320px', border: '1px solid rgba(226, 232, 240, 0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease', position: 'relative' },
  statusBadge: { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#166534', fontWeight: '700', fontSize: '13px', padding: '6px 16px', borderRadius: '40px', marginBottom: '16px' },
  statusDot: { marginRight: '5px' },
  name: { fontSize: '1.6rem', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a' },
  skillContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' },
  skillBadge: { background: '#4f46e5', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  infoSection: { width: '100%', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#334155' },
  infoItem: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  hireButton: { width: '100%', marginBottom: '16px' },
  ratingSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  starRow: { display: 'flex', gap: '4px' },
  star: { fontSize: '24px', transition: 'all 0.2s' },
  rateNowText: { fontSize: '12px', color: '#10b981', fontWeight: '700' }
};