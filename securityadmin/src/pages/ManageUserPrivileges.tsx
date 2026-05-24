import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserPrivilege } from '../api-hooks/user-privileges/useGetUserPrivilege';
import { Layers, LayoutGrid, Shield } from 'lucide-react';


export const ManageUserPrivileges = () => {
    const { id } = useParams();
    const appUserIdNum = Number(id) || 2; 

    const {
        loading,
        error,
        modules,
        selectedModule,
        userInfo,
        privileges,
        handleModuleChange,
        togglePrivilege,
        resetAllPrivileges,
        savePrivileges
    } = useGetUserPrivilege(appUserIdNum);
console.log("userInfo",userInfo)
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
        "Adhoc Reports": true,
        "AFCARS Related": true,
        "CannedReports": true,
        "Case Assessment": true
    });

    const toggleExpand = (name: string) => {
        setExpandedNodes(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const renderPrivilegeItem = (privilege: any, level: number = 0, parentName?: string) => {
        const hasChildren = privilege.Items && privilege.Items.length > 0;
        const isExpanded = !!expandedNodes[privilege.Text];
        const paddingLeft = level * 24;

        return (
            <div key={privilege.Text} className="w-full">
                <div 
                    className="flex items-center py-2 px-4 hover:bg-gray-50 transition-colors border-b border-gray-100/50"
                    style={{ paddingLeft: `${paddingLeft + 16}px` }}
                >
                    <div className="w-6 h-6 flex items-center justify-center mr-1">
                        {hasChildren ? (
                            <button 
                                type="button"
                                onClick={() => toggleExpand(privilege.Text)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <svg 
                                    className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1"></div>
                        )}
                    </div>

                    <input
                        type="checkbox"
                        id={`chk-${privilege.Text}`}
                        checked={privilege.Checked || false}
                        onChange={() => togglePrivilege(privilege.Text, parentName)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />

                    <label 
                        htmlFor={`chk-${privilege.Text}`}
                        className={`ml-3 text-sm cursor-pointer select-none ${hasChildren ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
                    >
                        {privilege.Text}
                    </label>
                </div>
                
                {hasChildren && isExpanded && (
                    <div className="w-full bg-gray-50/30">
                        {privilege.Items.map((child: any) => 
                            renderPrivilegeItem(child, level + 1, privilege.Text)
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                <div className="text-gray-600 font-medium">Processing database records...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-5xl mx-auto mt-4 bg-red-50 text-red-700 rounded-md shadow-sm">
                <strong>Database Error:</strong> {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4 bg-gray-50/50 min-h-screen">
            {/* Top Navigation Tabs */}
             {/* Top Navigation/Tabs */}
                <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-md shadow-inner">
                   
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all">
                        <Shield size={16} /> Widgets
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all">
                        <Layers size={16} /> Modules
                    </button>
                     <button className="flex-1 flex items-center justify-center gap-2 bg-white py-2.5 px-4 text-sm font-semibold text-slate-900 rounded-lg shadow-sm border border-slate-200/50 transition-all">
                        <LayoutGrid size={16} className="text-indigo-600" /> Privileges
                    </button>
                </div>

            {/* Live User Info Section */}
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">User Privilege Mapping</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-sm text-gray-700">
                    <div><span className="text-gray-400">Name:</span> <span className="font-medium text-gray-900">{userInfo.name}</span></div>
                    <div><span className="text-gray-400">Info:</span> <span className="font-medium text-gray-900">{userInfo.loginId}</span></div>
                    <div><span className="text-gray-400">Active Role:</span> <span className="font-medium text-gray-900">{userInfo.role}</span></div>
                </div>
            </div>

            {/* Dynamic Module Dropdown */}
            <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-800 mb-2">Select Module</label>
                <div className="relative max-w-md">
                    <select
                        value={selectedModule}
                        onChange={(e) => {
                            const currentModuleName = e.target.value;
                            const selected = modules.find(m => m.ModuleName === currentModuleName);
                            if (selected) {
                                handleModuleChange(selected.ModuleName, selected.ModuleId);
                            }
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 cursor-pointer appearance-none pr-10"
                    >
                        {modules.map(mod => (
                            <option key={mod.ModuleId} value={mod.ModuleName}>
                                {mod.ModuleName} {mod.IsPrimary ? '(Primary)' : ''}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                <button
                    onClick={resetAllPrivileges}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-4 rounded shadow-sm transition"
                >
                    Resete All previleges for {userInfo.name}
                </button>
            </div>

            {/* Dynamic Privilege Tree Container */}
            <div className="bg-white rounded-md border-t-4 border-indigo-900 shadow-md overflow-hidden">
                <div className="py-2 bg-white min-h-[300px]">
                    {privileges.length > 0 ? (
                        <div className="w-full divide-y divide-gray-100">
                            {privileges.map(privilege => renderPrivilegeItem(privilege, 0))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-sm text-gray-400">
                            No privileges found in database for module "{selectedModule}"
                        </div>
                    )}
                </div>

                {/* Footer Save Changes Button */}
                <div className="px-6 py-3 bg-gray-50 flex justify-end border-t border-gray-100">
                    <button
                        onClick={savePrivileges}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-6 rounded shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};