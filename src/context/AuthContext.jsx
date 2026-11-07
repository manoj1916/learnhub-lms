
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext(null);

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getAccessToken(data) {
  return (
    data?.accessToken ||
    data?.access_token ||
    data?.token ||
    data?.tokens?.accessToken ||
    data?.tokens?.access_token ||
    null
  );
}

function getRefreshToken(data) {
  return (
    data?.refreshToken ||
    data?.refresh_token ||
    data?.tokens?.refreshToken ||
    data?.tokens?.refresh_token ||
    null
  );
}

function getUser(data) {
  return (
    data?.user ??
    data?.data?.user ??
    data?.currentUser ??
    null
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  // Restore the current user when the application starts.
  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem("accessToken");

    try {
      const response = await getCurrentUser();

      const data = getPayload(response);
      const currentUser = getUser(data);

      if (!currentUser) {
        throw new Error(
          "User information was not returned by the API."
        );
      }

      setUser(currentUser);
      setToken(localStorage.getItem("accessToken"));

      return currentUser;
    } catch (error) {
      const status = error.response?.status;

      console.error(
        "Unable to restore authenticated user:",
        error.response?.data || error.message
      );

      if (status === 401 || status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setUser(null);
        setToken(null);
      } else {
        // Preserve credentials if the problem is temporary
        // or caused by a network/CORS issue.
        setToken(storedToken);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Keep shared user state updated after profile changes.
  useEffect(() => {
    function handleUserUpdated(event) {
      if (event.detail) {
        setUser(event.detail);
      }
    }

    window.addEventListener(
      "learnhub:user-updated",
      handleUserUpdated
    );

    return () => {
      window.removeEventListener(
        "learnhub:user-updated",
        handleUserUpdated
      );
    };
  }, []);

  // Authenticate a user.
  const login = useCallback(async (credentials) => {
    // Clear the previous account before switching accounts.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setToken(null);

    try {
      const response = await loginUser(credentials);

      const data = getPayload(response);

      const accessToken = getAccessToken(data);
      const refreshToken = getRefreshToken(data);

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        setToken(accessToken);
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      let authenticatedUser = getUser(data);

      // If login did not return the user, request the profile.
      if (!authenticatedUser) {
        const profileResponse = await getCurrentUser();

        const profileData = getPayload(profileResponse);

        authenticatedUser = getUser(profileData);
      }

      if (!authenticatedUser) {
        throw new Error(
          "Login succeeded, but user information could not be loaded."
        );
      }

      setUser(authenticatedUser);

      setToken(
        localStorage.getItem("accessToken")
      );

      return {
        user: authenticatedUser,
        response: data,
      };
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setUser(null);
      setToken(null);

      throw error;
    }
  }, []);

  // Logout the current user.
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(
        "Logout API error:",
        error.response?.data || error.message
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,

      isAuthenticated: Boolean(user),
      isAdmin: user?.role?.toLowerCase() === "admin",
      isInstructor:
        user?.role?.toLowerCase() === "instructor",

      login,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [
      user,
      token,
      loading,
      login,
      logout,
      fetchCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
