import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Search, Grid, ShieldAlert, Layers, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { userService } from '../api/userService';
import type { AppUser } from '../types/user';

const ManageUsers = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await userService.getUserList();
                setUsers(data);
            } catch (err) {
                console.error("Error fetching user list:", err);
                const errorMessage = err instanceof Error ? err.message : "Failed to load user list.";
                setError(`${errorMessage} Please check your session or network connection.`);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    /* 
      👉 আপনার সেই সমস্যামূলক useEffect-টি এখান থেকে ফেলে দেওয়া হয়েছে।
      স্টেট ডিরেক্ট চেঞ্জ না করে আমরা ট্যাব বা সার্চ চেঞ্জ হলে UI-তে প্রথম পেজ দেখাবো।
    */

    // ১. Active/Inactive ট্যাব ফিল্টার
    const filteredByTab = users.filter((user) => {
        const status = user?.IsActive !== undefined ? user.IsActive : user?.isActive;
        return activeTab === 'active' ? status === true : status === false;
    });

    // ২. সার্চ ফিল্টার
    const searchedUsers = filteredByTab.filter((user) => {
        const searchString = searchTerm.toLowerCase();
        const loginId = String(user?.LoginId || user?.loginId || '').toLowerCase();
        const fullName = String(user?.FullNameFormatted || user?.fullNameFormatted || '').toLowerCase();
        const email = String(user?.Email || user?.email || '').toLowerCase();

        return loginId.includes(searchString) || fullName.includes(searchString) || email.includes(searchString);
    });

    // Pagination Logic
    const totalPages = Math.ceil(searchedUsers.length / itemsPerPage);

    // সেফটি চেক: যদি সার্চের কারণে কারেন্ট পেজ টোটাল পেজের চেয়ে বড় হয়ে যায়, তবে ১ম পেজে ব্যাক করবে
    const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;

    const indexOfLastItem = safeCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = searchedUsers.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatActiveDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }).format(date).replace(/ /g, '-').replace(/,/g, '');
        } catch (e) {
            return 'N/A';
        }
    };

    // Pagination Range Calculation
    let startPage = Math.max(1, safeCurrentPage - 4);
    const  endPage = Math.min(totalPages, startPage + 9);

    if (endPage - startPage < 9) {
        startPage = Math.max(1, endPage - 9);
    }

    // ট্যাব বা সার্চ পরিবর্তন করার সময় পেজ ১ করার জন্য হ্যান্ডলার
    const handleTabChange = (tab: 'active' | 'inactive') => {
        setActiveTab(tab);
        setCurrentPage(1); // ইউজার অ্যাকশনের সাথে স্টেট পরিবর্তন একদম সেফ
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // ইউজার টাইপ করার সাথে সাথে পেজ ১ হবে
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Manage Users</h1>
                <button
                    onClick={() => navigate('/users/add')}
                    className="w-full sm:w-auto flex items-center cursor-pointer justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                >
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            {/* Tab Controller Buttons */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
                <button
                    onClick={() => handleTabChange('active')} // পরিবর্তিত হ্যান্ডলার
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all border-b-2 ${activeTab === 'active'
                        ? 'border-emerald-500 text-emerald-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <CheckCircle size={16} /> Active Users ({users.filter(u => (u?.IsActive ?? u?.isActive) === true).length})
                </button>
                <button
                    onClick={() => handleTabChange('inactive')} // পরিবর্তিত হ্যান্ডলার
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all border-b-2 ${activeTab === 'inactive'
                        ? 'border-rose-500 text-rose-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <XCircle size={16} /> Inactive Users ({users.filter(u => (u?.IsActive ?? u?.isActive) === false).length})
                </button>
            </div>

            {/* Search & Table Wrapper */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Search Field */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Email..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)} // পরিবর্তিত হ্যান্ডলার
                        className="bg-transparent outline-none text-slate-600 dark:text-slate-300 w-full text-sm"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px] border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Login Id</th>
                                <th className="px-6 py-4">Display Name</th>
                                <th className="px-4 py-4">Last Active Date</th>
                                <th className="px-6 py-4">User Role</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4 text-center">Permissions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data, please wait...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-red-500 font-medium text-sm">
                                        {error}
                                    </td>
                                </tr>
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((user) => {
                                    const roleName = user.Role || user.AppUserRoleDesc || user.role || user.appUserRoleDesc || "User";
                                    const userId = user.Id || user.id;

                                    return (
                                        <tr key={userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                <Link
                                                    to={`/users/edit/${userId}`}
                                                    className="text-blue-600 font-bold hover:underline"
                                                >
                                                    {user.LoginId || user.loginId}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium dark:text-white whitespace-nowrap">
                                                {user?.FullNameFormatted || user?.fullNameFormatted}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {formatActiveDate(user.LastActiveDate || user.lastActiveDate)}
                                            </td>
                                            <td className="px-6 py-4 text-sm dark:text-slate-300">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold">
                                                    {roleName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{user.Email || user.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{user.Phone || user.phone || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/users/widgets/${userId}`)}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-600 text-[10px] cursor-pointer font-bold rounded uppercase border border-cyan-100 hover:bg-cyan-100 transition-colors"
                                                    >
                                                        <Grid size={12} /> Widgets
                                                    </button>
                                                    <button className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] cursor-pointer font-bold rounded uppercase border border-rose-100 hover:bg-rose-100 transition-colors">
                                                        <ShieldAlert size={12} /> Privileges
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/users/modules/${userId}`)}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] cursor-pointer font-bold rounded uppercase border border-slate-200 hover:bg-slate-200 transition-colors"
                                                    >
                                                        <Layers size={12} /> Modules
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                                        No {activeTab} users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI Section */}
                {!loading && !error && searchedUsers.length > 0 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {indexOfLastItem > searchedUsers.length ? searchedUsers.length : indexOfLastItem}
                            </span>{' '}
                            of <span className="font-semibold text-slate-700 dark:text-slate-200">{searchedUsers.length}</span> entries
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(safeCurrentPage - 1)}
                                disabled={safeCurrentPage === 1}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer ${safeCurrentPage === 1
                                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;

                                if (pageNumber >= startPage && pageNumber <= endPage) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-all ${safeCurrentPage === pageNumber
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(safeCurrentPage + 1)}
                                disabled={safeCurrentPage === totalPages}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer ${safeCurrentPage === totalPages
                                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;