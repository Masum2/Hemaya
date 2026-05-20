import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 54080,
        proxy: {
            // ব্রাউজার যখনই '/api' দেখবে, সেটিকে লোকাল .NET প্রক্সিতে পাঠাবে (Azure-এ নয়)
            '/api': {
                target: 'http://localhost:5205', // আপনার ডটনেট অ্যাপের লোকাল পোর্ট
                changeOrigin: true,
                secure: false,
            }
        }
    }
});