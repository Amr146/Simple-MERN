import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { authManager } from '../services/authManager';

const Profile: React.FC = () => {
	// State to store user data
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const userData = await authManager.getUserData();
				setUser(userData);
			} catch (error) {
				setError('Error fetching user data');
				console.error('Error fetching user data:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchUserData();
	}, []);

	if (loading) {
		return <div>Loading...</div>; // Show loading message while fetching data
	}

	if (error) {
		return <div>{error}</div>; // Show error message if there's an error
	}

	return (
		<>
			<Header />
			<div className='p-8 bg-gray-50 min-h-screen flex flex-col items-center'>
				<div className='max-w-3xl w-full bg-white p-6 rounded-lg shadow-md'>
					<h1 className='text-3xl font-semibold text-center text-gray-800 mb-6'>
						Profile
					</h1>
					<div className='text-lg text-gray-700'>
						<p className='mb-2'>
							<strong className='font-semibold'>ID:</strong> {user.id}
						</p>
						<p>
							<strong className='font-semibold'>Email:</strong> {user.email}
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default Profile;
