import React from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAuthManager } from '../features/auth/hooks/useAuthManager';

const Header: React.FC = () => {
	const userEmail = useAuthStore((state) => state.userEmail);
	const { logout } = useAuthManager();

	return (
		<header className='flex items-center justify-between px-6 py-4 bg-blue-500 text-white'>
			<div className='text-xl font-bold'>Vauth </div>

			<div className='flex items-center gap-4'>
				<span>{userEmail}</span>
				<button
					onClick={logout}
					className='px-4 py-2 bg-red-500 rounded hover:bg-red-600'
				>
					Logout
				</button>
			</div>
		</header>
	);
};

export default Header;
