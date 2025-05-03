import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';

import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Video from '../features/video/pages/Video';
import ProtectedRoute from './ProtectedRoute';
import Profile from '../features/auth/pages/Profile';

const AppRouter: React.FC = () => {
	return (
		<Router>
			<Routes>
				{/* Public Routes */}
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />

				{/* Protected Routes */}
				<Route element={<ProtectedRoute />}>
					<Route path='/video' element={<Video />} />
					<Route path='/profile' element={<Profile />} />
				</Route>

				{/* Fallback */}
				<Route path='*' element={<Navigate to='/login' replace />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
