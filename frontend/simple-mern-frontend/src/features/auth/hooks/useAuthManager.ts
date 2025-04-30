// src/features/auth/hooks/useAuthManager.ts
import { useAuthStore } from '../../../stores/useAuthStore';
import { useAuthService } from '../services/authService';

export const useAuthManager = () => {
	const authService = useAuthService();
	const { setToken, clearAuth, setUserEmail } = useAuthStore();

	const login = async (email: string, password: string) => {
		const accessToken = await authService.login(email, password);
		setToken(accessToken);
		setUserEmail(email);
	};

	const logout = async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error('Error logging out:', error);
		}
		clearAuth();
		//remove the cookie from the browser
		document.cookie =
			'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		//redirect to login page
		window.location.href = '/login';
	};

	const register = async (email: string, password: string) => {
		const { accessToken } = await authService.register(email, password);
		setToken(accessToken);
		setUserEmail(email);
	};

	const refresh = async () => {
		const newAccessToken = await authService.refreshAccessToken();
		setToken(newAccessToken);
	};

	const getUserData = async () => {
		const userData = await authService.getUserData();
		setUserEmail(userData.email);
		return userData;
	};

	return {
		login,
		logout,
		register,
		refresh,
		getUserData,
	};
};
