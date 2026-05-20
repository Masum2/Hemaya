import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'

// ১. TanStack Query ইম্পোর্ট করুন
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ২. QueryClient ইনস্ট্যান্স তৈরি করুন
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // উইন্ডো ফোকাসে অটো রি-ফেচ বন্ধ রাখার জন্য
            retry: 1, // API ফেইল করলে ১ বার ট্রাই করবে
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* ৩. প্রথমে QueryClientProvider দিন, তার ভেতর ThemeProvider রাখুন */}
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)