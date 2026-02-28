import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchAnalytics } from "../services/api";

// ==================== CONSTANTS ====================
const REFRESH_INTERVAL = 300000; // 5 minutes (optional auto-refresh)

// ==================== HELPER FUNCTIONS ====================
const normalizeLocationArray = (arr) => {
  const map = new Map();
  (arr || []).forEach((item) => {
    const key = item._id?.toString().trim().toLowerCase() || "unknown";
    const current = map.get(key) || 0;
    map.set(key, current + item.count);
  });
  return Array.from(map, ([_id, count]) => ({ _id, count }));
};

const getMax = (arr, field = "count") => Math.max(...(arr || []).map((item) => item[field]), 1);

const formatNumber = (num) => (num || 0).toLocaleString();

// ==================== CUSTOM HOOK ====================
const useAnalyticsData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetchAnalytics();
      const rawData = response.data;

      const enhancedData = {
        ...rawData,
        usersPerLocation: normalizeLocationArray(rawData.usersPerLocation),
        prosPerLocation: normalizeLocationArray(rawData.prosPerLocation),
        requestsPerLocation: normalizeLocationArray(rawData.requestsPerLocation),
        totalClients: (rawData.totalUsers || 0) - (rawData.totalPros || 0),
      };

      setData(enhancedData);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Optional: auto-refresh every 5 minutes
    const interval = setInterval(() => loadData(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return { data, isLoading, error, lastUpdated, refetch: () => loadData(true) };
};

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard() {
  const { data, isLoading, error, lastUpdated, refetch } = useAnalyticsData();

  const {
    totalUsers,
    totalPros,
    totalClients,
    verifiedPros,
    suspendedPros,
    totalBookings,
    totalRequests,
    verifiedProPercent,
    suspendedProPercent,
    avgBookingsPerUser,
    avgBookingsPerPro,
    maxRequests,
    maxUsersPerLoc,
    maxProsPerLoc,
  } = useMemo(() => {
    if (!data)
      return {
        totalUsers: 0,
        totalPros: 0,
        totalClients: 0,
        verifiedPros: 0,
        suspendedPros: 0,
        totalBookings: 0,
        totalRequests: 0,
        verifiedProPercent: "0",
        suspendedProPercent: "0",
        avgBookingsPerUser: "0",
        avgBookingsPerPro: "0",
        maxRequests: 1,
        maxUsersPerLoc: 1,
        maxProsPerLoc: 1,
      };

    const totalUsers = data.totalUsers || 0;
    const totalPros = data.totalPros || 0;
    const verifiedPros = data.verifiedPros || 0;
    const suspendedPros = data.suspendedPros || 0;
    const totalBookings = data.totalBookings || 0;

    return {
      totalUsers,
      totalPros,
      totalClients: data.totalClients || 0,
      verifiedPros,
      suspendedPros,
      totalBookings,
      totalRequests: (data.requestsPerLocation || []).reduce((sum, loc) => sum + loc.count, 0),
      verifiedProPercent: totalPros > 0 ? ((verifiedPros / totalPros) * 100).toFixed(1) : "0",
      suspendedProPercent: totalPros > 0 ? ((suspendedPros / totalPros) * 100).toFixed(1) : "0",
      avgBookingsPerUser: totalUsers > 0 ? (totalBookings / totalUsers).toFixed(2) : "0",
      avgBookingsPerPro: totalPros > 0 ? (totalBookings / totalPros).toFixed(2) : "0",
      maxRequests: getMax(data.requestsPerLocation),
      maxUsersPerLoc: getMax(data.usersPerLocation),
      maxProsPerLoc: getMax(data.prosPerLocation),
    };
  }, [data]);

  if (isLoading && !data) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="admin-dashboard">
      <DesignTokens />
      <Header lastUpdated={lastUpdated} onRefresh={refetch} isRefreshing={isLoading} />

      {/* KPI Sections – trend props removed */}
      <section className="kpi-section">
        <div className="kpi-grid">
          <StatCard label="Total Users" value={totalUsers} icon="👥" />
          <StatCard label="Clients" value={totalClients} icon="🙋" />
          <StatCard label="Total Pros" value={totalPros} icon="🔧" />
          <StatCard label="Total Bookings" value={totalBookings} icon="📅" />
        </div>
        <div className="kpi-grid">
          <StatCard label="Avg Bookings/User" value={avgBookingsPerUser} icon="📊" />
          <StatCard label="Avg Bookings/Pro" value={avgBookingsPerPro} icon="⚙️" />
          <StatCard label="Total Requests" value={totalRequests} icon="📍" />
          <StatCard
            label="Categories w/ Bookings"
            value={data.bookingsPerCategory?.length || 0}
            icon="📦"
          />
        </div>
      </section>

      {/* Main Panels */}
      <div className="panels-grid">
        {/* Full-width: Requests & Categories */}
        <Panel title="📍 Requests by Location & 📦 Categories" accentColor="var(--primary)">
          <div className="panel-row">
            <div className="panel-half">
              <h3 className="panel-subtitle">Requests by Location</h3>
              {data.requestsPerLocation?.length > 0 ? (
                data.requestsPerLocation.map((loc) => (
                  <ProgressRow
                    key={loc._id}
                    label={loc._id}
                    value={loc.count}
                    max={maxRequests}
                    color="var(--primary)"
                    suffix="req"
                  />
                ))
              ) : (
                <EmptyState message="No request location data" />
              )}
            </div>
            <div className="panel-half">
              <h3 className="panel-subtitle">Bookings by Category</h3>
              {data.bookingsPerCategory?.length > 0 ? (
                data.bookingsPerCategory.map((cat) => (
                  <ProgressRow
                    key={cat._id}
                    label={cat._id}
                    value={cat.count}
                    max={totalBookings}
                    color="var(--warning)"
                    suffix="bookings"
                  />
                ))
              ) : (
                <EmptyState message="No category data" />
              )}
            </div>
          </div>
        </Panel>

        {/* Two-column row: Users vs Pros & Skills */}
        <Panel title="👥 Users vs Pros by City" accentColor="var(--info)" className="half-panel">
          {data.usersPerLocation?.length > 0 ? (
            data.usersPerLocation.map((loc) => {
              const prosAtLoc =
                (data.prosPerLocation || []).find((p) => p._id === loc._id)?.count || 0;
              const proPercent = loc.count > 0 ? ((prosAtLoc / loc.count) * 100).toFixed(1) : "0";
              return (
                <div key={loc._id} className="location-card">
                  <div className="location-header">
                    <span className="location-name">{loc._id}</span>
                    <span className="location-stats">
                      <strong>{loc.count}</strong> users · <strong>{prosAtLoc}</strong> pros
                    </span>
                  </div>
                  <div className="location-bars">
                    <div className="bar-item">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(loc.count / maxUsersPerLoc) * 100}%`, background: "var(--info)" }}
                          aria-label={`${loc.count} users`}
                        />
                      </div>
                      <span className="bar-label">Users</span>
                    </div>
                    <div className="bar-item">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(prosAtLoc / maxProsPerLoc) * 100}%`, background: "var(--success)" }}
                          aria-label={`${prosAtLoc} pros`}
                        />
                      </div>
                      <span className="bar-label">Pros</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState message="No location data" />
          )}
        </Panel>

        <Panel title="🔧 Skills & Pro Health" accentColor="var(--warning)" className="half-panel">
          <div className="panel-subsection">
            <h3 className="panel-subtitle">Skills Distribution</h3>
            {data.skillsDistribution?.length > 0 ? (
              /* ===== NEW TABLE STYLE FOR SKILLS ===== */
              <div className="skills-table">
                <div className="skills-table-header">
                  <span>Skill</span>
                  <span>Count</span>
                </div>
                {data.skillsDistribution.map((skill) => (
                  <div key={skill._id} className="skills-table-row">
                    <span>{skill._id}</span>
                    <span>
                      <strong>{skill.count}</strong>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No skills data" />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ==================== SUBCOMPONENTS ====================

const Header = ({ lastUpdated, onRefresh, isRefreshing }) => {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Command Center</h1>
        <div className="header-badge">LIVE</div>
      </div>
      <div className="header-right">
        <div className="last-updated">
          <span className="last-updated-label">Last updated</span>
          <span className="last-updated-time">{formattedTime}</span>
        </div>
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh data"
        >
          <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>⟳</span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </header>
  );
};

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="stat-card" role="region" aria-label={label}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{formatNumber(value)}</div>
      </div>
    </div>
  );
};

const Panel = ({ title, children, accentColor, className = '' }) => (
  <div className={`panel ${className}`} style={{ '--panel-accent': accentColor }}>
    <h2 className="panel-title">{title}</h2>
    <div className="panel-content">{children}</div>
  </div>
);

const ProgressRow = ({ label, value, max, color, suffix }) => (
  <div className="progress-row">
    <div className="progress-row-header">
      <span className="progress-label">{label}</span>
      <span className="progress-value">
        <strong>{value}</strong> {suffix}
      </span>
    </div>
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${(value / max) * 100}%`,
          background: color,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-label={`${value} ${suffix}`}
      />
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="admin-dashboard loading">
    <div className="skeleton header-skeleton"></div>
    <div className="kpi-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton card-skeleton"></div>
      ))}
    </div>
    <div className="panels-grid">
      <div className="skeleton panel-skeleton"></div>
      <div className="skeleton panel-skeleton"></div>
      <div className="skeleton panel-skeleton"></div>
    </div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-state" role="alert">
    <h2>⚠️ System Error</h2>
    <p>{message}</p>
    <button className="retry-btn" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

const EmptyState = ({ message }) => <p className="empty-state">{message}</p>;

// ==================== DESIGN TOKENS & STYLES ====================
const DesignTokens = () => (
  <style>{`
    :root {
      /* Core palette */
      --primary: #4361ee;
      --primary-light: #e0e7ff;
      --primary-dark: #3730a3;
      --bg: #f8fafc;
      --card-bg: rgba(255, 255, 255, 0.8);
      --card-bg-solid: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --info: #3b82f6;

      /* Glass effect */
      --glass-blur: 12px;
      --glass-border: 1px solid rgba(255, 255, 255, 0.2);
      --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
      --radius-lg: 28px;
      --radius-md: 20px;
      --radius-sm: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: var(--bg);
    }

    .admin-dashboard {
      min-height: 100vh;
      padding: 32px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-main);
      background: radial-gradient(circle at 10% 20%, rgba(67, 97, 238, 0.03) 0%, transparent 30%),
                  radial-gradient(circle at 90% 70%, rgba(245, 158, 11, 0.03) 0%, transparent 30%),
                  var(--bg);
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      padding: 20px 32px;
      border-radius: var(--radius-lg);
      border: var(--glass-border);
      box-shadow: var(--shadow-sm);
      margin-bottom: 32px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-title {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary) 0%, var(--info) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-badge {
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
      animation: pulse-green 2s infinite;
    }

    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
      70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .last-updated {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.8rem;
    }

    .last-updated-label {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .last-updated-time {
      font-weight: 700;
      font-size: 0.9rem;
    }

    .refresh-btn {
      background: var(--primary-light);
      border: none;
      color: var(--primary-dark);
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .refresh-btn:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .refresh-icon {
      display: inline-block;
      font-size: 1.2rem;
      transition: transform 0.3s;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* KPI Grid */
    .kpi-section {
      margin-bottom: 32px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--card-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      padding: 24px;
      border-radius: var(--radius-md);
      border: var(--glass-border);
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-md);
      padding: 2px;
      background: linear-gradient(135deg, var(--primary), var(--info));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: transparent;
    }

    .stat-card:hover::after {
      opacity: 1;
    }

    .stat-icon {
      font-size: 2.2rem;
      background: var(--primary-light);
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(67, 97, 238, 0.2);
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    /* Panels Grid */
    .panels-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .panel {
      background: var(--card-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border-radius: var(--radius-lg);
      border: var(--glass-border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      grid-column: span 1;
    }

    .panel.half-panel {
      grid-column: span 1;
    }

    .panel:first-child {
      grid-column: 1 / -1; /* Full width */
    }

    .panel:hover {
      box-shadow: var(--shadow-md);
    }

    .panel-title {
      font-size: 1.3rem;
      font-weight: 800;
      padding: 24px 28px 0;
      margin-bottom: 16px;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid rgba(0,0,0,0.05);
      padding-bottom: 16px;
    }

    .panel-content {
      padding: 0 28px 28px;
    }

    .panel-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .panel-half {
      min-width: 0;
    }

    .panel-subtitle {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Progress rows */
    .progress-row {
      margin-bottom: 16px;
    }

    .progress-row-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .progress-label {
      text-transform: capitalize;
      color: var(--text-main);
      font-weight: 500;
    }

    .progress-value {
      color: var(--text-muted);
    }

    .progress-bar {
      background: rgba(0,0,0,0.05);
      height: 8px;
      border-radius: 20px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 20px;
      transition: width 1s ease;
    }

    /* Location cards */
    .location-card {
      background: var(--card-bg-solid);
      padding: 20px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      margin-bottom: 16px;
      transition: all 0.2s;
    }

    .location-card:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 20px rgba(67, 97, 238, 0.1);
      transform: translateY(-2px);
    }

    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .location-name {
      font-weight: 700;
      text-transform: capitalize;
      font-size: 1rem;
    }

    .location-stats {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .location-bars {
      display: flex;
      gap: 20px;
      margin: 12px 0;
    }

    .bar-item {
      flex: 1;
    }

    .bar-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 4px;
      display: block;
    }

    .location-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-top: 8px;
    }

    .badge {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4px 10px;
      border-radius: 20px;
    }

    /* ===== NEW SKILLS TABLE STYLES ===== */
    .skills-table {
      display: flex;
      flex-direction: column;
      width: 100%;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .skills-table-header {
      display: grid;
      grid-template-columns: 1fr 80px;
      background: rgba(0,0,0,0.03);
      font-weight: 700;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--text-muted);
      padding: 12px 16px;
      border-bottom: 2px solid var(--border);
    }

    .skills-table-row {
      display: grid;
      grid-template-columns: 1fr 80px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
    }

    .skills-table-row:last-child {
      border-bottom: none;
    }

    .skills-table-row:nth-child(even) {
      background: rgba(0,0,0,0.02);
    }

    .skills-table-row span:last-child {
      text-align: right;
      font-weight: 600;
    }

    /* Empty & error states */
    .empty-state {
      color: var(--text-muted);
      font-style: italic;
      padding: 20px 0;
      text-align: center;
    }

    .error-state {
      background: #fee2e2;
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 40px;
      border-radius: var(--radius-lg);
      text-align: center;
      max-width: 500px;
      margin: 100px auto;
    }

    .retry-btn {
      background: var(--danger);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 40px;
      font-weight: 600;
      margin-top: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background: #dc2626;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    /* Loading skeletons */
    .loading {
      pointer-events: none;
    }

    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-sm);
    }

    .header-skeleton {
      height: 100px;
      margin-bottom: 32px;
      border-radius: var(--radius-lg);
    }

    .card-skeleton {
      height: 120px;
    }

    .panel-skeleton {
      height: 400px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .panels-grid {
        grid-template-columns: 1fr;
      }
      .panel:first-child {
        grid-column: 1;
      }
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 16px;
      }
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .header-right {
        width: 100%;
        justify-content: space-between;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .panel-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `}</style>
);