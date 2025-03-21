import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ component: Component }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if user is authenticated
  const location = useLocation();

  return isAuthenticated ? (
    <Component />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;

