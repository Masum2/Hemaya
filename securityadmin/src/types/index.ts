// src/types/index.ts

export type UserRole = 'Admin' | 'Editor' | 'User';

export interface User {
    id: string;
    loginId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
}

export interface StatItem {
    label: string;
    value: string;
    icon: React.ElementType; // Lucide আইকনের জন্য সঠিক টাইপ
    color: string;
    bg: string;
}

export interface MenuItem {
    icon: React.ElementType;
    label: string;
    path: string;
}