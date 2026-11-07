import { Link } from "react-router-dom";
import {
  UserRound,
  BookOpen,
  Heart,
  Award,
  ChartNoAxesCombined,
  LockKeyhole,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

function DashboardOverview({ fullName, user, openTab }) {
  return (
    <>
      <section className="student-welcome-section">
        <div>
          <span className="student-eyebrow">
            STUDENT WORKSPACE
          </span>

          <h1>Welcome back, {fullName}!</h1>

          <p>
            Manage your learning journey, profile and account settings.
          </p>
        </div>

        <div className="student-welcome-icon">
          <GraduationCap size={44} />
        </div>
      </section>

      <section className="student-stat-grid">
        <div className="student-stat-card">
          <div className="student-stat-icon purple">
            <BookOpen />
          </div>

          <div>
            <span>Account Role</span>
            <strong>{user.role || "Student"}</strong>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon green">
            <CheckCircle2 />
          </div>

          <div>
            <span>Email Verification</span>
            <strong>
              {user.isVerified ? "Verified" : "Not Verified"}
            </strong>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-icon orange">
            <CalendarDays />
          </div>

          <div>
            <span>Member Since</span>
            <strong>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Not available"}
            </strong>
          </div>
        </div>
      </section>

      <section className="student-quick-section">
        <h2>Quick Access</h2>

        <p>Continue managing your LearnHub account.</p>

        <div className="student-quick-grid">
          <button
            onClick={() => openTab("profile")}
            className="student-quick-card"
          >
            <UserRound />
            <h3>Profile Settings</h3>
            <p>Update your personal details and picture.</p>
            <span>Manage Profile →</span>
          </button>

          <button
            onClick={() => openTab("password")}
            className="student-quick-card"
          >
            <LockKeyhole />
            <h3>Change Password</h3>
            <p>Keep your account secure.</p>
            <span>Update Password →</span>
          </button>

          <Link
            to="/my-learning"
            className="student-quick-card"
          >
            <BookOpen />
            <h3>My Learning</h3>
            <p>View your learning courses.</p>
            <span>View Courses →</span>
          </Link>

          <Link
            to="/wishlist"
            className="student-quick-card"
          >
            <Heart />
            <h3>Wishlist</h3>
            <p>Find your saved courses.</p>
            <span>View Wishlist →</span>
          </Link>

          <button
            onClick={() => openTab("certificates")}
            className="student-quick-card"
          >
            <Award />
            <h3>Certificates</h3>
            <p>View your earned certificates.</p>
            <span>View Certificates →</span>
          </button>

          <button
            onClick={() => openTab("progress")}
            className="student-quick-card"
          >
            <ChartNoAxesCombined />
            <h3>Learning Progress</h3>
            <p>Review your learning analytics.</p>
            <span>View Progress →</span>
          </button>
        </div>
      </section>
    </>
  );
}

export default DashboardOverview;