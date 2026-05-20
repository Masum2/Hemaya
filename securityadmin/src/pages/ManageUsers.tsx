import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Search, Edit3, Grid, ShieldAlert, Layers, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Active vs Inactive Tab State
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

    // Search State
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get('/api/SecurityAdmin/GetUserList', {
                    withCredentials: true,
                    headers: {
                        'accept': '*/*'
                    }
                });

                console.log("Clean API Response Data:", response.data);

                if (response.data && Array.isArray(response.data.Data)) {
                    setUsers(response.data.Data);
                } else if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else if (response.data && Array.isArray(response.data.data)) {
                    setUsers(response.data.data);
                } else if (response.data && Array.isArray(response.data.appUserData)) {
                    setUsers(response.data.appUserData);
                } else if (response.data && Array.isArray(response.data.result)) {
                    setUsers(response.data.result);
                } else {
                    console.warn("Expected an array but got a different structure.");
                    setUsers([]);
                }
            } catch (err: any) {
                console.error("Error fetching user list:", err);
                setError("Failed to load user list. Please check your session or network connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Tab বা Search পরিবর্তন হলে পেজ নম্বর ১ এ রিসেট করার জন্য
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    // ১. Active/Inactive ট্যাবের ওপর ভিত্তি করে ফ্রন্টএন্ড ফিল্টার (PascalCase & camelCase সেফটিসহ)
    const filteredByTab = users.filter((user) => {
        // ব্যাকএন্ডের IsActive অথবা ফ্রন্টএন্ডের isActive দুটোই চেক করবে
        const status = user?.IsActive !== undefined ? user.IsActive : user?.isActive;

        if (activeTab === 'active') {
            return status === true;
        } else {
            return status === false;
        }
    });

    // ২. ফিল্টার করা ডেটার ওপর সার্চ অ্যাপ্লাই করা (বড় ও ছোট হাতের ফিল্ড নেম সেফটিসহ)
    const searchedUsers = filteredByTab.filter((user) => {
        const searchString = searchTerm.toLowerCase();

        const loginId = user?.LoginId ? String(user.LoginId).toLowerCase() : (user?.loginId ? String(user.loginId).toLowerCase() : '');
        const fullName = user?.FullNameFormatted ? String(user.FullNameFormatted).toLowerCase() : (user?.fullNameFormatted ? String(user.fullNameFormatted).toLowerCase() : '');
        const email = user?.Email ? String(user.Email).toLowerCase() : (user?.email ? String(user.email).toLowerCase() : '');

        return (
            loginId.includes(searchString) ||
            fullName.includes(searchString) ||
            email.includes(searchString)
        );
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = searchedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(searchedUsers.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // নির্দিষ্ট ফরম্যাটে (e.g., Feb-13-2026) ডেট দেখানোর হেল্পার ফাংশন
    const formatActiveDate = (dateString: any) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            // 'Feb-13-2026' ফরম্যাট তৈরি করার লজিক
            const formatter = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });

            const parts = formatter.formatToParts(date);
            const month = parts.find(p => p.type === 'month')?.value;
            const day = parts.find(p => p.type === 'day')?.value;
            const year = parts.find(p => p.type === 'year')?.value;

            return `${month}-${day}-${year}`;
        } catch (e) {
            return 'N/A';
        }
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
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all border-b-2 ${activeTab === 'active'
                        ? 'border-emerald-500 text-emerald-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <CheckCircle size={16} /> Active Users ({users.filter(u => (u?.IsActive ?? u?.isActive) === true).length})
                </button>
                <button
                    onClick={() => setActiveTab('inactive')}
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <td colSpan={8} className="py-14 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data, please wait...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-red-500 font-medium text-sm">
                                        {error}
                                    </td>
                                </tr>
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((user) => {
                                    const roleName = user.Role || user.AppUserRoleDesc || user.role || user.appUserRoleDesc || "User";
                                    const userId = user.Id || user.id;

                                    return (
                                        <tr key={userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* LoginId */}
                                            <Link
                                                to={`/users/edit/${userId}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                            >
                                               
                                          
                                            <td className="px-6 py-4 text-blue-600 font-bold text-sm whitespace-nowrap">
                                                {user.LoginId || user.loginId}
                                            </td>
                                            </Link>
                                            {/* Display Name */}
                                            <td className="px-6 py-4 text-sm font-medium dark:text-white whitespace-nowrap">
                                                {user?.FullNameFormatted || user?.fullNameFormatted}
                                            </td>

                                            {/* Last Active Date formatted as Feb-13-2026 */}
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {formatActiveDate(user.LastActiveDate || user.lastActiveDate)}
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-4 text-sm dark:text-slate-300">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold">
                                                    {roleName}
                                                </span>
                                            </td>

                                            {/* Email & Phone */}
                                            <td className="px-6 py-4 text-xs text-slate-500">{user.Email || user.email || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{user.Phone || user.phone || 'N/A'}</td>

                                            {/* Permissions */}
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

                                            {/* Actions */}
                                   
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
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
                        {/* Data Info */}
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{indexOfFirstItem + 1}</span> to{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {indexOfLastItem > searchedUsers.length ? searchedUsers.length : indexOfLastItem}
                            </span>{' '}
                            of <span className="font-semibold text-slate-700 dark:text-slate-200">{searchedUsers.length}</span> entries
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-1">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer ${currentPage === 1
                                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;

                                let startPage = Math.max(1, currentPage - 4);
                                let endPage = Math.min(totalPages, startPage + 9);

                                if (endPage - startPage < 9) {
                                    startPage = Math.max(1, endPage - 9);
                                }

                                if (pageNumber >= startPage && pageNumber <= endPage) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer transition-all ${currentPage === pageNumber
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

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer ${currentPage === totalPages
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