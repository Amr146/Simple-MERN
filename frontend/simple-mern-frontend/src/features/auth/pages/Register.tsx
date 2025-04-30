import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { useAuthManager } from '../hooks/useAuthManager';

const Register: React.FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const { register } = useAuthManager();
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			!validator.isStrongPassword(password, {
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
		) {
			setErrorMessage(
				'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
			);
			return;
		}
		if (!validator.isEmail(email)) {
			setErrorMessage('Invalid email format.');
			return;
		}
		setErrorMessage('');
		setLoading(true);
		await register(email, password)
			.then(() => {
				navigate('/video');
			})
			.catch((err) => {
				setErrorMessage(
					err?.response?.data.error || 'Registration failed. Please try again.'
				);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='w-full max-w-md p-8 bg-white shadow-lg rounded-lg'>
				<h2 className='mb-4 text-2xl font-bold text-center text-gray-700'>
					Register
				</h2>
				<h3 className='mb-2 text-l text-center text-gray-700'>
					Already registered?{' '}
					<span className='font-bold'>
						<Link to={'/login'}>Login</Link>
					</span>
				</h3>
				<form onSubmit={handleRegister}>
					<div className='mb-4'>
						<label className='block mb-2 text-sm font-medium text-gray-600'>
							Email:
						</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400'
							required
						/>
					</div>
					<div className='mb-4'>
						<label className='block mb-2 text-sm font-medium text-gray-600'>
							Password:
						</label>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring ${
								errorMessage ? 'border-red-500' : 'focus:border-blue-400'
							}`}
							required
						/>
					</div>
					{errorMessage && (
						<p className='mb-4 text-sm text-red-500'>{errorMessage}</p>
					)}
					<button
						type='submit'
						disabled={loading}
						className={`w-full px-4 py-2 text-white rounded-lg ${
							loading
								? 'bg-gray-400 cursor-not-allowed'
								: 'bg-blue-500 hover:bg-blue-600'
						}`}
					>
						{loading ? 'Registering...' : 'Register'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Register;
