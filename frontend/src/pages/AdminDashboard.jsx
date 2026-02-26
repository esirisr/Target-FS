import React, { useState, useEffect } from "react";
import { fetchAnalytics } from "../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAnalytics();
        const rawData = response.data;

        // Add computed fields
        const enhancedData = {
          ...rawData,
          totalClients: (rawData.totalUsers || 0) - (rawData.totalPros || 0),
        };

        setData(enhancedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) return <div style={{ padding: '40px' }}>Loading Command Center...</div>;
  if (error) return <div className="error-state">System Error: {error}</div>;

  // --- Helper functions & derived metrics ---
  const totalUsers = data.totalUsers || 0;
  const totalPros = data.totalPros || 0;
  const totalClients = data.totalClients;
  const verifiedPros = data.verifiedPros || 0;
  const suspendedPros = data.suspendedPros || 0;
  const totalBookings = data.totalBookings || 0;

  // Percentages
  const verifiedProPercent = totalPros > 0 ? ((verifiedPros / totalPros) * 100).toFixed(1) : 0;
  const suspendedProPercent = totalPros > 0 ? ((suspendedPros / totalPros) * 100).toFixed(1) : 0;
  const proCoverage = totalUsers > 0 ? ((totalPros / totalUsers) * 100).toFixed(1) : 0;

  // Averages
  const avgBookingsPerUser = totalUsers > 0 ? (totalBookings / totalUsers).toFixed(2) : 0;
  const avgBookingsPerPro = totalPros > 0 ? (totalBookings / totalPros).toFixed(2) : 0;

  // Totals from location arrays
  const totalRequests = (data.requestsPerLocation || []).reduce((sum, loc) => sum + loc.count, 0);
  const totalBookingsByCategory = (data.bookingsPerCategory || []).reduce((sum, cat) => sum + cat.count, 0);

  // Month name mapping
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Max values for bar scaling
  const maxUserMonth = Math.max(...(data.usersByMonth || []).map(m => m.count), 1);
  const maxBookingMonth = Math.max(...(data.monthlyBookings || []).map(m => m.count), 1);
  const maxRequests = Math.max(...(data.requestsPerLocation || []).map(l => l.count), 1);
  const maxUsersPerLoc = Math.max(...(data.usersPerLocation || []).map(l => l.count), 1);
  const maxProsPerLoc = Math.max(...(data.prosPerLocation || []).map(l => l.count), 1);

  return (
    <div className="admin-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        :root {
          --primary: #0059FF;
          --primary-light: #e6efff;
          --primary-dark: #0046cc;
          --bg: #f4f7ff;
          --card: #ffffff;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --success: #10b981;
          --danger: #ff4d4d;
          --warning: #f59e0b;
          --info: #60a5fa; /* Added missing info color */
        }

        .admin-container { 
          background: var(--bg); 
          min-height: 100vh; 
          padding: 40px; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          color: var(--text-main);
        }

        /* Header Styles */
        .header { 
          margin-bottom: 40px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          background: white;
          padding: 24px 32px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 89, 255, 0.05);
        }

        /* Stat Cards */
        .kpi-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 24px; 
          margin-bottom: 32px; 
        }

        .kpi-card { 
          background: var(--card); 
          padding: 24px; 
          border-radius: 20px; 
          border: 1px solid white;
          box-shadow: 0 10px 15px -3px rgba(0, 89, 255, 0.04);
          transition: transform 0.2s ease;
        }
        
        .kpi-card:hover {
          transform: translateY(-4px);
        }

        .kpi-label { 
          font-size: 0.8rem; 
          font-weight: 700; 
          color: var(--text-muted); 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }

        .kpi-value { 
          font-size: 2.2rem; 
          font-weight: 800; 
          margin-top: 8px; 
          color: var(--primary);
          letter-spacing: -0.02em;
        }

        .kpi-sub { 
          font-size: 0.8rem; 
          color: var(--text-muted); 
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--bg);
        }

        /* Panels & Layout */
        .dashboard-layout { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 32px; 
          margin-bottom: 32px; 
        }

        .panel { 
          background: var(--card); 
          padding: 32px; 
          border-radius: 24px; 
          border: 1px solid white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.02);
        }

        .panel-title { 
          font-size: 1.25rem; 
          font-weight: 800; 
          margin-bottom: 24px; 
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Charts & Bars */
        .bar-chart { 
          display: flex; 
          align-items: flex-end; 
          gap: 12px; 
          height: 180px; 
          margin-top: 20px; 
          padding-bottom: 10px;
        }

        .bar { 
          background: linear-gradient(180deg, var(--primary) 0%, #60a5fa 100%); 
          border-radius: 6px 6px 2px 2px; 
          width: 100%;
          min-height: 4px; 
          transition: all 0.3s ease; 
        }

        .bar:hover {
          filter: brightness(1.1);
          cursor: pointer;
        }

        .bar-label { 
          font-size: 0.75rem; 
          font-weight: 600;
          color: var(--text-muted); 
          margin-top: 8px; 
        }

        /* Progress Bars */
        .progress-bar { 
          background: var(--bg); 
          height: 10px; 
          border-radius: 10px; 
          overflow: hidden; 
          margin: 10px 0; 
        }

        .progress-fill { 
          height: 100%; 
          background: var(--primary); 
          border-radius: 10px; 
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom Elements */
        .location-chip { 
          background: white; 
          padding: 16px; 
          border-radius: 16px; 
          border: 1px solid var(--border); 
          margin-bottom: 12px; 
          transition: all 0.2s ease;
        }
        
        .location-chip:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 89, 255, 0.08);
        }

        .skill-tag { 
          font-size: 0.8rem; 
          font-weight: 600;
          background: var(--primary-light); 
          color: var(--primary); 
          padding: 6px 14px; 
          border-radius: 10px; 
          margin: 4px; 
          display: inline-block; 
          border: 1px solid rgba(0, 89, 255, 0.1);
        }

        .percentage-badge { 
          font-size: 0.75rem; 
          font-weight: 700; 
          color: var(--primary); 
          background: var(--primary-light);
          padding: 2px 8px;
          border-radius: 6px;
        }

        .error-state {
          padding: 40px;
          color: var(--danger);
          background: #fff1f1;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
        }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        /* Utilities */
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .stat-row { margin-bottom: 18px; }
      `}</style>

      <header className="header">
        <div>
          <h1 style={{margin: 0, fontSize: '1.8rem'}}>Operational Command Center</h1>
          <p style={{color: '#64748b', margin: '4px 0 0'}}>
            Pro Concentration: <strong>{proCoverage}%</strong> · Verified Pros: <strong>{verifiedProPercent}%</strong>
          </p>
        </div>
        <div style={{textAlign: 'right'}}>
          <div className="kpi-label">System Status</div>
          <div style={{fontSize: '1.2rem', fontWeight: 800, color: suspendedPros > 0 ? 'var(--warning)' : 'var(--success)'}}>
            {suspendedPros > 0 ? '⚠️ Attention' : '✅ Operational'}
          </div>
        </div>
      </header>

      {/* Main KPI Row */}
      <div className="kpi-grid">
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Professionals" value={totalPros} sub={`Verified: ${verifiedPros} | Suspended: ${suspendedPros}`} />
        <StatCard label="Clients" value={totalClients} />
        <StatCard label="Total Bookings" value={totalBookings} />
      </div>

      {/* Secondary KPI Row */}
      <div className="kpi-grid">
        <StatCard label="Avg Bookings/User" value={avgBookingsPerUser} />
        <StatCard label="Avg Bookings/Pro" value={avgBookingsPerPro} />
        <StatCard label="Total Requests" value={totalRequests} />
        <StatCard label="Categories w/ Bookings" value={data.bookingsPerCategory?.length || 0} />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-layout">
        {/* Left Column: User Growth & Monthly Bookings */}
        <div className="panel">
          <div className="panel-title">📈 User Growth & Monthly Bookings</div>
          <div style={{ marginBottom: '30px' }}>
            <div className="flex-between">
              <span style={{ fontWeight: 600 }}>Users by Month</span>
              <span className="percentage-badge">Total: {totalUsers}</span>
            </div>
            {data.usersByMonth?.length > 0 ? (
              <div className="bar-chart">
                {data.usersByMonth.map(m => (
                  <div key={`user-${m._id}`} className="bar-container">
                    <div className="bar" style={{ height: `${(m.count / maxUserMonth) * 120}px`, background: 'var(--info)' }} />
                    <div className="bar-label">{monthNames[m._id - 1] || `M${m._id}`}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>{m.count}</div>
                  </div>
                ))}
              </div>
            ) : <p>No user month data</p>}
          </div>

          <div>
            <div className="flex-between">
              <span style={{ fontWeight: 600 }}>Bookings by Month</span>
              <span className="percentage-badge">Total: {totalBookings}</span>
            </div>
            {data.monthlyBookings?.length > 0 ? (
              <div className="bar-chart">
                {data.monthlyBookings.map(m => (
                  <div key={`booking-${m._id}`} className="bar-container">
                    <div className="bar" style={{ height: `${(m.count / maxBookingMonth) * 120}px`, background: 'var(--success)' }} />
                    <div className="bar-label">{monthNames[m._id - 1] || `M${m._id}`}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>{m.count}</div>
                  </div>
                ))}
              </div>
            ) : <p>No monthly booking data</p>}
          </div>
        </div>

        {/* Right Column: Requests & Categories */}
        <div className="panel">
          <div className="panel-title">📍 Requests by Location</div>
          {data.requestsPerLocation?.length > 0 ? (
            data.requestsPerLocation.map(loc => (
              <div key={loc._id || 'unknown'} className="stat-row">
                <div className="flex-between">
                  <span style={{ textTransform: 'capitalize' }}>{loc._id || 'Unknown'}</span>
                  <span><strong>{loc.count}</strong> req</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(loc.count / maxRequests) * 100}%` }} />
                </div>
              </div>
            ))
          ) : <p>No request location data</p>}

          <div className="panel-title" style={{ marginTop: '30px' }}>📦 Bookings by Category</div>
          {data.bookingsPerCategory?.length > 0 ? (
            data.bookingsPerCategory.map(cat => (
              <div key={cat._id || 'unknown'} className="stat-row">
                <div className="flex-between">
                  <span>{cat._id || 'Uncategorized'}</span>
                  <span><strong>{cat.count}</strong> bookings</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(cat.count / totalBookings) * 100}%`, background: 'var(--warning)' }} />
                </div>
              </div>
            ))
          ) : <p>No category data</p>}
        </div>
      </div>

      {/* Second Row: Location Breakdown & Skills */}
      <div className="dashboard-layout">
        {/* Left: Users vs Pros per Location */}
        <div className="panel">
          <div className="panel-title">👥 Users vs Pros by City</div>
          {data.usersPerLocation?.length > 0 ? (
            data.usersPerLocation.map(loc => {
              const prosAtLoc = (data.prosPerLocation || []).find(p => p._id === loc._id)?.count || 0;
              const proPercent = loc.count > 0 ? ((prosAtLoc / loc.count) * 100).toFixed(1) : 0;
              return (
                <div key={loc._id} className="location-chip">
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{loc._id}</span>
                    <span><strong>{loc.count}</strong> users · <strong>{prosAtLoc}</strong> pros</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${(loc.count / maxUsersPerLoc) * 100}%`, background: 'var(--info)' }} />
                      </div>
                      <div style={{ fontSize: '0.65rem' }}>Users</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${(prosAtLoc / maxProsPerLoc) * 100}%`, background: 'var(--success)' }} />
                      </div>
                      <div style={{ fontSize: '0.65rem' }}>Pros</div>
                    </div>
                  </div>
                  <div className="flex-between" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                    <span>Pro concentration</span>
                    <span className="percentage-badge">{proPercent}%</span>
                  </div>
                </div>
              );
            })
          ) : <p>No location data</p>}
        </div>

        {/* Right: Skills Distribution & Pro Stats */}
        <div className="panel">
          <div className="panel-title">🔧 Skills Distribution</div>
          {data.skillsDistribution?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px' }}>
              {data.skillsDistribution.map(skill => (
                <span key={skill._id} className="skill-tag">
                  {skill._id} <strong>({skill.count})</strong>
                </span>
              ))}
            </div>
          ) : <p>No skills data</p>}

          <div className="panel-title">📊 Pro Health Metrics</div>
          <div className="grid-2">
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-label">Verification Rate</div>
              <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{verifiedProPercent}%</div>
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{ width: `${verifiedProPercent}%`, background: 'var(--success)' }} />
              </div>
            </div>
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-label">Suspension Rate</div>
              <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{suspendedProPercent}%</div>
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div className="progress-fill" style={{ width: `${suspendedProPercent}%`, background: 'var(--danger)' }} />
              </div>
            </div>
          </div>

          {/* Additional summary */}
          <div style={{ marginTop: '20px' }}>
            <div className="flex-between">
              <span>Total Pros: {totalPros}</span>
              <span>Active Pros: {totalPros - suspendedPros}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value?.toLocaleString() || 0}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}