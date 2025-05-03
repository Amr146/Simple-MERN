import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { authManager } from '../features/auth/services/authManager';

const baseApi = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
});

// Request Interceptor: Attach token
baseApi.interceptors.request.use((config) => {
	const token = useAuthStore.getState().accessToken;
	if (token && !(config as any).skipAuthRefresh) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
}, Promise.reject);

// Response Interceptor: Handle 401 errors
baseApi.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error?.response?.status !== 401 || originalRequest?.skipAuthRefresh) {
			return Promise.reject(error);
		}

		try {
			const newToken = await authManager.refresh();
			useAuthStore.getState().accessToken = newToken;
			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			return baseApi(originalRequest);
		} catch {
			await authManager.logout();
			return Promise.reject(error);
		}
	}
);

export { baseApi };
