import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthService } from './authService';

// Mock the `useApi` hook
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../../../hooks/useApi', () => ({
	useApi: () => ({
		post: mockPost,
		get: mockGet,
	}),
}));

describe('useAuthService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('logs in a user and returns the access token', async () => {
		const mockAccessToken = 'mockAccessToken';
		mockPost.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

		const { result } = renderHook(() => useAuthService());
		const { login } = result.current;

		const accessToken = await login('test@example.com', 'password123');

		expect(mockPost).toHaveBeenCalledWith(
			'/auth/login',
			{ email: 'test@example.com', password: 'password123' },
			{ skipAuthRefresh: true }
		);
		expect(accessToken).toBe(mockAccessToken);
	});

	it('logs out a user', async () => {
		mockPost.mockResolvedValueOnce({});

		const { result } = renderHook(() => useAuthService());
		const { logout } = result.current;

		await logout();

		expect(mockPost).toHaveBeenCalledWith('/auth/logout');
	});

	it('refreshes the access token and returns it', async () => {
		const mockAccessToken = 'newAccessToken';
		mockPost.mockResolvedValueOnce({ data: { accessToken: mockAccessToken } });

		const { result } = renderHook(() => useAuthService());
		const { refreshAccessToken } = result.current;

		const accessToken = await refreshAccessToken();

		expect(mockPost).toHaveBeenCalledWith(
			'/auth/refresh',
			{},
			{ skipAuthRefresh: true }
		);
		expect(accessToken).toBe(mockAccessToken);
	});

	it('retrieves user data', async () => {
		const mockUserData = { id: 1, name: 'John Doe', email: 'test@example.com' };
		mockGet.mockResolvedValueOnce({ data: mockUserData });

		const { result } = renderHook(() => useAuthService());
		const { getUserData } = result.current;

		const userData = await getUserData();

		expect(mockGet).toHaveBeenCalledWith('/auth/me');
		expect(userData).toEqual(mockUserData);
	});

	it('registers a new user and returns response data', async () => {
		const mockResponse = { id: 1, email: 'test@example.com' };
		mockPost.mockResolvedValueOnce({ data: mockResponse });

		const { result } = renderHook(() => useAuthService());
		const { register } = result.current;

		const response = await register('new@example.com', 'StrongPassword123!');

		expect(mockPost).toHaveBeenCalledWith(
			'/auth/register',
			{ email: 'new@example.com', password: 'StrongPassword123!' },
			{ skipAuthRefresh: true }
		);
		expect(response).toEqual(mockResponse);
	});
});
