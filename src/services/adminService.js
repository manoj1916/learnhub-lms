import api from "../api/axios";

// ===============================
// ADMIN ANALYTICS
// ===============================

export const getAdminAnalytics = async () => {
  const response = await api.get("/api/v1/lms/admin/analytics");
  return response.data;
};

// ===============================
// ADMIN USERS
// ===============================

export const getAdminUsers = async () => {
  const response = await api.get("/api/v1/auth/get-all-user-dashboard");
  return response.data;
};

export const updateAdminUserRole = async (id, role) => {
  const response = await api.put(
    "/api/v1/auth/update-user-roles",
    { id, role }
  );
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/api/v1/auth/delete-user/${id}`);
  return response.data;
};

// ===============================
// ADMIN COURSES
// ===============================

export const getAdminCourses = async () => {
  const response = await api.get("/api/v1/lms/admin/courses");
  return response.data;
};

export const createAdminCourse = async (courseData) => {
  const response = await api.post(
    "/api/v1/course/create-course",
    courseData
  );
  return response.data;
};

export const updateAdminCourseStatus = async (courseId, status) => {
  const response = await api.put(
    `/api/v1/lms/admin/courses/${courseId}/status`,
    { status }
  );
  return response.data;
};

// ===============================
// ADMIN ORDERS
// ===============================

export const getAdminOrders = async () => {
  const response = await api.get("/api/v1/lms/admin/orders");
  return response.data;
};

export const refundAdminOrder = async (orderId) => {
  const response = await api.post(
    "/api/v1/lms/payments/refund",
    { orderId }
  );
  return response.data;
};

// ===============================
// ADMIN ENROLLMENTS
// ===============================

export const getAdminEnrollments = async () => {
  const response = await api.get("/api/v1/lms/admin/enrollments");
  return response.data;
};

export const exportAdminEnrollments = async () => {
  const response = await api.get(
    "/api/v1/lms/admin/enrollments/export",
    { responseType: "blob" }
  );
  return response.data;
};

// ===============================
// ADMIN INSTRUCTORS
// ===============================

export const getAdminInstructors = async () => {
  const response = await api.get("/api/v1/lms/admin/instructors");
  return response.data;
};

// ===============================
// ADMIN CATEGORIES
// ===============================

export const getAdminCategories = async () => {
  const response = await api.get("/api/v1/lms/categories/all");
  return response.data;
};

export const createAdminCategory = async (categoryData) => {
  const response = await api.post(
    "/api/v1/lms/categories",
    categoryData
  );
  return response.data;
};

export const updateAdminCategory = async (categoryId, categoryData) => {
  const response = await api.put(
    `/api/v1/lms/categories/${categoryId}`,
    categoryData
  );
  return response.data;
};

export const deleteAdminCategory = async (categoryId) => {
  const response = await api.delete(
    `/api/v1/lms/categories/${categoryId}`
  );
  return response.data;
};

// ===============================
// ADMIN COUPONS
// ===============================

export const getAdminCoupons = async () => {
  const response = await api.get("/api/v1/lms/coupons");
  return response.data;
};

export const createAdminCoupon = async (couponData) => {
  const response = await api.post(
    "/api/v1/lms/coupons",
    couponData
  );
  return response.data;
};

// ===============================
// ADMIN NOTIFICATIONS
// ===============================

export const getAdminNotifications = async () => {
  const response = await api.get(
    "/api/v1/notifications/get-all-notification"
  );

  return response.data;
};

export const markAdminNotificationAsRead = async (notificationId) => {
  const response = await api.put(
    `/api/v1/notifications/update-notification-status/${notificationId}`
  );

  return response.data;
};