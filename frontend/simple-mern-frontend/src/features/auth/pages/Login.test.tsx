import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual: any = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock useAuthManager
const mockLogin = vi.fn();
vi.mock('../hooks/useAuthManager', () => ({
	useAuthManager: () => ({
		login: mockLogin,
	}),
}));

describe('Login Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the login form', () => {
		render(<Login />, { wrapper: MemoryRouter });
		expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});

	it('submits the form and navigates on success', async () => {
		mockLogin.mockResolvedValueOnce(undefined);

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'password123' },
		});
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
			expect(mockNavigate).toHaveBeenCalledWith('/video');
		});
	});

	it('shows an error message on 401', async () => {
		mockLogin.mockRejectedValueOnce({
			response: { status: 401 },
		});

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'wrong@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
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
		mockLogin.mockRejectedValueOnce({
			response: { status: 500 },
		});

		render(<Login />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'password' },
		});
		fireEvent.click(screen.getByRole('button', { name: /login/i }));

		await waitFor(() => {
			expect(screen.getByText(/server error/i)).toBeInTheDocument();
		});
	});
});
