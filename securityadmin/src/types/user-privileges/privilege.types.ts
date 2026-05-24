export interface ApiPrivilegeItem {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: ApiPrivilegeItem[];
}

export interface UserModuleItem {
    AppUserId: number;
    AppRoleId: number;
    IsPrimary: boolean;
    RoleName: string;
    ModuleName: string;
    Id: number;
    ModuleId: number;
    HasAccess: boolean;
}

export interface ApiResponseData {
    SelRoleId: number;
    SelAppUserId: number;
    SetAppUserName: string;
    UserModule: string;
    UserModules: UserModuleItem[];
    PrivilegeTree: ApiPrivilegeItem[];
}

export interface ApiResponse {
    Message: string | null;
    Data: ApiResponseData;
}