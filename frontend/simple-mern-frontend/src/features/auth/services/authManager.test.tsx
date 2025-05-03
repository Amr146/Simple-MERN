import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authManager } from './authManager';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({
	authService: {
		login: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
		refreshAccessToken: vi.fn(),
		getUserData: vi.fn(),
	},
}));

const mockSetToken = vi.fn();
const mockSetUserEmail = vi.fn();
const mockClearAuth = vi.fn();

vi.mock('../../../stores/useAuthStore', () => ({
	useAuthStore: {
		getState: () => ({
			setToken: mockSetToken,
			setUserEmail: mockSetUserEmail,
			clearAuth: mockClearAuth,
		}),
	},
}));

describe('authManager', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		sessionStorage.clear();
	});

	it('should login and update auth store', async () => {
		(authService.login as any).mockResolvedValue('mock-token');

		await authManager.login('user@example.com', 'pass');
		expect(authService.login).toHaveBeenCalledWith('user@example.com', 'pass');
		expect(mockSetToken).toHaveBeenCalledWith('mock-token');
		expect(mockSetUserEmail).toHaveBeenCalledWith('user@example.com');
	});

	it('should logout, clear auth and sessionStorage', async () => {
		(authService.logout as any).mockResolvedValue(undefined);
		sessionStorage.setItem('test', 'value');

		await authManager.logout();

		expect(authService.logout).toHaveBeenCalled();
		expect(mockClearAuth).toHaveBeenCalled();
		expect(sessionStorage.getItem('test')).toBe(null);
	});

	it('should register and update auth store', async () => {
		(authService.register as any).mockResolvedValue({
			accessToken: 'reg-token',
		});

		await authManager.register('new@example.com', 'secret');
		expect(authService.register).toHaveBeenCalledWith(
			'new@example.com',
			'secret'
		);
		expect(mockSetToken).toHaveBeenCalledWith('reg-token');
		expect(mockSetUserEmail).toHaveBeenCalledWith('new@example.com');
	});

	it('should refresh access token and update store', async () => {
		(authService.refreshAccessToken as any).mockResolvedValue('new-token');

		const token = await authManager.refresh();
		expect(authService.refreshAccessToken).toHaveBeenCalled();
		expect(mockSetToken).toHaveBeenCalledWith('new-token');
		expect(token).toBe('new-token');
	});

	it('should get user data and update store', async () => {
		const mockUser = { email: 'me@example.com', name: 'Test User' };
		(authService.getUserData as any).mockResolvedValue(mockUser);

		const result = await authManager.getUserData();
		expect(authService.getUserData).toHaveBeenCalled();
		expect(mockSetUserEmail).toHaveBeenCalledWith('me@example.com');
		expect(result).toEqual(mockUser);
	});
	it('should still clear auth if logout throws with 401', async () => {
		const error401 = {
			response: {
				status: 401,
			},
			message: 'Unauthorized',
		};

		(authService.logout as any).mockRejectedValue(error401);

		await authManager.logout();

		expect(mockClearAuth).toHaveBeenCalled();
	});
});
