import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const ProtectedRoute: React.FC = () => {
	const token = useAuthStore((state) => state.accessToken);

	return token ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedRoute;
