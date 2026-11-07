import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Award,
  ChartNoAxesCombined,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  GraduationCap,
  ClipboardList,
  LogOut,
  X,
} from "lucide-react";

function DashboardSidebar({
  user,
  fullName,
  avatarUrl,
  initials,
  activeTab,
  sidebarOpen,
  openTab,
  setSidebarOpen,
  handleLogout,
}) {
  const menuGroups = [
    {
      heading: "LEARNING",
      items: [
        {
          id: "my-learning",
          label: "My Learning",
          icon: BookOpen,
          path: "/my-learning",
        },
        {
          id: "wishlist",
          label: "Wishlist",
          icon: Heart,
          path: "/wishlist",
        },
        {
          id: "certificates",
          label: "My Certificates",
          icon: Award,
        },
        {
          id: "progress",
          label: "Learning Progress",
          icon: ChartNoAxesCombined,
        },
        {
          id: "assessments",
          label: "Assessments",
          icon: ClipboardList,
        },
      ],
    },
    {
      heading: "ACCOUNT",
      items: [
        {
          id: "profile",
          label: "Profile Settings",
          icon: UserRound,
        },
        {
          id: "password",
          label: "Change Password",
          icon: LockKeyhole,
        },
        {
          id: "security",
          label: "Account Security",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <>
      <aside
        className={`student-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <button
          type="button"
          className="student-close-sidebar"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X />
        </button>

        <div className="student-workspace">
          <span className="student-workspace-label">
            STUDENT WORKSPACE
          </span>

          <div className="student-sidebar-user">
            <div className="student-sidebar-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} />
              ) : (
                initials || "S"
              )}
            </div>

            <div className="student-sidebar-user-details">
              <strong>{fullName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <nav className="student-side-menu">
          <button
            type="button"
            className={`student-menu-link ${
              activeTab === "overview" ? "selected" : ""
            }`}
            onClick={() => openTab("overview")}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          {menuGroups.map((group) => (
            <div key={group.heading}>
              <span className="student-menu-heading">
                {group.heading}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;

                if (item.path) {
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="student-menu-link"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`student-menu-link ${
                      activeTab === item.id ? "selected" : ""
                    }`}
                    onClick={() => openTab(item.id)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}

          <Link
            to="/courses"
            className="student-menu-link"
            onClick={() => setSidebarOpen(false)}
          >
            <GraduationCap size={18} />
            Explore Courses
          </Link>
        </nav>

        <div className="student-sidebar-footer">
          <p>Learn. Build. Grow.</p>

          <button type="button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="student-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}

export default DashboardSidebar;