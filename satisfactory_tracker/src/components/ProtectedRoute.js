import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = () => {
  const { user } = UserContext();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;