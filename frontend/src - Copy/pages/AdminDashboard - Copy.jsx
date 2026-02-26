import React, { useState, useEffect } from "react";
import { fetchAnalytics } from "../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const response = await fetchAnalytics();
      setData(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => loadData(true);

  const downloadCSV = () => {
    if (!data) return;

    const simpleMetrics = Object.entries(data)
      .filter(([key]) => !Array.isArray(data[key]))
      .map(([k, v]) => [k, v]);

    const rows = [
      ...simpleMetrics,
      ["usersPerLocation_count", data.usersPerLocation?.length || 0],
      ["prosPerLocation_count", data.prosPerLocation?.length || 0],
      ["skillsDistribution_count", data.skillsDistribution?.length || 0],
      ["requestsPerLocation_count", data.requestsPerLocation?.length || 0],
      ["bookingsPerCategory_count", data.bookingsPerCategory?.length || 0],
      ["clientsPerLocation_count", data.clientsPerLocation?.length || 0],
      ["prosAverageRatingPerLocation_count", data.prosAverageRatingPerLocation?.length || 0],
      ["bookingsAverageRatingPerLocation_count", data.bookingsAverageRatingPerLocation?.length || 0],
    ];

    const csv = [["Metric", "Value"], ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error)
    return (
      <div className="error-container">
        <div className="error-state">⚠️ {error}</div>
        <button onClick={handleRefresh} className="retry-btn">Retry</button>
      </div>
    );

  // Derived metrics
  const totalUsers = data.totalUsers || 0;
  const totalPros = data.totalPros || 0;
  const verifiedPros = data.verifiedPros || 0;
  const suspendedPros = data.suspendedPros || 0;
  const totalBookings = data.totalBookings || 0;

  const verifiedProPercent = totalPros ? ((verifiedPros / totalPros) * 100).toFixed(1) : 0;
  const suspendedProPercent = totalPros ? ((suspendedPros / totalPros) * 100).toFixed(1) : 0;
  const avgBookingsPerUser = totalUsers ? (totalBookings / totalUsers).toFixed(2) : 0;
  const avgBookingsPerPro = totalPros ? (totalBookings / totalPros).toFixed(2) : 0;
  const totalRequests = (data.requestsPerLocation || []).reduce((s, l) => s + l.count, 0);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const maxUserMonth = Math.max(...(data.usersByMonth || []).map(m => m.count), 1);
  const maxBookingMonth = Math.max(...(data.monthlyBookings || []).map(m => m.count), 1);

  return (
    <div className="dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard {
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
        }

        .header-sub {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          color: #374151;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .kpi-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .kpi-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          font-weight: 600;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1.2;
        }

        .kpi-trend {
          font-size: 0.9rem;
          color: #10b981;
          margin-top: 0.25rem;
        }

        /* Section cards */
        .section-card {
          background: white;
          border-radius: 28px;
          padding: 1.8rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #f3f4f6;
          transition: box-shadow 0.3s ease;
        }

        .section-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title span {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 8px;
          height: 32px;
          border-radius: 20px;
          display: inline-block;
        }

        /* Charts */
        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          height: 180px;
        }

        .bar-chart > div {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar {
          width: 100%;
          background: linear-gradient(180deg, #667eea, #764ba2);
          border-radius: 12px 12px 4px 4px;
          transition: height 0.3s ease;
          min-height: 8px;
          box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
        }

        .bar-label {
          font-weight: 600;
          color: #4b5563;
        }

        .bar-value {
          font-size: 0.9rem;
          color: #6b7280;
        }

        /* Tables */
        .table-wrapper {
          overflow-x: auto;
          border-radius: 18px;
          background: #f9fafb;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        th {
          background: #f3f4f6;
          color: #374151;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          padding: 1rem 1.2rem;
          text-align: left;
        }

        td {
          padding: 1rem 1.2rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #f3f4f6;
          transition: background 0.2s;
        }

        .rating-stars {
          display: inline-flex;
          gap: 0.2rem;
          color: #fbbf24;
          font-size: 1.1rem;
        }

        .progress-bar-bg {
          background: #e5e7eb;
          border-radius: 9999px;
          height: 8px;
          width: 100%;
          margin-top: 0.5rem;
        }

        .progress-bar-fill {
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 9999px;
          height: 8px;
          transition: width 0.3s ease;
        }

        .error-container {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 28px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .error-state {
          color: #ef4444;
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }
      `}</style>

      <header className="header">
        <div>
          <h1>Analytics Dashboard</h1>
          <div className="header-sub">
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={downloadCSV}>
            📥 Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard icon="👥" label="Total Users" value={totalUsers} trend="+12% from last month" />
        <KPICard icon="👨‍🔧" label="Professionals" value={totalPros} trend={`${verifiedPros} verified`} />
        <KPICard icon="✅" label="Verified Pros %" value={`${verifiedProPercent}%`} />
        <KPICard icon="⚠️" label="Suspended Pros %" value={`${suspendedProPercent}%`} />
        <KPICard icon="📅" label="Total Bookings" value={totalBookings} />
        <KPICard icon="📍" label="Total Requests" value={totalRequests} />
        <KPICard icon="📊" label="Avg Bookings/User" value={avgBookingsPerUser} />
        <KPICard icon="📈" label="Avg Bookings/Pro" value={avgBookingsPerPro} />
      </div>

      {/* Charts Row */}
      <div className="chart-row">
        <div className="section-card">
          <div className="section-title"><span></span> User Growth (by month)</div>
          <div className="bar-chart">
            {data.usersByMonth?.map(m => (
              <div key={m._id}>
                <div className="bar" style={{ height: `${(m.count / maxUserMonth) * 120}px` }} />
                <div className="bar-label">{monthNames[m._id - 1]}</div>
                <div className="bar-value">{m.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="section-card">
          <div className="section-title"><span></span> Monthly Bookings</div>
          <div className="bar-chart">
            {data.monthlyBookings?.map(m => (
              <div key={m._id}>
                <div className="bar" style={{ height: `${(m.count / maxBookingMonth) * 120}px` }} />
                <div className="bar-label">{monthNames[m._id - 1]}</div>
                <div className="bar-value">{m.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
        <div className="section-card">
          <div className="section-title"><span></span> Users per Location</div>
          <DataTable data={data.usersPerLocation} />
        </div>
        <div className="section-card">
          <div className="section-title"><span></span> Pros per Location</div>
          <DataTable data={data.prosPerLocation} />
        </div>
      </div>

      {/* Clients per Location */}
      <div className="section-card">
        <div className="section-title"><span></span> Clients per Location</div>
        <DataTable data={data.clientsPerLocation} />
      </div>

      {/* Skills Distribution */}
      <div className="section-card">
        <div className="section-title"><span></span> Skills Distribution</div>
        <SkillsDistribution data={data.skillsDistribution} />
      </div>

      {/* Requests & Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div className="section-card">
          <div className="section-title"><span></span> Requests per Location</div>
          <DataTable data={data.requestsPerLocation} />
        </div>
        <div className="section-card">
          <div className="section-title"><span></span> Bookings per Category</div>
          <DataTable data={data.bookingsPerCategory} />
        </div>
      </div>

      {/* Ratings per Location */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
        <div className="section-card">
          <div className="section-title"><span></span> Pro Average Ratings per Location</div>
          <RatingTable data={data.prosAverageRatingPerLocation} />
        </div>
        <div className="section-card">
          <div className="section-title"><span></span> Booking Average Ratings per Location</div>
          <RatingTable data={data.bookingsAverageRatingPerLocation} />
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function KPICard({ icon, label, value, trend }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {trend && <div className="kpi-trend">{trend}</div>}
      </div>
    </div>
  );
}

function DataTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No data available</p>;
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item._id || "Unknown"}</td>
              <td><strong>{item.count}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RatingTable({ data }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No data available</p>;
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Average Rating</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{item._id || "Unknown"}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="rating-stars">
                    {'★'.repeat(Math.round(item.averageRating || 0))}
                    {'☆'.repeat(5 - Math.round(item.averageRating || 0))}
                  </span>
                  {item.averageRating?.toFixed(2) ?? "N/A"}
                </div>
              </td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkillsDistribution({ data }) {
  if (!data || data.length === 0) {
    return <p className="no-data">No skills data</p>;
  }
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      {data.map(skill => {
        const percentage = ((skill.count / maxCount) * 100).toFixed(0);
        return (
          <div key={skill._id} style={{ marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 500 }}>{skill._id}</span>
              <span style={{ color: "#6b7280" }}>{skill.count} ({percentage}%)</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="dashboard" style={{ textAlign: "center", padding: "4rem" }}>
      <div style={{ animation: "pulse 1.5s infinite" }}>
        <h2 style={{ color: "#6b7280" }}>Loading dashboard...</h2>
        <div style={{ marginTop: "2rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: "100px", background: "#e5e7eb", borderRadius: "24px" }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}