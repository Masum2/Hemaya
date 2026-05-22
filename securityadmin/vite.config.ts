import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: '/admin', // 👈 সাব-পাথ নিশ্চিত করার জন্য এটি অত্যন্ত জরুরি
    server: {
        port: 54080,    // 👈 আপনার মেইন প্রজেক্টের পোর্ট এখানে সেট করে দেওয়া হলো
        strictPort: true,
    },
    build: {
        // ডটনেটের মেইন প্রজেক্টের wwwroot/admin ফোল্ডারের পাবলিশ পাথ
        outDir: '../SecurityAdminHost/wwwroot/admin',
        emptyOutDir: true,
    }
});