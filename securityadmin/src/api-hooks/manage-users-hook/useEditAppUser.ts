import { useState } from 'react';
import { toast } from 'react-toastify';
import { editAppUser } from '../../api/manage-users/EditAppUser';
import type { EditAppUserPayload } from '../../types/user-manage-types/EditAppUserTypes';
import type { AxiosError } from 'axios';

interface FormData {
    firstName: string;
    lastName: string;
    roleId: number;
    email: string;
    phone: string;
    loginId: string;
    password: string;
    isActive: boolean;
}

interface ApiErrorResponse {
    errors?: Record<string, string[]>;
    message?: string;
}

interface SubmitResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

export const useEditAppUser = (userId?: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const submitEditUser = async (formData: FormData): Promise<SubmitResult> => {
        setLoading(true);
        setError(null);

        const apiPayload: EditAppUserPayload = {
            appUserData: {
                id: userId ? parseInt(userId, 10) : 0,
                loginId: formData.loginId,
                password: formData.password || "Password123!",
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || "string",
                email: formData.email,
                isTeamMember: formData.isActive,
                isTempPassword: false
            },
            appRoleId: formData.roleId
        };

        try {
            const response = await editAppUser(apiPayload);
            console.log("Edit User API Response:", response.data);
            toast.success("User profile updated successfully!");
            return { success: true, data: response.data };
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            console.error("Error updating user:", error);

            let serverMessage = "Failed to update user profile.";

            if (error.response?.data) {
                const responseData = error.response.data;

                if (typeof responseData === 'string') {
                    serverMessage = responseData;
                } else if (responseData.errors) {
                    serverMessage = Object.values(responseData.errors).flat().join(" | ");
                } else if (responseData.message) {
                    serverMessage = responseData.message;
                }
            }

            setError(serverMessage);
            toast.error(serverMessage);
            return { success: false, error: serverMessage };
        } finally {
            setLoading(false);
        }
    };

    return { submitEditUser, loading, error };
};