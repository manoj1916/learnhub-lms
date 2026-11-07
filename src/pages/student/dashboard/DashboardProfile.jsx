import { useRef } from "react";
import { Camera, Save } from "lucide-react";

function DashboardProfile({
  user,
  fullName,
  avatarUrl,
  initials,
  profileForm,
  handleProfileChange,
  handleProfileUpdate,
  handleImageChange,
  uploadingImage,
  savingProfile,
}) {
  const fileInputRef = useRef(null);

  return (
    <section className="student-settings-section">
      <div className="student-page-heading">
        <div>
          <span className="student-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Profile Settings</h1>

          <p>
            Manage your personal information and profile picture.
          </p>
        </div>
      </div>

      <div className="student-settings-card">
        <h2>Profile Picture</h2>

        <p>Choose a picture that represents you.</p>

        <div className="student-avatar-editor">
          <div className="student-large-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} />
            ) : (
              initials || "S"
            )}
          </div>

          <div>
            <h3>{fullName}</h3>
            <p>{user.email}</p>

            <button
              type="button"
              className="student-upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              <Camera size={17} />

              {uploadingImage ? "Uploading..." : "Upload Picture"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <small>Maximum image size: 5 MB.</small>
          </div>
        </div>
      </div>

      <form
        className="student-settings-card"
        onSubmit={handleProfileUpdate}
      >
        <h2>Personal Information</h2>

        <p>Update your name and email address.</p>

        <div className="student-form-grid">
          <div className="student-form-group">
            <label htmlFor="profile-name">Full Name</label>

            <input
              id="profile-name"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="student-form-group">
            <label htmlFor="profile-email">Email Address</label>

            <input
              id="profile-email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              required
            />
          </div>
        </div>

        <button
          className="student-primary-button"
          disabled={savingProfile}
        >
          <Save size={17} />
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default DashboardProfile;