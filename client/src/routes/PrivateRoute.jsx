import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

const PrivateRoute = ({component:Component}) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is authenticated

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
