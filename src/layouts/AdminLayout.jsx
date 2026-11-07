
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const navigation = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Overview", path: "/admin", icon: "▦", end: true },
      { label: "Users", path: "/admin/users", icon: "♙" },
      { label: "Courses", path: "/admin/courses", icon: "▤" },
      { label: "Orders", path: "/admin/orders", icon: "🛒" },
      { label: "Enrollments", path: "/admin/enrollments", icon: "✓" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Instructors", path: "/admin/instructors", icon: "♧" },
      { label: "Categories", path: "/admin/categories", icon: "▧" },
      { label: "Coupons", path: "/admin/coupons", icon: "%" },
      { label: "Notifications", path: "/admin/notifications", icon: "♢" },
    ],
  },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">L</span>
          <span>LearnHub</span>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <strong>{user?.name || "Administrator"}</strong>
            <span>{user?.email || ""}</span>
            <small>Administrator</small>
          </div>
        </div>

        <nav className="admin-navigation">
          {navigation.map((group) => (
            <div className="admin-nav-group" key={group.title}>
              <p className="admin-nav-heading">{group.title}</p>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span> Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">
              LEARNHUB / ADMIN
            </span>
            <h2>Administration</h2>
          </div>

          <div className="admin-topbar-user">
            <div className="admin-avatar small">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <strong>{user?.name || "Admin"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="admin-page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;
