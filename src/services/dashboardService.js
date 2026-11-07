
import api from "../api/axios";

// Get the logged-in user's profile.
export function getDashboardProfile() {
  return api.get("/api/v1/auth/me");
}

// Update the user's name and email.
export function updateDashboardProfile(profileData) {
  return api.put(
    "/api/v1/auth/update-user-info",
    profileData
  );
}

// Update the user's profile picture.
export function updateDashboardAvatar(avatar) {
  return api.put(
    "/api/v1/auth/update-user-profile-picture",
    { avatar }
  );
}

// Update the user's password.
export function updateDashboardPassword(passwordData) {
  return api.put(
    "/api/v1/auth/update-user-password",
    passwordData
  );
}

// Get the user's certificates.
export function getDashboardCertificates() {
  return api.get("/api/v1/lms/certificates");
}

// Get the user's learning progress.
export function getDashboardProgress() {
  return api.get("/api/v1/lms/my-learning");
}
