export interface ApiResponseUser {
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

// ফ্রন্টএন্ডে ব্যবহারের জন্য একটি স্ট্যান্ডার্ড এবং ক্লিন ইন্টারফেস
export interface User {
    id: string | number;
    loginId: string;
    fullName: string;
    lastActiveDate: string;
    roleDescription: string;
    email: string;
    phone: string;
    isActive: boolean;
}