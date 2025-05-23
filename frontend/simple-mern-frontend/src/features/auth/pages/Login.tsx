import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authManager } from '../services/authManager';

const Login: React.FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [emailError, setEmailError] = useState<string>('');
	const [passwordError, setPasswordError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const { login } = authManager;
	const navigate = useNavigate();

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError(!value.trim() ? 'Email is required' : '');
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPassword(value);
		setPasswordError(!value.trim() ? 'Password is required' : '');
	};

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email.trim()) {
			setEmailError('Email is required.');
		}
		if (!password.trim()) {
			setPasswordError('Password is required.');
		}
		if (!email.trim() || !password.trim()) {
			return;
		}
		if (emailError || passwordError) {
			return;
		}

		setErrorMessage('');
		setLoading(true);

		try {
			await login(email, password);
			navigate('/video');
		} catch (error: any) {
			if (error.response?.status === 401) {
				setErrorMessage('Invalid email or password. Please try again.');
			} else if (error.response?.status === 500) {
				setErrorMessage('Server error. Please try again later.');
			} else {
				setErrorMessage('An unexpected error occurred. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='w-full max-w-md p-8 bg-white shadow-lg rounded-lg'>
				<h2 className='mb-6 text-2xl font-bold text-center text-gray-700'>
					Login
				</h2>

				<form onSubmit={handleLogin} noValidate>
					<div className='mb-4'>
						<label htmlFor='email' className='block mb-2 text-sm text-gray-600'>
							Email
						</label>
						<input
							id='email'
							type='email'
							value={email}
							onChange={handleEmailChange}
							className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400'
							required
							placeholder='Email'
						/>
						{emailError && <p className='text-sm text-red-500'>{emailError}</p>}
					</div>
					<div className='mb-4'>
						<label
							htmlFor='password'
							className='block mb-2 text-sm text-gray-600'
						>
							Password
						</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={handlePasswordChange}
							className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400'
							required
							placeholder='Password'
						/>
						{passwordError && (
							<p className='text-sm text-red-500'>{passwordError}</p>
						)}
					</div>
					{errorMessage && (
						<p className='mb-4 text-sm text-red-500'>{errorMessage}</p>
					)}
					<p className='mb-4 text-lg text-center text-gray-700'>
						Not registered?{' '}
						<span className='font-bold text-blue-600'>
							<Link to='/register'>Register</Link>
						</span>
					</p>
					<button
						style={{ cursor: 'pointer' }}
						type='submit'
						className='w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50'
						disabled={loading}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
