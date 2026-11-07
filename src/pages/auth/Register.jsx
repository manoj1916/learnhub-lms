
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../services/authService";
import "./auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 5) {
      return toast.error("Name must contain at least 5 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast.error("Enter a valid email address");
    }

    if (
      formData.password.length < 8 ||
      !/[0-9]/.test(formData.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    ) {
      return toast.error(
        "Password must contain 8 characters, a number and a special character"
      );
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Registration API response:", response);

      toast.success("Registration successful!");

      navigate("/activate", {
        state: {
          registrationResponse: response,
          registeredEmail: formData.email,
        },
      });

    } catch (error) {
      console.error("Registration error:", error.response?.data);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "";

      if (
        error.response?.status === 409 ||
        /already exists|already registered|email.*exist|duplicate/i.test(message)
      ) {
        toast.error("Email already exists. Please use another email.");
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-heading">
          <h1>Create Account</h1>
          <p>Join our learning community today.</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Checking and Registering..." : "Create Account"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
