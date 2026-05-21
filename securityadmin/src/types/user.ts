export interface AppUser {
    Id?: string | number;
    id?: string | number;
    LoginId?: string;
    loginId?: string;
    FullNameFormatted?: string;
    fullNameFormatted?: string;
    LastActiveDate?: string;
    lastActiveDate?: string;
    Role?: string;
    role?: string;
    AppUserRoleDesc?: string;
    appUserRoleDesc?: string;
    Email?: string;
    email?: string;
    Phone?: string;
    phone?: string;
    IsActive?: boolean;
    isActive?: boolean;
}

// এপিআই রেসপন্সের বিভিন্ন সম্ভাব্য ফরম্যাটের জন্য একটি জেনেরিক টাইপ
export interface ApiResponse<T> {
    Data?: T;
    data?: T;
    appUserData?: T;
    result?: T;
}

export interface SystemRole {
    id: number;
    name: string;
    category: 'CW' | 'FP' | 'FC' | 'RMH';
    label: string;
}

export interface FormDataState {
    firstName: string;
    lastName: string;
    roleId: number;
    email: string;
    phone: string;
    loginId: string;
    password?: string;
    isActive: boolean;
}

export interface BackendUser {
    Id?: number | string;
    id?: number | string;
    FirstName?: string;
    firstName?: string;
    LastName?: string;
    lastName?: string;
    AppRoleId?: number | string;
    appRoleId?: number | string;
    Email?: string;
    email?: string;
    Phone?: string;
    phone?: string;
    LoginId?: string;
    loginId?: string;
    IsActive?: boolean;
    isActive?: boolean;
}

export interface ApiResponse<T> {
    Data?: T;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface ApiPayload {
    appUserData: {
        id: number;
        loginId: string;
        password?: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        isTeamMember: boolean;
        isTempPassword: boolean;
    };
    appRoleId: number;
}