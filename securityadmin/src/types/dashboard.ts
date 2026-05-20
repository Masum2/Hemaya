// src/types/dashboard.ts
export interface ChildStat {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    trend: string;
    trendUp: boolean;
}