import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../UserContext';

const ProtectedRoute = () => {
  const { user } = UserContext();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;