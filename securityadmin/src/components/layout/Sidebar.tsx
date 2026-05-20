import {
    
    Users,
    Settings,
    LogOut,
    ShieldCheck,

    LockKeyhole,
    Database
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import type { MenuItem } from '../../types';

const menuItems: MenuItem[] = [
    // { icon: LayoutDashboard, label: 'Dashboard', path: '/' },

    // System Configuration
    { icon: Database, label: 'Manage System Configuration', path: '/managesyscon' },

    // Privileges
    { icon: ShieldCheck, label: 'Manage System Privileges', path: '/privileges' },

    // Users
    { icon: Users, label: 'Manage Users', path: '/users' },

    // User Restriction
    { icon: LockKeyhole, label: 'Manage Users Restriction', path: '/manageuserres' },

    // Settings
    // { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
    isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
    return (
        <aside
            className={`
                ${isOpen ? 'w-68' : 'w-20'}
                transition-all duration-300
                bg-white dark:bg-slate-900
                border-r border-slate-200 dark:border-slate-800
                flex flex-col
            `}
        >
            <div className="p-6 font-bold text-xl text-blue-600 truncate">
                {isOpen ? 'RLN ADMIN' : 'RLN'}
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center p-3 rounded-lg transition-colors
                            ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }
                        `}
                    >
                        <item.icon size={22} />

                        {isOpen && (
                            <span className="ml-3 text-[13px] font-medium">
                                {item.label}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                    <LogOut size={22} />

                    {isOpen && (
                        <span className="ml-3 font-medium">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};