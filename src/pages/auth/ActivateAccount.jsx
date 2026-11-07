
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { activateUser } from "../../services/authService";
import "./auth.css";

function ActivateAccount() {
  const location = useLocation();
  const navigate = useNavigate();

  const response = location.state?.registrationResponse;

  const data = response?.data || response;

  const activationCode =
    data?.activation_code ||
    data?.activationCode ||
    data?.user?.activation_code ||
    data?.data?.activation_code ||
    data?.data?.activationCode ||
    "";

  const activationToken =
    data?.activation_token ||
    data?.activationToken ||
    data?.user?.activation_token ||
    data?.data?.activation_token ||
    "";

  const registeredEmail = location.state?.registeredEmail || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(activationCode));
      toast.success("Activation code copied!");
    } catch {
      toast.error("Unable to copy activation code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activationToken) {
      return toast.error("Activation token is missing.");
    }

    if (!code.trim()) {
      return toast.error("Enter your activation code.");
    }

    try {
      setLoading(true);

      const result = await activateUser({
        activation_token: activationToken,
        activation_code: code.trim(),
      });

      toast.success(result.message || "Account activated successfully!");

      navigate("/login");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Account activation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-heading">
          <h1>Activate Your Account</h1>
          <p>Use your activation code to verify your account.</p>
        </div>

        {registeredEmail && (
          <p className="registered-email">
            Registered email: <strong>{registeredEmail}</strong>
          </p>
        )}

        <div className="activation-code-box">
          <p>Your Activation Code</p>

          <div className="code-display">
            <h2>
              {activationCode || "Code not returned by API"}
            </h2>

            <button
              type="button"
              className="copy-button"
              onClick={handleCopy}
              disabled={!activationCode}
            >
              Copy
            </button>
          </div>

          {!activationCode && (
            <p className="activation-warning">
              The registration API did not return a recognized
              activation code. Check the registration response.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter Activation Code</label>

            <input
              type="text"
              placeholder="Paste your activation code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Activating..." : "Activate Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already activated? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default ActivateAccount;
