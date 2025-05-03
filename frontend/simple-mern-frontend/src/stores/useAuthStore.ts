import { create } from 'zustand';

interface AuthState {
	userEmail: string;
	accessToken: string;
	setUserEmail: (email: string) => void;
	setToken: (accessToken: string) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	userEmail: '',
	accessToken: '',
	setUserEmail: (email) => set({ userEmail: email }),
	setToken: (accessToken) => set({ accessToken }),
	clearAuth: () => set({ userEmail: '', accessToken: '' }),
}));
