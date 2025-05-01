import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthManager } from './useAuthManager';

// Mock dependencies
const mockSetToken = vi.fn();
const mockClearAuth = vi.fn();
const mockSetUserEmail = vi.fn();
const mockAuthService = {
	login: vi.fn(),
	logout: vi.fn(),
	register: vi.fn(),
	refreshAccessToken: vi.fn(),
	getUserData: vi.fn(),
};

// Mock `useAuthStore`
vi.mock('../../../stores/useAuthStore', () => ({
	useAuthStore: () => ({
		setToken: mockSetToken,
		clearAuth: mockClearAuth,
		setUserEmail: mockSetUserEmail,
	}),
}));

// Mock `useAuthService`
vi.mock('../services/authService', () => ({
	useAuthService: () => mockAuthService,
}));

describe('useAuthManager', () => {
	beforeEach(() => {
		vi.clearAllMocks(); // Clear all mocks before each test
	});

	it('logs in a user and sets the token and email', async () => {
		const accessToken = 'mockAccessToken';
		mockAuthService.login.mockResolvedValueOnce(accessToken);

		const { result } = renderHook(() => useAuthManager());

		await act(async () => {
			await result.current.login('test@example.com', 'password123');
		});

		expect(mockAuthService.login).toHaveBeenCalledWith(
			'test@example.com',
			'password123'
		);
		expect(mockSetToken).toHaveBeenCalledWith(accessToken);
		expect(mockSetUserEmail).toHaveBeenCalledWith('test@example.com');
	});

	it('logs out a user, clears auth, and redirects', async () => {
		const { result } = renderHook(() => useAuthManager());

		mockAuthService.logout.mockResolvedValueOnce({
			message: 'Logout successful',
		});

		await act(async () => {
			await result.current.logout();
		});

		expect(mockAuthService.logout).toHaveBeenCalled();
		expect(mockClearAuth).toHaveBeenCalled();
	});

	it('registers a user, sets the token, and email', async () => {
		const accessToken = 'mockAccessToken';
		mockAuthService.register.mockResolvedValueOnce({ accessToken });

		const { result } = renderHook(() => useAuthManager());

		await act(async () => {
			await result.current.register('test@example.com', 'password123');
		});

		expect(mockAuthService.register).toHaveBeenCalledWith(
			'test@example.com',
			'password123'
		);
		expect(mockSetToken).toHaveBeenCalledWith(accessToken);
		expect(mockSetUserEmail).toHaveBeenCalledWith('test@example.com');
	});

	it('refreshes the access token and sets it', async () => {
		const newAccessToken = 'newMockAccessToken';
		mockAuthService.refreshAccessToken.mockResolvedValueOnce(newAccessToken);

		const { result } = renderHook(() => useAuthManager());

		await act(async () => {
			await result.current.refresh();
		});

		expect(mockAuthService.refreshAccessToken).toHaveBeenCalled();
		expect(mockSetToken).toHaveBeenCalledWith(newAccessToken);
	});

	it('retrieves user data and sets the user email', async () => {
		const mockUserData = { email: 'test@example.com', name: 'John Doe' };
		mockAuthService.getUserData.mockResolvedValueOnce(mockUserData);

		const { result } = renderHook(() => useAuthManager());

		const userData = await act(async () => await result.current.getUserData());

		expect(mockAuthService.getUserData).toHaveBeenCalled();
		expect(mockSetUserEmail).toHaveBeenCalledWith('test@example.com');
		expect(userData).toEqual(mockUserData);
	});
});
