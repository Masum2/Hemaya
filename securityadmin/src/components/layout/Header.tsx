import { Menu, Moon, Sun, Bell, MessageSquare, FileText, User, LogOut, ChevronDown, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
    const { theme, toggleTheme } = useTheme();

    interface QuickAction {
        icon: React.ElementType;
        bg: string;
        label: string;
    }

    const actions: QuickAction[] = [
        { icon: MessageSquare, bg: 'bg-indigo-500', label: 'Messages' },
        { icon: FileText, bg: 'bg-emerald-500', label: 'Reports' },
        { icon: User, bg: 'bg-amber-500', label: 'Profile' },
        { icon: LogOut, bg: 'bg-rose-500', label: 'Logout' }
    ];

    return (
        <div className="flex flex-col w-full sticky top-0 z-30">
            {/* --- Top Bar (Clean & Professional) --- */}
            <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 transition-all">

                {/* Left: Branding & Date */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                BERATEN <span className="text-blue-600">Software</span>
                            </span>
                            <span className="text-[10px] font-bold text-blue-500/80 tracking-widest uppercase mt-0.5">Logged In</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700/50">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            May 11, 2026 • 04:41 AM
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Module Switcher (Styled) */}
                    <div className="relative hidden sm:block">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all">
                            <option>Switch Module</option>
                            <option>Finance</option>
                            <option>HR Management</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                    {/* Quick Buttons */}
                    <div className="flex items-center gap-2">
                        {actions.map((btn, i) => (
                            <button
                                key={i}
                                title={btn.label}
                                className={`p-2 ${btn.bg} text-white rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                            >
                                <btn.icon size={15} />
                            </button>
                        ))}

                        <button
                            onClick={toggleTheme}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all cursor-pointer"
                        >
                            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Middle Bar (Module Title) --- */}
            <div className="h-9 bg-gradient-to-r from-[#403081] to-[#5b44b8] flex items-center justify-center px-4 relative overflow-hidden">
                {/* Subtle decorative element */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <span className="relative z-10 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                    Current Active Module : <span className="text-yellow-400 drop-shadow-md">CHILD WELFARE</span>
                </span>
            </div>

            {/* --- Navigation Bar (Modern Tabs) --- */}
            <div className="h-11 bg-[#5484B3] flex items-center justify-between shadow-inner">
                <nav className="flex h-full overflow-x-auto no-scrollbar">
                    {['Dashboard', 'New Report Intake', 'Search Systems', 'Family Structures'].map((item) => (
                        <button
                            key={item}
                            className="px-5 md:px-8 text-[10px] md:text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 h-full border-r border-white/5 whitespace-nowrap transition-all uppercase tracking-tight cursor-pointer"
                        >
                            {item}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center px-4 gap-4 bg-[#5484B3] sticky right-0 shadow-[-10px_0_15px_rgba(0,0,0,0.1)]">
                    <button className="text-white/80 hover:text-white transition-colors cursor-pointer relative">
                        <Bell size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#5484B3]" />
                    </button>
                </div>
            </div>
        </div>
    );
};