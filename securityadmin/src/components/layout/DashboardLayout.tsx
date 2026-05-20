import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';


export const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-8xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                    © 2026 Beraten Software. All rights reserved.
                </footer>
            </div>
        </div>
    );
};