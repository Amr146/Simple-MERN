import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: vi.fn(),
	};
});

vi.mock('../services/authManager', () => ({
	authManager: {
		login: vi.fn(),
	},
}));

import { useNavigate } from 'react-router-dom';
import { authManager } from '../services/authManager';

describe('Login Component', () => {
	let mockNavigate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;
	});

	it('renders the login form', () => {
		render(<Login />, { wrapper: MemoryRouter });
		expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
	});

	it('submits the form on success', async () => {
		(authManager.login as jest.Mock).mockResolvedValueOnce(undefined);

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(authManager.login).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
		});
	});

	it('shows an error message on 401', async () => {
		(authManager.login as jest.Mock).mockRejectedValueOnce({
			response: { status: 401 },
		});

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: 'wrong@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: 'wrongpass' },
		});
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(
				screen.getByText(/invalid email or password/i)
			).toBeInTheDocument();
		});
	});

	it('shows an error message on 500', async () => {
		(authManager.login as jest.Mock).mockRejectedValueOnce({
			response: { status: 500 },
		});

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: 'password' },
		});
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(screen.getByText(/error/i)).toBeInTheDocument();
		});
	});
});
