import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getAdminNotifications,
  markAdminNotificationAsRead,
} from "../../services/adminService";

import "../../styles/admin-notifications.css";

// Extract notifications from different possible response wrappers.
function getNotificationsFromResponse(response) {
  const candidates = [
    response?.notifications,
    response?.data?.notifications,
    response?.data?.data?.notifications,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getNotificationId(notification) {
  return notification?._id || notification?.id;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isNotificationRead(notification) {
  return String(notification?.status || "").toLowerCase() === "read";
}

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ===============================
  // FETCH NOTIFICATIONS
  // ===============================

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminNotifications();

      console.log("ADMIN NOTIFICATIONS API RESPONSE:", response);

      const notificationList =
        getNotificationsFromResponse(response);

      setNotifications(notificationList);
    } catch (err) {
      console.error("ADMIN NOTIFICATIONS ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ===============================
  // MARK NOTIFICATION AS READ
  // ===============================

  const handleMarkAsRead = async (notification) => {
    const notificationId = getNotificationId(notification);

    if (!notificationId) {
      setMessage("Notification ID was not found.");
      return;
    }

    if (isNotificationRead(notification)) {
      return;
    }

    try {
      setUpdatingId(notificationId);
      setMessage("");

      await markAdminNotificationAsRead(notificationId);

      setMessage("Notification marked as read.");

      // Update the local UI immediately.
      setNotifications((previousNotifications) =>
        previousNotifications.map((item) => {
          if (getNotificationId(item) === notificationId) {
            return {
              ...item,
              status: "read",
            };
          }

          return item;
        })
      );
    } catch (err) {
      console.error("MARK NOTIFICATION AS READ ERROR:", err);
      setMessage(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // ===============================
  // FILTER NOTIFICATIONS
  // ===============================

  const filteredNotifications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const title = String(notification?.title || "").toLowerCase();
      const description = String(
        notification?.message || ""
      ).toLowerCase();

      const userId = String(
        notification?.userId || ""
      ).toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        userId.includes(search);

      const read = isNotificationRead(notification);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "read" && read) ||
        (statusFilter === "unread" && !read);

      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchTerm, statusFilter]);

  // ===============================
  // SUMMARY
  // ===============================

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification)
  ).length;

  const readCount = notifications.length - unreadCount;

  // ===============================
  // UI
  // ===============================

  return (
    <div className="admin-notifications-page">
      {/* HEADER */}

      <div className="admin-notifications-header">
        <div>
          <span className="notifications-eyebrow">
            SYSTEM COMMUNICATION
          </span>

          <h1>Notifications</h1>

          <p>
            View marketplace notifications and manage their read status.
          </p>
        </div>

        <button
          type="button"
          className="notifications-refresh-btn"
          onClick={fetchNotifications}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="notifications-stats">
        <div className="notification-stat-card">
          <div className="notification-stat-icon total-notification-icon">
            <span>▣</span>
          </div>

          <div>
            <p>Total Notifications</p>
            <h2>{notifications.length}</h2>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon unread-notification-icon">
            <span>●</span>
          </div>

          <div>
            <p>Unread Notifications</p>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon read-notification-icon">
            <span>✓</span>
          </div>

          <div>
            <p>Read Notifications</p>
            <h2>{readCount}</h2>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="notification-message notification-error">
          <span>{error}</span>

          <button type="button" onClick={fetchNotifications}>
            Retry
          </button>
        </div>
      )}

      {message && (
        <div className="notification-message">
          {message}
        </div>
      )}

      {/* NOTIFICATION LIST */}

      <section className="notifications-list-card">
        <div className="notifications-section-heading">
          <div>
            <h2>All Notifications</h2>

            <p>
              Review recent activity from your marketplace.
            </p>
          </div>

          <span className="notification-count-label">
            {filteredNotifications.length} notifications
          </span>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="notifications-toolbar">
          <div className="notification-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search title, message or user ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="notification-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter notifications by status"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="notifications-empty-state">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty-state">
            <div className="notifications-empty-icon">▣</div>

            <h3>No notifications found</h3>

            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Your notifications will appear here when available."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification, index) => {
              const notificationId =
                getNotificationId(notification);

              const isRead = isNotificationRead(notification);

              const isUpdating =
                updatingId === notificationId;

              return (
                <article
                  className={`notification-item ${
                    isRead ? "notification-read" : "notification-unread"
                  }`}
                  key={notificationId || index}
                >
                  <div className="notification-item-icon">
                    {isRead ? "✓" : "●"}
                  </div>

                  <div className="notification-item-content">
                    <div className="notification-item-top">
                      <h3>
                        {notification?.title || "Untitled notification"}
                      </h3>

                      <span
                        className={`notification-status ${
                          isRead
                            ? "notification-status-read"
                            : "notification-status-unread"
                        }`}
                      >
                        {isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="notification-description">
                      {notification?.message ||
                        "No message was provided."}
                    </p>

                    <div className="notification-metadata">
                      <span>
                        <strong>User ID:</strong>{" "}
                        {notification?.userId || "Not provided"}
                      </span>

                      <span>
                        {formatDate(notification?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="notification-item-action">
                    {isRead ? (
                      <span className="notification-read-label">
                        <span>✓</span> Read
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="notification-mark-read-btn"
                        onClick={() => handleMarkAsRead(notification)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Mark as Read"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="notifications-list-footer">
          Showing {filteredNotifications.length} of{" "}
          {notifications.length} notifications
        </div>
      </section>
    </div>
  );
}

export default AdminNotifications;