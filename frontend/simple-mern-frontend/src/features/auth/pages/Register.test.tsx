import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Register from './Register';
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
const mockRegister = vi.fn();
vi.mock('../hooks/useAuthManager', () => ({
	useAuthManager: () => ({
		register: mockRegister,
	}),
}));

describe('Register Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the registration form', () => {
		render(<Register />, { wrapper: MemoryRouter });
		expect(
			screen.getByRole('heading', { name: /register/i })
		).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByText(/already registered/i)).toBeInTheDocument(); // Check link text
	});

	it('submits the form and navigates on success', async () => {
		mockRegister.mockResolvedValueOnce(undefined);

		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(mockRegister).toHaveBeenCalledWith(
				'test@example.com',
				'Password123!'
			);
			expect(mockNavigate).toHaveBeenCalledWith('/video');
		});
	});

	it('shows an error message for weak passwords', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'weakpass' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(
				screen.getByText(
					/Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character/i
				)
			).toBeInTheDocument();
		});
	});

	it('shows an error message for invalid emails', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'invalid-email@asa' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
		});
	});

	it('shows an error message on registration failure', async () => {
		mockRegister.mockRejectedValueOnce({
			response: { data: { error: 'Email already in use' } },
		});

		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText(/email/i), {
			target: { value: 'used@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
		});
	});
});
