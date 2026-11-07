
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      // Step 1: Authenticate using the API
      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Step 2: Get user details from AuthContext
      const loggedInUser = result?.user;

      if (!loggedInUser) {
        throw new Error("User details were not returned.");
      }

      // Step 3: Identify the user's role
      const userRole = loggedInUser.role?.toLowerCase();

      console.log("Logged-in user:", loggedInUser);
      console.log("Logged-in role:", userRole);

      toast.success("Login successful!");

      // Step 4: Redirect based on role
      if (userRole === "admin") {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      // Step 5: Normal users go to their previous page
      // or the student dashboard.
      const previousPage = location.state?.from;

      const destination =
        previousPage?.pathname &&
        !previousPage.pathname.startsWith("/admin")
          ? `${previousPage.pathname}${previousPage.search || ""}${previousPage.hash || ""}`
          : "/dashboard";

      navigate(destination, {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-heading">
          <h1>Welcome Back</h1>

          <p>
            Login to continue your learning journey.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
