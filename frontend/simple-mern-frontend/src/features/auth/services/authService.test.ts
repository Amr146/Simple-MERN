import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { baseApi } from '../../../services/api';

vi.mock('../../../services/api', () => ({
	baseApi: {
		post: vi.fn(),
		get: vi.fn(),
	},
}));

describe('authService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should login and return accessToken', async () => {
		const mockToken = 'mock-access-token';
		(baseApi.post as any).mockResolvedValue({
			data: { accessToken: mockToken },
		});

		const token = await authService.login('test@example.com', 'password');
		expect(baseApi.post).toHaveBeenCalledWith(
			'/auth/login',
			{
				email: 'test@example.com',
				password: 'password',
			},
			{ skipAuthRefresh: true }
		);
		expect(token).toBe(mockToken);
	});

	it('should logout successfully', async () => {
		(baseApi.post as any).mockResolvedValue({});

		await authService.logout('access-token');
		expect(baseApi.post).toHaveBeenCalledWith(
			'/auth/logout',
			{},
			{
				headers: { Authorization: `Bearer access-token` },
				skipAuthRefresh: true,
			}
		);
	});

	it('should refresh token and return accessToken', async () => {
		const mockToken = 'new-access-token';
		(baseApi.post as any).mockResolvedValue({
			data: { accessToken: mockToken },
		});

		const token = await authService.refreshAccessToken();
		expect(baseApi.post).toHaveBeenCalledWith(
			'/auth/refresh',
			{},
			{ skipAuthRefresh: true }
		);
		expect(token).toBe(mockToken);
	});

	it('should get user data', async () => {
		const mockUser = { id: 1, email: 'test@example.com' };
		(baseApi.get as any).mockResolvedValue({ data: mockUser });

		const user = await authService.getUserData();
		expect(baseApi.get).toHaveBeenCalledWith('/auth/me');
		expect(user).toEqual(mockUser);
	});

	it('should register and return user data', async () => {
		const mockData = { id: 1, email: 'new@example.com' };
		(baseApi.post as any).mockResolvedValue({ data: mockData });

		const result = await authService.register('new@example.com', 'password');
		expect(baseApi.post).toHaveBeenCalledWith(
			'/auth/register',
			{
				email: 'new@example.com',
				password: 'password',
			},
			{ skipAuthRefresh: true }
		);
		expect(result).toEqual(mockData);
	});
});
