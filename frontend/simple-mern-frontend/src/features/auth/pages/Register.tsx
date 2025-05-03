import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import validator from 'validator';
import { authManager } from '../services/authManager';

const Register: React.FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');

	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [emailError, setEmailError] = useState<string>('');
	const [passwordError, setPasswordError] = useState<string>('');
	const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const { register } = authManager;
	const navigate = useNavigate();

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		setEmailError(
			!value.trim()
				? 'Email is required'
				: !validator.isEmail(value)
				? 'Invalid email format'
				: ''
		);
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPassword(value);
		setPasswordError(
			!value.trim()
				? 'Password is required'
				: !validator.isStrongPassword(value, {
						minLength: 8,
						minLowercase: 1,
						minUppercase: 1,
						minNumbers: 1,
						minSymbols: 1,
				  })
				? 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
				: ''
		);
	};

	const handleConfirmPasswordChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setConfirmPassword(value);
		setConfirmPasswordError(
			!value.trim()
				? 'Confirm Password is required'
				: value !== password
				? 'Passwords do not match'
				: ''
		);
	};

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (emailError || passwordError || confirmPasswordError) {
			return;
		}

		if (!email.trim()) {
			setEmailError('Email is required');
		}
		if (!password.trim()) {
			setPasswordError('Password is required');
		}
		if (!confirmPassword.trim()) {
			setConfirmPasswordError('Confirm Password is required');
		}

		if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
			return;
		}

		setLoading(true);
		try {
			await register(email, password, confirmPassword);
			navigate('/video');
		} catch (err: any) {
			setEmailError('');
			setPasswordError('');
			setConfirmPasswordError('');
			setErrorMessage(
				err?.response?.data?.error || 'Registration failed. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='w-full max-w-md p-8 bg-white shadow-lg rounded-lg'>
				<h2 className='mb-6 text-2xl font-bold text-center text-gray-700'>
					Register
				</h2>
				<form onSubmit={handleRegister} noValidate>
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
					<div className='mb-4'>
						<label
							htmlFor='confirmPassword'
							className='block mb-2 text-sm text-gray-600'
						>
							Confirm Password
						</label>
						<input
							id='confirmPassword'
							type='password'
							value={confirmPassword}
							onChange={handleConfirmPasswordChange}
							className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400'
							required
							placeholder='Confirm Password'
						/>
						{confirmPasswordError && (
							<p className='text-sm text-red-500'>{confirmPasswordError}</p>
						)}
					</div>
					{errorMessage && (
						<p className='mb-4 text-sm text-red-500'>{errorMessage}</p>
					)}
					<p className='mb-4 text-lg text-center text-gray-700'>
						Already registered?{' '}
						<span className='font-bold text-blue-600'>
							<Link to='/login'>Login</Link>
						</span>
					</p>
					<button
						type='submit'
						style={{ cursor: 'pointer' }}
						className='w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50'
						disabled={loading}
					>
						{loading ? 'Registering...' : 'Register'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Register;
