import {
    Users,
    ShieldAlert,
    FileCheck,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    type LucideIcon,
} from "lucide-react";

// Define the type for each stat card
interface ChildStat {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    trend: string;
    trendUp: boolean;
}

const stats: ChildStat[] = [
    {
        label: "Active Cases",
        value: "142",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        trend: "+4",
        trendUp: true,
    },
    {
        label: "High Priority/At Risk",
        value: "12",
        icon: ShieldAlert,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        trend: "-2",
        trendUp: false,
    },
    {
        label: "Pending Assessments",
        value: "28",
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        trend: "+5",
        trendUp: true,
    },
    {
        label: "Closed Cases (MTD)",
        value: "45",
        icon: FileCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        trend: "+10%",
        trendUp: true,
    },
];

// Define type for alerts
interface AlertItem {
    id: string;
    name: string;
    issue: string;
    priority: "Critical" | "High" | "Medium";
}

const Dashboard: React.FC = () => {
    const alerts: AlertItem[] = [
        { id: "CW-902", name: "Zayan Mahmud", issue: "Overdue Home Visit", priority: "High" },
        { id: "CW-884", name: "Sara Khatun", issue: "Unassigned Emergency Referral", priority: "Critical" },
        { id: "CW-761", name: "Rahat Ahmed", issue: "Medical Report Pending", priority: "Medium" },
    ];

    return (
        <div className="space-y-8 p-6">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        Case Overview
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Welcome back, Hasan. There are{" "}
                        <span className="text-rose-500 font-bold underline">
                            12 high-risk alerts
                        </span>{" "}
                        requiring your attention.
                    </p>
                </div>
                <button className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    <AlertCircle size={18} /> Generate System Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div
                                className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}
                            >
                                <stat.icon className={stat.color} size={24} />
                            </div>
                            <span
                                className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${stat.trendUp
                                        ? "text-emerald-600 bg-emerald-50"
                                        : "text-rose-600 bg-rose-50"
                                    }`}
                            >
                                {stat.trend}{" "}
                                {stat.trendUp ? (
                                    <ArrowUpRight size={10} />
                                ) : (
                                    <ArrowDownRight size={10} />
                                )}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                {stat.label}
                            </h3>
                            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Urgent Alerts Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">
                            Urgent Case Alerts
                        </h3>
                        <button className="text-blue-600 text-xs font-bold hover:underline">
                            View All Alerts
                        </button>
                    </div>
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`h-2 w-2 rounded-full ${alert.priority === "Critical"
                                                ? "bg-rose-500 animate-pulse"
                                                : "bg-amber-500"
                                            }`}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {alert.name}{" "}
                                            <span className="text-xs text-slate-400 ml-2">
                                                #{alert.id}
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-500">{alert.issue}</p>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all">
                                    ACTION
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Status Summary */}
                <div className="bg-gradient-to-br from-[#403081] to-[#5484B3] rounded-3xl p-6 text-white shadow-xl">
                    <h3 className="font-bold text-lg mb-4">Quick Summary</h3>
                    <div className="space-y-6">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <p className="text-xs text-white/70 uppercase font-bold tracking-widest">
                                Total Placements
                            </p>
                            <p className="text-2xl font-black">1,240</p>
                            <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-yellow-400 h-full w-[70%]" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-white text-[#403081] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors">
                                + New Intake Report
                            </button>
                            <button className="w-full py-3 bg-blue-500/30 border border-white/20 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                                Schedule Home Visit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
