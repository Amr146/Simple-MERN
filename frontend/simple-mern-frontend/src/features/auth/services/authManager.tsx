import { authService } from '../services/authService';
import { useAuthStore } from '../../../stores/useAuthStore';

export const authManager = {
	async login(email: string, password: string) {
		const accessToken = await authService.login(email, password);
		useAuthStore.getState().setToken(accessToken);
		useAuthStore.getState().setUserEmail(email);
	},
	async logout() {
		try {
			await authService.logout();
		} catch (error: any) {
			const status = error?.response?.status;

			// Only log errors that aren't 401 or 403
			if (status !== 401 && status !== 403) {
				console.error('Logout error:', error);
			}
		}
		useAuthStore.getState().clearAuth();
		sessionStorage.clear();
	},

	async register(email: string, password: string) {
		const { accessToken } = await authService.register(email, password);
		useAuthStore.getState().setToken(accessToken);
		useAuthStore.getState().setUserEmail(email);
	},

	async refresh() {
		const newAccessToken = await authService.refreshAccessToken();
		useAuthStore.getState().setToken(newAccessToken);
		return newAccessToken;
	},

	async getUserData() {
		const userData = await authService.getUserData();
		useAuthStore.getState().setUserEmail(userData.email);
		return userData;
	},
};
