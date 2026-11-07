
import { useCallback, useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/adminService";

function getMetricValue(value) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length.toLocaleString();
  }

  if (value && typeof value === "object") {
    const total = value.total ?? value.count ?? value.totalCount;

    if (typeof total === "number") {
      return total.toLocaleString();
    }
  }

  return "—";
}

const metricCards = [
  { key: "users", title: "Total Users", icon: "♙" },
  { key: "courses", title: "Total Courses", icon: "▤" },
  { key: "orders", title: "Total Orders", icon: "🛒" },
  { key: "enrollments", title: "Total Enrollments", icon: "✓" },
  { key: "certificates", title: "Certificates", icon: "♧" },
];

function AdminOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAnalytics();

      console.log("ADMIN ANALYTICS API RESPONSE:", response);

      const data = response?.data ?? response;

      if (data?.success === false) {
        throw new Error(
          data.message || "Unable to load dashboard analytics."
        );
      }

      setAnalytics(data);
    } catch (err) {
      console.error(
        "Admin analytics error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="admin-overview">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">DASHBOARD</p>
          <h1>Overview</h1>
          <p>Monitor your LearnHub marketplace from one place.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="admin-state-card">
          <div className="admin-spinner" />
          <p>Loading analytics from your API...</p>
        </div>
      )}

      {!loading && error && (
        <div className="admin-error-card">
          <h3>Unable to load analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalytics}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && analytics && (
        <>
          <div className="admin-metrics-grid">
            {metricCards.map((metric) => (
              <article className="admin-metric-card" key={metric.key}>
                <div className="admin-metric-top">
                  <span>{metric.title}</span>
                  <span className="admin-metric-icon">
                    {metric.icon}
                  </span>
                </div>

                <strong>
                  {getMetricValue(analytics[metric.key])}
                </strong>

                <small>Reported by LMS API</small>
              </article>
            ))}
          </div>

          <div className="admin-content-card">
            <div className="admin-card-heading">
              <div>
                <h2>Platform Summary</h2>
                <p>
                  A quick overview of your LearnHub marketplace.
                </p>
              </div>
            </div>

            <div className="admin-summary-grid">
              <div className="admin-summary-item">
                <span>Total registered users:</span>
                <strong>{getMetricValue(analytics.users)}</strong>
              </div>

              <div className="admin-summary-item">
                <span>Available courses:</span>
                <strong>{getMetricValue(analytics.courses)}</strong>
              </div>

              <div className="admin-summary-item">
                <span>Orders placed:</span>
                <strong>{getMetricValue(analytics.orders)}</strong>
              </div>

              <div className="admin-summary-item">
                <span>Course enrollments:</span>
                <strong>{getMetricValue(analytics.enrollments)}</strong>
              </div>
            </div>

           
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOverview;
