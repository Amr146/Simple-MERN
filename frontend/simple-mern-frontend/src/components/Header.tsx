import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authManager } from '../features/auth/services/authManager';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
	const userEmail = useAuthStore((state) => state.userEmail);

	return (
		<header className='flex items-center justify-between px-8 py-4 bg-blue-600 text-white shadow-md'>
			{/* Logo and navigation */}
			<Link
				to='/video'
				className='text-2xl font-semibold hover:text-blue-300 transition-colors'
			>
				Vauth
			</Link>

			{/* User email (as a link) and logout */}
			<div className='flex items-center gap-6'>
				<Link
					to='/profile'
					className='text-lg hover:text-blue-200 transition-colors'
				>
					{userEmail}
				</Link>

				<button
					onClick={authManager.logout}
					style={{ cursor: 'pointer' }}
					className='px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-white'
				>
					Logout
				</button>
			</div>
		</header>
	);
};

export default Header;
