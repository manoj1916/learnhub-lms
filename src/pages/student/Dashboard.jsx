import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import toast from "react-hot-toast";

import { logoutUser } from "../../services/authService";

import {
  getDashboardProfile,
  updateDashboardProfile,
  updateDashboardAvatar,
  updateDashboardPassword,
  getDashboardCertificates,
  getDashboardProgress,
} from "../../services/dashboardService";

import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardOverview from "./dashboard/DashboardOverview";
import DashboardProfile from "./dashboard/DashboardProfile";
import DashboardPassword from "./dashboard/DashboardPassword";
import DashboardSecurity from "./dashboard/DashboardSecurity";
import DashboardCertificates from "./dashboard/DashboardCertificates";
import DashboardProgress from "./dashboard/DashboardProgress";

import "./student.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState([]);
  const [featureLoading, setFeatureLoading] = useState(false);

  const fullName = user?.name || user?.username || "Student";
  const avatarUrl = user?.avatar?.url;

  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  // Update shared user information.
  function publishUser(updatedUser) {
    setUser(updatedUser);

    window.dispatchEvent(
      new CustomEvent("learnhub:user-updated", {
        detail: updatedUser,
      })
    );
  }

  // Fetch student profile.
  async function fetchProfile() {
    try {
      setLoading(true);

      const response = await getDashboardProfile();

      const data = response.data?.data ?? response.data;
      const currentUser = data?.user ?? data;

      if (!currentUser) {
        throw new Error("User information was not returned.");
      }

      publishUser(currentUser);

      setProfileForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    } catch (error) {
      console.error("Profile error:", error.response?.data || error);

      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Unable to load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch certificates.
  async function loadCertificates() {
    try {
      setFeatureLoading(true);

      const response = await getDashboardCertificates();

      const data = response.data?.data ?? response.data;
      const list = data?.certificates;

      setCertificates(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Certificates:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Unable to load certificates."
      );
    } finally {
      setFeatureLoading(false);
    }
  }

  // Fetch learning progress.
  async function loadProgress() {
    try {
      setFeatureLoading(true);

      const response = await getDashboardProgress();

      const data = response.data?.data ?? response.data;

      let courseList = [];

      if (Array.isArray(data)) {
        courseList = data;
      } else if (Array.isArray(data?.courses)) {
        courseList = data.courses;
      } else if (Array.isArray(data?.enrollments)) {
        courseList = data.enrollments;
      } else if (Array.isArray(data?.progress)) {
        courseList = data.progress;
      } else if (data && typeof data === "object") {
        courseList = [
          data.completed,
          data.inProgress,
          data.in_progress,
          data.notStarted,
          data.not_started,
        ].filter(Array.isArray).flat();
      }

      setProgress(courseList);
    } catch (error) {
      console.error("Learning progress:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Unable to load learning progress."
      );

      setProgress([]);
    } finally {
      setFeatureLoading(false);
    }
  }

  // Dashboard navigation.
  function openTab(tab) {
    setActiveTab(tab);
    setSidebarOpen(false);

    if (tab === "certificates") {
      loadCertificates();
    }

    if (tab === "progress") {
      loadProgress();
    }
  }

  // Profile form changes.
  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Update profile.
  async function handleProfileUpdate(event) {
    event.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await updateDashboardProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });

      const updatedUser = response.data?.user;

      publishUser({
        ...user,
        ...(updatedUser || {}),
        name: updatedUser?.name || profileForm.name.trim(),
        email: updatedUser?.email || profileForm.email.trim(),
      });

      toast.success(
        response.data?.message || "Profile updated successfully."
      );
    } catch (error) {
      console.error("Update profile:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // Upload profile picture.
  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const avatar = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read image."));

        reader.readAsDataURL(file);
      });

      const response = await updateDashboardAvatar(avatar);

      if (response.data?.user) {
        publishUser({
          ...user,
          ...response.data.user,
        });
      } else {
        await fetchProfile();
      }

      toast.success(
        response.data?.message || "Profile picture updated."
      );
    } catch (error) {
      console.error("Avatar update:", error.response?.data || error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update profile picture."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  // Password form changes.
  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Update password.
  async function handlePasswordUpdate(event) {
    event.preventDefault();

    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await updateDashboardPassword({
        oldPassword,
        newPassword,
      });

      toast.success(
        response.data?.message || "Password updated successfully."
      );

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Unable to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // Logout.
  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout:", error.response?.data || error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      toast.success("Logged out successfully.");
      navigate("/login");
    }
  }

  if (loading) {
    return (
      <div className="student-dashboard-loading">
        <div className="student-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="student-dashboard-loading">
        <p>Unable to load your profile.</p>
        <button onClick={fetchProfile}>Try again</button>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <DashboardSidebar
        user={user}
        fullName={fullName}
        avatarUrl={avatarUrl}
        initials={initials}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        openTab={openTab}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      <main className="student-dashboard-main">
        <header className="student-dashboard-header">
          <button
            type="button"
            className="student-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu />
          </button>

          <div className="student-header-breadcrumb">
            <span>LearnHub</span>
            <span>/</span>
            <strong>Student Workspace</strong>
          </div>

          <Link to="/courses" className="student-header-explore">
            Explore Courses
          </Link>
        </header>

        <div className="student-dashboard-content">
          {activeTab === "overview" && (
            <DashboardOverview
              fullName={fullName}
              user={user}
              openTab={openTab}
            />
          )}

          {activeTab === "profile" && (
            <DashboardProfile
              user={user}
              fullName={fullName}
              avatarUrl={avatarUrl}
              initials={initials}
              profileForm={profileForm}
              handleProfileChange={handleProfileChange}
              handleProfileUpdate={handleProfileUpdate}
              handleImageChange={handleImageChange}
              uploadingImage={uploadingImage}
              savingProfile={savingProfile}
            />
          )}

          {activeTab === "password" && (
            <DashboardPassword
              passwordForm={passwordForm}
              handlePasswordChange={handlePasswordChange}
              handlePasswordUpdate={handlePasswordUpdate}
              changingPassword={changingPassword}
            />
          )}

          {activeTab === "security" && (
            <DashboardSecurity
              user={user}
              openTab={openTab}
            />
          )}

          {activeTab === "certificates" && (
            <DashboardCertificates
              certificates={certificates}
              featureLoading={featureLoading}
              loadCertificates={loadCertificates}
            />
          )}

          {activeTab === "progress" && (
            <DashboardProgress
              progress={progress}
              featureLoading={featureLoading}
              loadProgress={loadProgress}
            />
          )}

          {activeTab === "assessments" && (
            <section className="student-settings-section" />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;