import { create } from 'zustand';

interface AuthState {
	userEmail: string;
	token: string;
	setUserEmail: (email: string) => void;
	setToken: (token: string) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	userEmail: '',
	token: '',
	setUserEmail: (email) => set({ userEmail: email }),
	setToken: (token) => set({ token }),
	clearAuth: () => set({ userEmail: '', token: '' }),
}));
