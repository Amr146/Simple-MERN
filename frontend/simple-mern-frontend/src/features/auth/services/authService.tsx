import { baseApi } from '../../../services/api';

export const authService = {
	async login(email: string, password: string) {
		const response = await baseApi.post('/auth/login', { email, password }, {
			skipAuthRefresh: true,
		} as any);
		return response.data.accessToken;
	},

	async logout(accessToken: string) {
		await baseApi.post('/auth/logout', {}, {
			headers: { Authorization: `Bearer ${accessToken}` },
			skipAuthRefresh: true,
		} as any);
	},

	async refreshAccessToken() {
		const response = await baseApi.post('/auth/refresh', {}, {
			skipAuthRefresh: true,
		} as any);
		return response.data.accessToken;
	},

	async getUserData() {
		const response = await baseApi.get('/auth/me');
		return response.data;
	},

	async register(email: string, password: string, confirmPassword: string) {
		const response = await baseApi.post(
			'/auth/register',
			{ email, password, confirmPassword },
			{
				skipAuthRefresh: true,
			} as any
		);
		return response.data;
	},
};
