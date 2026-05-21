/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Trash2, Plus, Shield, LayoutGrid, Layers, User, Settings2, AlertTriangle, X } from "lucide-react";
import { useParams } from 'react-router-dom';
import type { WidgetItem } from "../types/manage-widget-types/widget.types";
import { useGetUserWidgets } from "../api-hooks/manage-widget-hooks/useGetUserWidgets";
import { useToggleWidgetStatus } from "../api-hooks/manage-widget-hooks/useToggleWidgetStatus";
import { useRemoveWidget } from "../api-hooks/manage-widget-hooks/useRemoveWidget";
import { useAssignAllWidgets } from "../api-hooks/manage-widget-hooks/useAssignAllWidgets";
import { getComponentMeta, WIDGET_TYPE_MAP } from "../constant/manage-widgets/widgetConfig";
import { toast } from "react-toastify";


const ManageWidgets = () => {
    const { id } = useParams();
    const appUserIdNum = Number(id) || 0;

    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'assigned' | 'ready'>('assigned');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [widgetToDelete, setWidgetToDelete] = useState<WidgetItem | null>(null);

    // Custom Hooks
    const {
        loading,
        modules,
        assignedWidgets,
        readyWidgets,
        userInfo,
        refetch,
        setAssignedWidgets,
        setReadyWidgets
    } = useGetUserWidgets(appUserIdNum, selectedModuleId);

    const { toggleStatus, loading: toggleLoading } = useToggleWidgetStatus(appUserIdNum, selectedModuleId);
    const { removeWidgetById, loading: removeLoading } = useRemoveWidget(appUserIdNum, selectedModuleId);
    const { assignSingleWidget, assignAllAvailableWidgets, loading: assignLoading } = useAssignAllWidgets(appUserIdNum, selectedModuleId);

    const actionLoading = toggleLoading || removeLoading || assignLoading;

    // Set initial selected module when modules load
    useEffect(() => {
        if (modules.length > 0 && !selectedModuleId) {
            setSelectedModuleId(modules[0].ModuleId);
        }
    }, [modules, selectedModuleId]);

    const handleToggleStatus = async (widget: WidgetItem) => {
        await toggleStatus(widget.Id, widget.IsInactive, () => {
            setAssignedWidgets(prev =>
                prev.map(item => item.Id === widget.Id ? { ...item, IsInactive: !item.IsInactive } : item)
            );
        });
    };

    const handleRemoveClick = (widget: WidgetItem) => {
        setWidgetToDelete(widget);
        setIsModalOpen(true);
    };

    const confirmRemoveWidget = async () => {
        if (!widgetToDelete) return;

        const success = await removeWidgetById(widgetToDelete.Id);
        if (success) {
            setIsModalOpen(false);
            setWidgetToDelete(null);
            await refetch();
        }
    };

    const handleAssignWidget = async (widget: WidgetItem) => {
        const meta = getComponentMeta(widget.WidgetComponentId);
        const success = await assignSingleWidget(widget.WidgetComponentId, widget.WidgetType);
        if (success) {
            toast.success(`"${meta.name}" assigned successfully!`);
            await refetch();
        }
    };

    const handleAssignAllWidgets = async () => {
        const success = await assignAllAvailableWidgets(readyWidgets);
        if (success) {
            await refetch();
        }
    };

    const handleTypeChange = (componentId: number, newType: number) => {
        setReadyWidgets(prev =>
            prev.map(item => item.WidgetComponentId === componentId ? { ...item, WidgetType: newType } : item)
        );
    };

    const currentModuleName = modules.find(m => m.ModuleId === selectedModuleId)?.ModuleName || "Child Welfare";

    return (
        <div className="min-h-screen p-6 bg-slate-50 text-slate-800 font-sans antialiased relative">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Navigation/Tabs */}
                <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-md shadow-inner">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-white py-2.5 px-4 text-sm font-semibold text-slate-900 rounded-lg shadow-sm border border-slate-200/50 transition-all">
                        <LayoutGrid size={16} className="text-indigo-600" /> Widgets
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all">
                        <Shield size={16} /> Privileges
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all">
                        <Layers size={16} /> Modules
                    </button>
                </div>

                {/* User Info Section */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <User size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage User Widgets for:</h1>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600 pt-1">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-medium text-slate-400 mb-1">NAME</span>
                            <span className="font-semibold text-slate-800">{userInfo.name || "Loading..."}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-medium text-slate-400 mb-1">LOGIN ID</span>
                            <span className="font-semibold text-slate-800">{userInfo.loginId || "Loading..."}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-medium text-slate-400 mb-1">ROLE</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {userInfo.role || "Loading..."}
                            </span>
                        </div>
                    </div>
                    {/* Module Selector & Active Module Info */}
                    <div className="bg-white p-5  shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Module Context</label>
                            <div className="relative">
                                <select
                                    value={selectedModuleId || ""}
                                    onChange={(e) => setSelectedModuleId(Number(e.target.value))}
                                    className="w-full sm:w-64 h-10 border border-slate-200 rounded-xl px-3 pr-8 text-sm bg-slate-50 font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer appearance-none"
                                    disabled={actionLoading}
                                >
                                    {modules.length === 0 && <option value="">Loading modules...</option>}
                                    {modules.map((m) => (
                                        <option key={m.ModuleId} value={m.ModuleId}>{m.ModuleName}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                    <Settings2 size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Active Workspace</span>
                            <h2 className="text-lg font-bold text-slate-800">
                                Module: <span className="text-indigo-600 font-extrabold">{currentModuleName}</span>
                            </h2>
                        </div>
                    </div>
                </div>

              

                {/* Tab Navigation for Widget Sections */}
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`px-6 py-3 text-sm font-semibold transition-all relative ${activeTab === 'assigned'
                            ? 'text-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Assigned Widgets
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                            {assignedWidgets.length}
                        </span>
                        {activeTab === 'assigned' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ready')}
                        className={`px-6 py-3 text-sm font-semibold transition-all relative ${activeTab === 'ready'
                            ? 'text-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Ready to be Assigned
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                            {readyWidgets.length}
                        </span>
                        {activeTab === 'ready' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                        )}
                    </button>

                </div>

                {/* Assigned Widgets Tab Content */}
                {activeTab === 'assigned' && (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
                            <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <h3 className="font-bold text-slate-800 text-base">Assigned Widgets</h3>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                                    Total: {assignedWidgets.length}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                            <th className="py-3.5 px-6">Widget Name</th>
                                            <th className="py-3.5 px-6">Group Category</th>
                                            <th className="py-3.5 px-6">Type</th>
                                            <th className="py-3.5 px-6 text-center">Personal</th>
                                            <th className="py-3.5 px-6 text-center">Status</th>
                                            <th className="py-3.5 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading && assignedWidgets.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">Loading widgets context...</td>
                                            </tr>
                                        ) : assignedWidgets.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No assigned widgets found for this workspace.</td>
                                            </tr>
                                        ) : (
                                            assignedWidgets.map((widget) => {
                                                const meta = getComponentMeta(widget.WidgetComponentId);
                                                const typeInfo = WIDGET_TYPE_MAP[widget.WidgetType] || { name: "Essential", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.08)", border: "rgba(14, 165, 233, 0.15)" };

                                                return (
                                                    <tr key={widget.Id} className="hover:bg-slate-50/60 transition-colors group">
                                                        <td className="py-4 px-6 font-semibold text-slate-700 max-w-xs sm:max-w-md truncate">{meta.name}</td>
                                                        <td className="py-4 px-6 text-slate-500 font-medium">{meta.group}</td>
                                                        <td className="py-4 px-6">
                                                            <span
                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold border tracking-wide"
                                                                style={{ color: typeInfo.color, backgroundColor: typeInfo.bg, borderColor: typeInfo.border }}
                                                            >
                                                                {typeInfo.name}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${widget.IsMyStuff ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-500'}`}>
                                                                {widget.IsMyStuff ? "Yes" : "No"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button
                                                                onClick={() => handleToggleStatus(widget)}
                                                                disabled={actionLoading}
                                                                className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-all duration-200 outline-none ${!widget.IsInactive ? "bg-emerald-500 ring-4 ring-emerald-50" : "bg-slate-200"}`}
                                                            >
                                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-200 ${!widget.IsInactive ? "translate-x-4.5" : "translate-x-1"}`} />
                                                            </button>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button
                                                                onClick={() => handleRemoveClick(widget)}
                                                                disabled={actionLoading}
                                                                className="inline-flex items-center gap-1.5 cursor-pointer bg-rose-50 text-rose-600 text-xs px-3 py-1.5 rounded-lg hover:bg-rose-100 font-semibold border border-rose-100 transition-all opacity-90 group-hover:opacity-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Trash2 size={13} /> Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Ready to be Assigned Tab Content */}
                {activeTab === 'ready' && (
                    <>
                        
                      

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-sky-50 to-indigo-50/40 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    <h3 className="font-bold text-slate-800 text-base">Ready to be Assigned</h3>
                                </div>
                                <button
                                    onClick={handleAssignAllWidgets}
                                    disabled={readyWidgets.length === 0 || actionLoading}
                                    className="bg-indigo-600 text-white text-sm px-5 py-2 cursor-pointer rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-98 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed font-semibold transition-all"
                                >
                                    {actionLoading ? "Processing Workspace..." : "Assign All Widgets"}
                                </button>
                              
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                            <th className="py-3.5 px-6">Widget Name</th>
                                            <th className="py-3.5 px-6">Group Category</th>
                                            <th className="py-3.5 px-6" style={{ width: '180px' }}>Type Config</th>
                                            <th className="py-3.5 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading && readyWidgets.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">Loading repository...</td>
                                            </tr>
                                        ) : readyWidgets.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-emerald-600 bg-emerald-50/10 font-medium">Awesome, repository is clean. All items deployed!</td>
                                            </tr>
                                        ) : (
                                            readyWidgets.map((item, index) => {
                                                const meta = getComponentMeta(item.WidgetComponentId);
                                                return (
                                                    <tr key={index} className="hover:bg-indigo-50/20 bg-white transition-colors group">
                                                        <td className="py-4 px-6 text-slate-700 font-semibold max-w-xs sm:max-w-md truncate">{meta.name}</td>
                                                        <td className="py-4 px-6 text-slate-500 font-medium">{meta.group}</td>
                                                        <td className="py-4 px-6">
                                                            <select
                                                                value={item.WidgetType}
                                                                onChange={(e) => handleTypeChange(item.WidgetComponentId, Number(e.target.value))}
                                                                className="w-full h-9 border border-slate-200 rounded-xl px-2.5 text-xs bg-slate-50 font-semibold text-slate-600 outline-none hover:border-slate-300 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                                                                disabled={actionLoading}
                                                            >
                                                                {Object.entries(WIDGET_TYPE_MAP).map(([key, val]) => (
                                                                    <option key={key} value={key}>{val.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <button
                                                                onClick={() => handleAssignWidget(item)}
                                                                disabled={actionLoading}
                                                                className="inline-flex items-center cursor-pointer gap-1.5 bg-indigo-50 text-indigo-600 text-xs px-3.5 py-2 rounded-xl hover:bg-indigo-600 hover:text-white font-bold border border-indigo-100 transition-all disabled:bg-slate-100 disabled:text-slate-400 shadow-sm"
                                                            >
                                                                <Plus size={13} /> Assign Widget
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {isModalOpen && widgetToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto antialiased">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 transition-opacity duration-300 animate-fade-in"
                        onClick={() => !actionLoading && setIsModalOpen(false)}
                    />

                    {/* Modal Content Box */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 overflow-hidden transform transition-all scale-100 duration-300 z-10">
                        {/* Close Button */}
                        <button
                            disabled={actionLoading}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            {/* Warning Icon Animation */}
                            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 ring-8 ring-rose-50/50">
                                <AlertTriangle size={28} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                Remove Widget?
                            </h3>

                            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                                Are you sure you want to remove <span className="font-semibold text-slate-700">"{getComponentMeta(widgetToDelete.WidgetComponentId).name}"</span>?
                            </p>
                        </div>

                        {/* Buttons Group */}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all outline-none disabled:opacity-50 cursor-pointer text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={confirmRemoveWidget}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 active:bg-rose-800 transition-all shadow-md shadow-rose-100 outline-none flex items-center justify-center gap-2 disabled:bg-rose-400 cursor-pointer"
                            >
                                {actionLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Trash2 size={15} />
                                )}
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageWidgets;