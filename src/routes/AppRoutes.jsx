
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Route protection
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import GuestRoute from "./GuestRoute";

// Public pages
import Home from "../pages/Home";
import Courses from "../pages/courses/Courses";
import CourseDetails from "../pages/courses/CourseDetails";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ActivateAccount from "../pages/auth/ActivateAccount";

// Student pages
import Dashboard from "../pages/student/Dashboard";
import MyLearning from "../pages/student/MyLearning";
import Wishlist from "../pages/student/Wishlist";

// Admin pages
import AdminOverview from "../pages/admin/AdminOverview";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminEnrollments from "../pages/admin/AdminEnrollments";
import AdminInstructors from "../pages/admin/AdminInstructors";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminCoupons from "../pages/admin/AdminCoupons";
import AdminNotifications from "../pages/admin/AdminNotifications";

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/courses" element={<Courses />} />

        <Route
          path="/courses/:courseId"
          element={<CourseDetails />}
        />

        <Route
          path="/about"
          element={
            <div>
              <h1>About</h1>
              <p>About page coming soon.</p>
            </div>
          }
        />

        {/* GUEST-ONLY ROUTES */}

        <Route element={<GuestRoute />}>
          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/activate"
            element={<ActivateAccount />}
          />

          <Route
            path="/login"
            element={<Login />}
          />
        </Route>
      </Route>

      {/* STUDENT ROUTES */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/my-learning"
            element={<MyLearning />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />
        </Route>
      </Route>

      {/* ADMIN ROUTES */}

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<AdminOverview />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="courses"
            element={<AdminCourses />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="enrollments"
            element={<AdminEnrollments />}
          />

          <Route
            path="instructors"
            element={<AdminInstructors />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />
        </Route>
      </Route>

      {/* FALLBACK ROUTE */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;
