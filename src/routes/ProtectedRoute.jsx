
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner message="Checking authentication..." />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
