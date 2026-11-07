
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  GraduationCap,
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  UserRound,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import "./layout.css";

function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("learnhub-theme") === "dark"
  );

  const fullName = user?.name || user?.username || "Student";
  const avatarUrl = user?.avatar?.url;

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode
      ? "dark"
      : "light";

    localStorage.setItem(
      "learnhub-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  function closeMenus() {
    setMenuOpen(false);
    setProfileOpen(false);
  }

  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    navigate(
      query
        ? `/courses?search=${encodeURIComponent(query)}`
        : "/courses"
    );

    closeMenus();
  }

  async function handleLogout() {
    await logout();

    closeMenus();

    toast.success("Logged out successfully");

    navigate("/", { replace: true });
  }

  const loggedIn = Boolean(isAuthenticated && user);

  return (
    <header className="main-navbar">
      <div className="navbar-inner">

        {/* BRAND */}

        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenus}
        >
          <span className="navbar-logo">
            <GraduationCap size={25} />
          </span>

          <span>
            Learn<span>Hub</span>
          </span>
        </Link>

        {/* MOBILE MENU */}

        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {/* NAVIGATION */}

        <nav
          className={`navbar-links ${menuOpen ? "active" : ""}`}
        >
          <NavLink
            to="/"
            end
            onClick={closeMenus}
          >
            Home
          </NavLink>

          <NavLink
            to="/courses"
            onClick={closeMenus}
          >
            Courses
          </NavLink>

          {loggedIn && (
            <NavLink
              to="/dashboard"
              onClick={closeMenus}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* ACTIONS */}

        <div className="navbar-actions">

          {/* SEARCH */}

          <form
            className="navbar-search"
            onSubmit={handleSearch}
          >
            <Search size={18} />

            <input
              type="search"
              placeholder="Search courses"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              aria-label="Search courses"
            />
          </form>

          {/* THEME */}

          <button
            type="button"
            className="navbar-theme-button"
            onClick={() =>
              setDarkMode((value) => !value)
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {loggedIn ? (
            <>
              {/* WISHLIST */}

              <Link
                to="/wishlist"
                className="navbar-wishlist"
                onClick={closeMenus}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart size={23} />
              </Link>

              {/* PROFILE */}

              <div className="navbar-profile-wrapper">
                <button
                  type="button"
                  className="navbar-profile-button"
                  onClick={() =>
                    setProfileOpen((value) => !value)
                  }
                  aria-expanded={profileOpen}
                >
                  <span className="navbar-avatar">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                      />
                    ) : (
                      initials || "S"
                    )}
                  </span>

                  <span className="navbar-profile-name">
                    {fullName}
                  </span>

                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="navbar-profile-dropdown">

                    <div className="navbar-dropdown-user">
                      <strong>{fullName}</strong>
                      <span>{user?.email}</span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={closeMenus}
                    >
                      <UserRound size={17} />
                      Profile Settings
                    </Link>

                    <Link
                      to="/my-learning"
                      onClick={closeMenus}
                    >
                      <BookOpen size={17} />
                      My Learning
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={closeMenus}
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      Logout
                    </button>

                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;
