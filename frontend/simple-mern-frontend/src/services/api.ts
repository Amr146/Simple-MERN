import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { useAuthManager } from '../features/auth/hooks/useAuthManager';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const baseApi = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

// Extend Axios config type
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	_retry: any;
	skipAuthRefresh?: boolean;
}

let interceptorsInitialized = false;

export const setupInterceptors = () => {
	if (interceptorsInitialized) return;
	interceptorsInitialized = true;

	baseApi.interceptors.request.use((config) => {
		const token = useAuthStore.getState().token;
		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	baseApi.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config as CustomAxiosRequestConfig;

			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!originalRequest.skipAuthRefresh
			) {
				originalRequest._retry = true;
				try {
					const res = await baseApi.post('/auth/refresh');
					const newAccessToken = res.data.accessToken;
					useAuthStore.getState().setToken(newAccessToken);

					originalRequest.headers = originalRequest.headers || {};
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					return baseApi(originalRequest);
				} catch (err) {
					console.error('Error refreshing access token:', err);
					useAuthManager().logout();
					window.location.href = '/login';
					return Promise.reject(err);
				}
			}

			return Promise.reject(error);
		}
	);
};
