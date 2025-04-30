import React from 'react';
import AppRouter from './routes/Router';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useAuthManager } from './features/auth/hooks/useAuthManager';
import { setupInterceptors } from './services/api';
setupInterceptors();

const App: React.FC = () => {
	const { refresh, getUserData } = useAuthManager();
	const [loading, setLoading] = React.useState(true);
	const setUserEmail = useAuthStore((state) => state.setUserEmail);

	useEffect(() => {
		const refreshAccessToken = async () => {
			try {
				await refresh();
				const userData = await getUserData();
				setUserEmail(userData.email);
			} catch (error) {
				console.error('Error refreshing access token:', error);
			} finally {
				setLoading(false);
			}
		};
		refreshAccessToken();
	}, []);

	return loading ? <></> : <AppRouter />;
};
export default App;
