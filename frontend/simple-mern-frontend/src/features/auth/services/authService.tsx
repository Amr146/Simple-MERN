import { useApi } from '../../../hooks/useApi';

export const useAuthService = () => {
	const api = useApi();

	const login = async (email: string, password: string) => {
		const response = await api.post('/auth/login', { email, password }, {
			skipAuthRefresh: true,
		} as any);
		return response.data.accessToken;
	};

	const logout = async () => {
		await api.post('/auth/logout');
	};

	const refreshAccessToken = async () => {
		const response = await api.post('/auth/refresh', {}, {
			skipAuthRefresh: true,
		} as any);
		return response.data.accessToken;
	};

	const getUserData = async () => {
		const response = await api.get('/auth/me');
		return response.data;
	};

	const register = async (email: string, password: string) => {
		const response = await api.post('/auth/register', { email, password }, {
			skipAuthRefresh: true,
		} as any);
		return response.data;
	};

	return {
		login,
		logout,
		refreshAccessToken,
		getUserData,
		register,
	};
};
