export interface AddNewUserPayload {
    appUserData: {
        id: number;
        loginId: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        isTeamMember: boolean;
        isTempPassword: boolean;
    };
    appRoleId: number;
}