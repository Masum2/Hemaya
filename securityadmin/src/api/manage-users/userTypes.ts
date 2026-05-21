// User/AppUser interface
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

// API Response 
export interface ApiResponse<T> {
    Data?: T;
    data?: T;
    appUserData?: T;
    result?: T;
    message?: string;
    errors?: Record<string, string[]>;
    success?: boolean;
}

// System Role Type
export interface SystemRole {
    id: number;
    name: string;
    category: 'CW' | 'FP' | 'FC' | 'RMH';
    label: string;
}

// Form Data State
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

// Backend User Type 
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

// API Payload for Add/Edit
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

// Get User List Response Type
export interface GetUserListResponse {
    data?: BackendUser[];
    Data?: BackendUser[];
    users?: BackendUser[];
}

// Query Options Type
export interface QueryOptions {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retry?: number;
}

// Error Response Type
export interface ErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
    status?: number;
}