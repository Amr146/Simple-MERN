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
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByText(/already registered/i)).toBeInTheDocument();
	});

	it('submits the form and navigates on success', async () => {
		mockRegister.mockResolvedValueOnce(undefined);

		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
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

	it('shows an error message when passwords do not match', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: { value: 'DifferentPass!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
		});
	});

	it('shows an error message for weak passwords', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'weakpass' },
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: { value: 'weakpass' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(
				screen.getByText(/password must be at least 8 characters long/i)
			).toBeInTheDocument();
		});
	});

	it('shows an error message for invalid emails', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'invalid-email@sda' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
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

		fireEvent.change(screen.getByLabelText('Email'), {
			target: { value: 'used@example.com' },
		});
		fireEvent.change(screen.getByLabelText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByLabelText('Confirm Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
		});
	});
});
