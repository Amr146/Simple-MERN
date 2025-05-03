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
		} catch (error) {
			console.error('Error logging out:', error);
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
