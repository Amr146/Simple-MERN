import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	server: {
		watch: {
			usePolling: true,
		},
		host: true,
		strictPort: true,
	},
	plugins: [react(), tailwindcss()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
		include: ['**/*.{test,spec}.{ts,tsx}'],
		reporters: ['verbose'],
	},
});
