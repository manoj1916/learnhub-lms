import {
  Mail,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function DashboardSecurity({ user, openTab }) {
  return (
    <section className="student-settings-section">
      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Account Security</h1>

          <p>
            Review your account verification and security details.
          </p>
        </div>
      </div>

      <div className="student-settings-card">
        <div className="student-security-row">
          <Mail />

          <div>
            <h3>Email Verification</h3>
            <p>{user.email}</p>
          </div>

          <span
            className={`student-status ${
              user.isVerified ? "verified" : "unverified"
            }`}
          >
            {user.isVerified ? "Verified" : "Not Verified"}
          </span>
        </div>

        <div className="student-security-row">
          <LockKeyhole />

          <div>
            <h3>Password</h3>
            <p>Keep your account secure.</p>
          </div>

          <button
            type="button"
            className="student-text-button"
            onClick={() => openTab("password")}
          >
            Change Password
          </button>
        </div>

        <div className="student-security-row">
          <ShieldCheck />

          <div>
            <h3>Two-Factor Authentication</h3>
            <p>Additional account verification.</p>
          </div>

          <span className="student-status coming-soon">
            Setup requires verification flow
          </span>
        </div>
      </div>
    </section>
  );
}

export default DashboardSecurity;