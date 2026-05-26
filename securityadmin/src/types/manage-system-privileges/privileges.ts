// Role Enum matching your C# backend
export const Roles = {
    None: 0,
    SuperAdmin: 1,
    Admin: 2,
    Director: 3,
    Supervisor: 4,
    IntakeSocialWorker: 5,
    CaseInvestigator: 6,
    ICWTSocialWorker: 8,
    ICWTSupervisor: 9,
    FPSupervisor: 10,
    FPSocialWorker: 11,
    Manager: 91,
    FCSocialWorker: 21,
    FCSupervisor: 22,
    FCProgramManager: 23,
    RMHSocialWorker: 31,
    RMHSupervisor: 32,
} as const;

// এনামের মতো টাইপ পাওয়ার জন্য এই লাইনটি যোগ করুন
export type Roles = typeof Roles[keyof typeof Roles];

export interface PrivilegeItem {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: PrivilegeItem[];
}

export interface PrivilegeTree {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: PrivilegeItem[];
}

export interface ManageSystemPrivilegesResponse {
    Message: string | null;
    Data: {
        AppRoleId: number;
        SelRoleId: number;
        PrivilegeTree: PrivilegeTree[];
    };
}

export interface SavePrivilegesPayload {
    selectedRoleId: number;
    selectedPrivileges: number[];
}

export interface RoleOption {
    value: Roles;
    label: string;
    category: string;
}