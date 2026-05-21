import { useState } from 'react';
import { toast } from 'react-toastify';
import { addNewUser } from '../../api/manage-users/AddNewUser';
import type { AddNewUserPayload } from '../../types/user-manage-types/AddUserTypes';
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

export const useAddNewUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const submitNewUser = async (formData: FormData): Promise<SubmitResult> => {
        setLoading(true);
        setError(null);

        const apiPayload: AddNewUserPayload = {
            appUserData: {
                id: 0,
                loginId: formData.loginId,
                password: formData.password || "Password123!",
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || "string",
                email: formData.email,
                isTeamMember: formData.isActive,
                isTempPassword: true
            },
            appRoleId: formData.roleId
        };

        try {
            const response = await addNewUser(apiPayload);
            console.log("Add New User API Response:", response.data);
            toast.success("New user created successfully!");
            return { success: true, data: response.data };
        } catch (err) {
            const error = err as AxiosError<ApiErrorResponse>;
            console.error("Error creating user:", error);

            let serverMessage = "Failed to create new user.";

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

    return { submitNewUser, loading, error };
};