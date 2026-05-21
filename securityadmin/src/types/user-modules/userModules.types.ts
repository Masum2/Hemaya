export interface GridDataItem {
    AppUserId: number;
    AppRoleId: number;
    IsPrimary: boolean;
    RoleName: string | null;
    ModuleName: string;
    Id: number;
    ModuleId: number;
    HasAccess: boolean;
}

export interface ApiResponse {
    Message: string | null;
    Data: {
        UserId: number;
        GridData: GridDataItem[];
        AppUserName: string;
        LoginId: string;
        AppUserRole: string;
    };
}

export interface RoleOption {
    Id: number;
    Description: string;
}

export interface EditRoleApiResponse {
    Message: string | null;
    Data: {
        Message: string;
        UserModule: {
            AppUserId: number;
            AppRoleId: number;
            Id: number;
            ModuleId: number;
            HasAccess: boolean;
        };
        ModuleName: string;
        Roles: RoleOption[];
    };
}

export interface EditAccessApiResponse {
    Message: string | null;
    Data: {
        RemoveUserModule: {
            AppUserId: number;
            ModuleId: number;
            AccessType: number;
        };
        ModuleName: string;
    };
}

export interface RemoveUserModulePayload {
    AppUserId: number;
    ModuleId: number;
    AccessType: number;
}

export interface SaveModuleRolePayload {
    AppUserId: number;
    ModuleId: number;
    AppRoleId: number;
    HasAccess: boolean;
}

export interface EditModuleRoleQuery {
    moduleId: number;
}

export interface EditModuleAccessQuery {
    userId: number;
    moduleId: number;
    hasAccess: boolean;
}