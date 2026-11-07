import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function DashboardPassword({
  passwordForm,
  handlePasswordChange,
  handlePasswordUpdate,
  changingPassword,
}) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <section className="student-settings-section">
      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Change Password</h1>

          <p>
            Choose a strong password to protect your account.
          </p>
        </div>
      </div>

      <form
        className="student-settings-card student-password-card"
        onSubmit={handlePasswordUpdate}
      >
        <h2>Update Your Password</h2>

        <p>
          Enter your current password and choose a new one.
        </p>

        <div className="student-form-group">
          <label htmlFor="old-password">
            Current Password
          </label>

          <div className="student-password-input">
            <input
              id="old-password"
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowOldPassword((value) => !value)
              }
              aria-label={
                showOldPassword
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              {showOldPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <div className="student-form-group">
          <label htmlFor="new-password">
            New Password
          </label>

          <div className="student-password-input">
            <input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword((value) => !value)
              }
              aria-label={
                showNewPassword
                  ? "Hide new password"
                  : "Show new password"
              }
            >
              {showNewPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <div className="student-form-group">
          <label htmlFor="confirm-password">
            Confirm New Password
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            minLength={8}
            required
          />
        </div>

        <div className="student-password-tip">
          <ShieldCheck size={18} />
          Use at least 8 characters. Avoid reusing an old password.
        </div>

        <button
          className="student-primary-button"
          disabled={changingPassword}
        >
          <LockKeyhole size={17} />

          {changingPassword
            ? "Updating..."
            : "Update Password"}
        </button>
      </form>
    </section>
  );
}

export default DashboardPassword;