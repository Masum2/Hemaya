export interface WidgetItem {
    Id: number;
    UserId: number;
    WidgetComponentId: number;
    WidgetOrder: number;
    WidgetType: number;
    IsMyStuff: boolean;
    IsInactive: boolean;
    ModuleId: number;
}

export interface ModuleItem {
    AppUserId: number;
    AppRoleId: number;
    IsPrimary: boolean;
    RoleName: string;
    ModuleName: string;
    Id: number;
    ModuleId: number;
    HasAccess: boolean;
}

export interface ApiResponse {
    Message: string | null;
    Data: {
        AppUserId: number;
        ModuleName: string;
        AppUserName: string;
        AppUserRole: string;
        LoginId: string;
        SelectedModuleId: number;
        UserModules: ModuleItem[];
        UserWidgets: WidgetItem[];
        WidgetComponentList: number[];
        ExtWidgets: WidgetItem[];
        CurrentModule: number;
        SelectedWidgetComponentId: number;
        SelectedWidgetType: number;
    };
}

export interface ToggleStatusPayload {
    widgetId: number;
    activeStatus: boolean;
    appUserId: number;
    selectedModuleId: number | null;
}

export interface RemoveWidgetPayload {
    id: number;
    appUserId: number;
    selectedModuleId: number | null;
}

export interface AssignWidgetPayload {
    widgetComponentId: number;
    widgetType: number;
    isSelected: boolean;
}

export interface AssignAllWidgetsPayload {
    appUserId: number;
    currentModule: number | null;
    selectedModuleId: number | null;
    widgets: AssignWidgetPayload[];
}