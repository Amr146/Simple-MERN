import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Register from './Register';
import { MemoryRouter } from 'react-router-dom';
import { authManager } from '../services/authManager';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual: any = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock('../services/authManager', () => ({
	authManager: {
		register: vi.fn(),
	},
}));

describe('Register Component', () => {
	const mockRegister = authManager.register as unknown as ReturnType<
		typeof vi.fn
	>;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the registration form', () => {
		render(<Register />, { wrapper: MemoryRouter });

		expect(
			screen.getByRole('heading', { name: /register/i })
		).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
		expect(screen.getByText(/already registered/i)).toBeInTheDocument();
	});

	it('submits the form and navigates on success', async () => {
		mockRegister.mockResolvedValueOnce(undefined);

		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
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

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
			target: { value: 'WrongPass!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
		});
	});

	it('shows an error message for weak passwords', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Password'), {
			target: { value: 'weak' },
		});
		fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
			target: { value: 'weak' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/least one uppercase/i)).toBeInTheDocument();
		});
	});

	it('shows an error message for invalid email format', async () => {
		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'bad-email@' },
		});
		fireEvent.change(screen.getByPlaceholderText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
		});
	});

	it('shows a generic error message on registration failure', async () => {
		mockRegister.mockRejectedValueOnce({
			response: { data: { error: 'Email already in use' } },
		});

		render(<Register />, { wrapper: MemoryRouter });

		fireEvent.change(screen.getByPlaceholderText('Email'), {
			target: { value: 'used@example.com' },
		});
		fireEvent.change(screen.getByPlaceholderText('Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
			target: { value: 'Password123!' },
		});
		fireEvent.click(screen.getByRole('button', { name: /register/i }));

		await waitFor(() => {
			expect(screen.getByText(/use/i)).toBeInTheDocument();
		});
	});
});
