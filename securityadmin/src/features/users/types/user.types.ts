export interface ApiUser {
    AppRoleId: number;
    Email: string | null;
    Phone: string | null;
    LastActiveDate: string;
    Role: string;
    IsActive: boolean;
    LoginId: string;
    Id: number;
    FirstName: string;
    LastName: string;
    AppUserRoleDesc: string;
    FullName: string;
    FullNameFormatted: string;
    AppUsersDisplayName: string;
}