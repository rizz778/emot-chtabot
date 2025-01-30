import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

const PrivateRoute = () => {
  return getToken() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
