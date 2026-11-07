
import api from "../api/axios";

export const registerUser = async (userData) => {
  const response = await api.post(
    "/api/v1/auth/register",
    userData
  );

  return response.data;
};

export const activateUser = async (activationData) => {
  const response = await api.post(
    "/api/v1/auth/activate-user",
    activationData
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/api/v1/auth/login",
    credentials
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.get("/api/v1/auth/logout");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.get(
    "/api/v1/auth/refreshtoken"
  );

  return response.data;
};
