import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getAdminInstructors } from "../../services/adminService";

import "../../styles/admin-instructors.css";

function extractInstructors(response) {
  const candidates = [
    response?.data?.data?.instructors,
    response?.data?.instructors,
    response?.data?.data?.users,
    response?.data?.users,
    response?.data?.data,
    response?.data,
    response?.instructors,
    response?.users,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getInstructorId(instructor) {
  return instructor?._id || instructor?.id || "";
}

function getInstructorName(instructor) {
  return (
    instructor?.name ||
    instructor?.fullName ||
    instructor?.username ||
    instructor?.userName ||
    "Name unavailable"
  );
}

function getInstructorEmail(instructor) {
  return instructor?.email || "—";
}

function getInstructorRole(instructor) {
  return (
    instructor?.role ||
    instructor?.userRole ||
    "instructor"
  ).toString().toUpperCase();
}

function getInstructorDate(instructor) {
  const value =
    instructor?.createdAt ||
    instructor?.joinedAt ||
    instructor?.dateJoined;

  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInstructorStatus(instructor) {
  if (instructor?.isBlocked === true) {
    return "BLOCKED";
  }

  if (instructor?.isActive === false) {
    return "INACTIVE";
  }

  if (instructor?.isActive === true) {
    return "ACTIVE";
  }

  if (instructor?.status) {
    return String(instructor.status).toUpperCase();
  }

  return "NOT PROVIDED";
}

function getInitials(name) {
  if (!name || name === "Name unavailable") {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminInstructors();

      console.log("ADMIN INSTRUCTORS API RESPONSE:", response);

      setInstructors(extractInstructors(response));
    } catch (error) {
      console.error(
        "FETCH INSTRUCTORS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load instructors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const availableRoles = useMemo(() => {
    return [
      ...new Set(instructors.map((item) => getInstructorRole(item))),
    ].sort();
  }, [instructors]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((instructor) => {
      const name = getInstructorName(instructor).toLowerCase();
      const email = getInstructorEmail(instructor).toLowerCase();
      const id = getInstructorId(instructor).toString().toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        id.includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        getInstructorRole(instructor) === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [instructors, search, roleFilter]);

  const adminCount = useMemo(() => {
    return instructors.filter(
      (instructor) => getInstructorRole(instructor) === "ADMIN"
    ).length;
  }, [instructors]);

  const instructorCount = instructors.length - adminCount;

  const activeCount = useMemo(() => {
    return instructors.filter(
      (instructor) => getInstructorStatus(instructor) === "ACTIVE"
    ).length;
  }, [instructors]);

  return (
    <div className="admin-instructors-page">
      <div className="admin-instructors-heading">
        <div>
          <h1>Instructors Management</h1>
          <p>View instructors and administrators registered in your LMS.</p>
        </div>

        <button
          className="instructors-refresh-btn"
          onClick={fetchInstructors}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="instructors-summary-grid">
        <div className="instructors-summary-card">
          <span>Total Records</span>
          <h2>{instructors.length}</h2>
        </div>

        <div className="instructors-summary-card">
          <span>Instructors</span>
          <h2>{instructorCount}</h2>
        </div>

        <div className="instructors-summary-card">
          <span>Administrators</span>
          <h2>{adminCount}</h2>
        </div>

        <div className="instructors-summary-card">
          <span>Active Accounts</span>
          <h2>{activeCount}</h2>
        </div>
      </div>

      {/* SEARCH AND FILTER */}

      <div className="instructors-toolbar">
        <input
          type="search"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="ALL">All Roles</option>

          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* INSTRUCTORS TABLE */}

      <div className="instructors-table-container">
        {loading ? (
          <div className="instructors-message">
            Loading instructors...
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="instructors-message">
            No instructor records found.
          </div>
        ) : (
          <table className="admin-instructors-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th>User ID</th>
              </tr>
            </thead>

            <tbody>
              {filteredInstructors.map((instructor, index) => {
                const name = getInstructorName(instructor);
                const role = getInstructorRole(instructor);
                const status = getInstructorStatus(instructor);
                const instructorId = getInstructorId(instructor);

                return (
                  <tr key={instructorId || index}>
                    <td>
                      <div className="instructor-profile">
                        <div className="instructor-avatar">
                          {getInitials(name)}
                        </div>

                        <strong>{name}</strong>
                      </div>
                    </td>

                    <td>{getInstructorEmail(instructor)}</td>

                    <td>
                      <span
                        className={`instructor-role-badge instructor-role-${role.toLowerCase()}`}
                      >
                        {role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`instructor-account-status instructor-account-${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>{getInstructorDate(instructor)}</td>

                    <td>
                      <span className="instructor-id-text">
                        {instructorId || "Not available"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="instructors-results-count">
        Showing {filteredInstructors.length} of {instructors.length} records
      </p>
    </div>
  );
}

export default AdminInstructors;