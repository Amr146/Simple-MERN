import React, { useEffect, useState } from 'react';
import AppRouter from './routes/Router';
import { useAuthStore } from './stores/useAuthStore';
import { authManager } from './features/auth/services/authManager';

const App: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const setUserEmail = useAuthStore((state) => state.setUserEmail);

	useEffect(() => {
		const initSession = async () => {
			try {
				const userData = await authManager.getUserData();
				setUserEmail(userData.email);
			} catch (error) {
				console.error('Session init failed:');
			} finally {
				setLoading(false);
			}
		};

		initSession();
	}, [setUserEmail]);

	if (loading) return null;

	return <AppRouter />;
};

export default App;
