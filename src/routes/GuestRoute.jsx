
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner message="Checking authentication..." />
    );
  }

  if (user) {
    const destination =
      user.role?.toLowerCase() === "admin"
        ? "/admin"
        : "/dashboard";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
