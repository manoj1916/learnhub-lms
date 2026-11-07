
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from "../../services/adminService";

import "../../styles/admin-users.css";

function getUsersFromResponse(response) {
  const data = response?.data ?? response;

  return Array.isArray(data?.users)
    ? data.users
    : [];
}

function getUserId(user) {
  return user?._id ?? user?.id ?? null;
}

function AdminUsers() {
  const { user: loggedInUser } = useAuth();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");

  const [busyUserId, setBusyUserId] = useState(null);

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers();

      console.log(
        "ADMIN USERS API RESPONSE:",
        response
      );

      const fetchedUsers = getUsersFromResponse(response);

      setUsers(fetchedUsers);

    } catch (err) {
      console.error(
        "Admin users error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load users."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================================
  // CURRENT ADMIN CHECK
  // ==========================================

  const isCurrentAdmin = (targetUser) => {
    const currentId = getUserId(loggedInUser);
    const targetId = getUserId(targetUser);

    if (currentId && targetId) {
      return String(currentId) === String(targetId);
    }

    return (
      loggedInUser?.email?.toLowerCase() ===
      targetUser?.email?.toLowerCase()
    );
  };

  // ==========================================
  // SEARCH AND ROLE FILTER
  // ==========================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user?.name || "";
      const email = user?.email || "";
      const role = user?.role?.toLowerCase() || "";

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all" ||
        role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ==========================================
  // UPDATE USER ROLE
  // ==========================================

  const handleRoleChange = async (targetUser) => {
    const id = getUserId(targetUser);

    if (!id) {
      toast.error("User ID is missing.");
      return;
    }

    if (isCurrentAdmin(targetUser)) {
      toast.error(
        "You cannot change your own administrator role."
      );
      return;
    }

    const currentRole = targetUser.role?.toLowerCase();

    const newRole =
      currentRole === "admin"
        ? "user"
        : "admin";

    const confirmed = window.confirm(
      `Change ${targetUser.name || targetUser.email}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setBusyUserId(id);

      const response = await updateAdminUserRole(
        id,
        newRole
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "Role update failed."
        );
      }

      toast.success("User role updated successfully.");

      await fetchUsers();

    } catch (err) {
      console.error(
        "Role update error:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Unable to update user role."
      );

    } finally {
      setBusyUserId(null);
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (targetUser) => {
    const id = getUserId(targetUser);

    if (!id) {
      toast.error("User ID is missing.");
      return;
    }

    if (isCurrentAdmin(targetUser)) {
      toast.error(
        "You cannot delete your own administrator account."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${targetUser.name || targetUser.email}?`
    );

    if (!confirmed) return;

    try {
      setBusyUserId(id);

      const response = await deleteAdminUser(id);

      if (response?.success === false) {
        throw new Error(
          response.message || "User deletion failed."
        );
      }

      toast.success("User deleted successfully.");

      await fetchUsers();

    } catch (err) {
      console.error(
        "Delete user error:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Unable to delete user."
      );

    } finally {
      setBusyUserId(null);
    }
  };

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalAdmins = users.filter(
    (user) => user.role?.toLowerCase() === "admin"
  ).length;

  const totalRegularUsers = users.filter(
    (user) => user.role?.toLowerCase() === "user"
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-users-page">

      {/* PAGE HEADER */}

      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">
            USER MANAGEMENT
          </p>

          <h1>Users</h1>

          <p>
            View and manage registered LearnHub users.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchUsers}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh Users"}
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="admin-user-summary">

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span>Total Users</span>
            <span className="admin-metric-icon">♙</span>
          </div>

          <strong>
            {users.length.toLocaleString()}
          </strong>

          <small>Registered accounts</small>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span>Administrators</span>
            <span className="admin-metric-icon">♛</span>
          </div>

          <strong>
            {totalAdmins.toLocaleString()}
          </strong>

          <small>Admin accounts</small>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span>Regular Users</span>
            <span className="admin-metric-icon">♧</span>
          </div>

          <strong>
            {totalRegularUsers.toLocaleString()}
          </strong>

          <small>Student accounts</small>
        </div>

      </div>

      {/* USERS TABLE */}

      <div className="admin-content-card">

        <div className="admin-users-toolbar">

          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search users"
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            aria-label="Filter users by role"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Regular Users</option>
          </select>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="admin-state-card">
            <div className="admin-spinner" />

            <p>
              Fetching users from your API...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="admin-error-card">
            <h3>Unable to load users</h3>

            <p>{error}</p>

            <button onClick={fetchUsers}>
              Try Again
            </button>
          </div>
        )}

        {/* SUCCESS */}

        {!loading && !error && (
          <>
            <div className="admin-table-info">
              Showing {filteredUsers.length} of {users.length} users
            </div>

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>USER</th>
                    <th>EMAIL ADDRESS</th>
                    <th>ROLE</th>
                    <th>USER ID</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((targetUser, index) => {
                    const id = getUserId(targetUser);

                    const isBusy = busyUserId === id;

                    const isSelf = isCurrentAdmin(targetUser);

                    const role =
                      targetUser.role?.toLowerCase();

                    return (
                      <tr key={id || targetUser.email || index}>

                        {/* USER */}

                        <td>
                          <div className="admin-table-user">

                            <div className="admin-avatar">
                              {targetUser.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </div>

                            <div>
                              <strong>
                                {targetUser.name || "Unnamed User"}
                              </strong>

                              {isSelf && (
                                <small className="admin-self-label">
                                  You
                                </small>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* EMAIL */}

                        <td>
                          {targetUser.email || "—"}
                        </td>

                        {/* ROLE */}

                        <td>
                          <span
                            className={`admin-role-badge ${
                              role === "admin"
                                ? "admin-role"
                                : "user-role"
                            }`}
                          >
                            {targetUser.role || "Unknown"}
                          </span>
                        </td>

                        {/* ID */}

                        <td className="admin-id-cell">
                          {id || "Not provided"}
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="admin-table-actions">

                            <button
                              className="admin-action-button"
                              onClick={() =>
                                handleRoleChange(targetUser)
                              }
                              disabled={isBusy || isSelf || !id}
                              title={
                                isSelf
                                  ? "You cannot change your own role"
                                  : "Change user role"
                              }
                            >
                              {isBusy
                                ? "Please wait..."
                                : role === "admin"
                                  ? "Make User"
                                  : "Make Admin"}
                            </button>

                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteUser(targetUser)
                              }
                              disabled={isBusy || isSelf || !id}
                              title={
                                isSelf
                                  ? "You cannot delete yourself"
                                  : "Delete user"
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="admin-empty-cell"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default AdminUsers;
