import { useState, useEffect, useCallback } from 'react';
import { getUserPrivilege, resetUserPrivileges, saveUserPrivileges } from '../../api/user-privileges/getUserPrivileges';


interface ApiPrivilegeItem {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: ApiPrivilegeItem[];
}

interface UserModuleItem {
    AppUserId: number;
    AppRoleId: number;
    IsPrimary: boolean;
    RoleName: string;
    ModuleName: string;
    Id: number;
    ModuleId: number;
    HasAccess: boolean;
}

export const useGetUserPrivilege = (appUserId: number) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<UserModuleItem[]>([]);
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
    const [privileges, setPrivileges] = useState<ApiPrivilegeItem[]>([]);

      const [userInfo, setUserInfo] = useState<{
        name: string;
        loginId: string;
        role: string;
        selRoleId: number
    }>({
        name: "",
        loginId: "",
        role: "",
        selRoleId:0
    });
    // const [userInfo, setUserInfo] = useState({ name: "", loginId: "", role: "", selRoleId: 0 });
console.log("first")
    // এপিআই থেকে ডেটা ফেচ করার ফাংশন
    const fetchModulePrivileges = useCallback(async (userId: number, moduleId: number, isInitialLoad: boolean = false) => {
        setLoading(true);
        try {
            const result = await getUserPrivilege(userId, moduleId);

            if (result && result.Data) {
                const data = result.Data;
                setPrivileges(data.PrivilegeTree || []);

                // if (isInitialLoad) {
                //     setUserInfo({
                //         name: data.SetAppUserName || "N/A",
                //         loginId: `User ID: ${data.SelAppUserId}`,
                //         role: data.UserModules?.find((m: any) => m.IsPrimary)?.RoleName || data.UserModules[0]?.RoleName || "User",
                //         selRoleId: data.SelRoleId || 0
                //     });
                     if (isInitialLoad) {
                    setUserInfo({
                        name: data.AppUserName || "",
                        loginId: data.LoginId || "",
                        role: data.AppUserRole || "",

                        selRoleId: data.SelRoleId || 0
                    });
                    const modulesList = data.UserModules || [];
                    setModules(modulesList);
                    
                    if (modulesList.length > 0) {
                        const defaultModule = modulesList.find((m: any) => m.IsPrimary) || modulesList[0];
                        setSelectedModule(defaultModule.ModuleName);
                        setSelectedModuleId(defaultModule.ModuleId);
                    }
                }
            }
        } catch (err: any) {
            setError(err?.message || "Failed to load database records");
        } finally {
            setLoading(false);
        }
    }, []);

    // ড্রপডাউন চেঞ্জ হ্যান্ডলার
    const handleModuleChange = async (moduleName: string, moduleId: number) => {
        setSelectedModule(moduleName);
        setSelectedModuleId(moduleId);
        await fetchModulePrivileges(appUserId, moduleId, false);
    };

    // চেক/আনচেক টগল লজিক
    const togglePrivilege = (textName: string, parentName?: string) => {
        setPrivileges(prevPrivileges => {
            return prevPrivileges.map(privilege => {
                if (privilege.Text === textName && !parentName) {
                    const newChecked = !privilege.Checked;
                    return {
                        ...privilege,
                        Checked: newChecked,
                        Items: privilege.Items ? privilege.Items.map(item => ({ ...item, Checked: newChecked })) : []
                    };
                }
                
                if (privilege.Items && parentName === privilege.Text) {
                    const updatedItems = privilege.Items.map(item => {
                        if (item.Text === textName) {
                            return { ...item, Checked: !item.Checked };
                        }
                        return item;
                    });
                    
                    const anyChecked = updatedItems.some(item => item.Checked);
                    return { ...privilege, Checked: anyChecked, Items: updatedItems };
                }
                return privilege;
            });
        });
    };

    // অল রিসেট লজিক
  const resetAllPrivileges = async () => {
        setLoading(true);
        try {
            const payload = {
                appUserId: appUserId,
                selRoleId: userInfo.selRoleId,
                userModule: String(selectedModuleId)
            };

            // ১. ব্যাকএন্ড এপিআই রিকোয়েস্ট পাঠানো
            await resetUserPrivileges(payload);

            // ২. লোকাল স্টেট আপডেট করে পুরো ট্রির সব আইটেম Checked (true) করা
            setPrivileges(prevPrivileges => {
                return prevPrivileges.map(privilege => ({
                    ...privilege,
                    Checked: true,
                    Items: privilege.Items ? privilege.Items.map((item: any) => ({ ...item, Checked: true })) : []
                }));
            });

            alert(`All privileges successfully reset and enabled for ${userInfo.name}`);
        } catch (err: any) {
            console.error("Reset Error:", err);
            alert(`Failed to reset privileges: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ডাটাবেজে প্রিভিলেজ সেভ করার কোর লজিক
    const savePrivileges = async () => {
        setLoading(true);
        try {
            const selectedIds: number[] = [];

            // ট্রি ফিল্টার করে শুধুমাত্র Checked চাইল্ড আইডিগুলো অ্যারেতে পুশ করা হচ্ছে
            privileges.forEach(parent => {
                if (parent.Items && parent.Items.length > 0) {
                    parent.Items.forEach(child => {
                        if (child.Checked && child.Id) {
                            const idNum = Number(child.Id);
                            if (!isNaN(idNum)) selectedIds.push(idNum);
                        }
                    });
                } else {
                    if (parent.Checked && parent.Id) {
                        const idNum = Number(parent.Id);
                        if (!isNaN(idNum)) selectedIds.push(idNum);
                    }
                }
            });

            // ব্যাকএন্ডের রিকোয়েস্ট স্কিমা বডি (Payload)
            const payload = {
                selRoleId: userInfo.selRoleId, // ডাটাবেজ থেকে পাওয়া আসল রোল আইডি (যেমন: ৪)
                selAppUserId: appUserId,       // ২
                userModule: String(selectedModuleId), // মডিউল আইডি স্ট্রিং আকারে (যেমন: "1" বা "3")
                selectedPrivileges: selectedIds       // সিলেক্টেড নাম্বারের অ্যারে [159746, 159751]
            };

            console.log("Submitting Payload to Server:", payload);
            
            await saveUserPrivileges(payload);
            alert(`Privileges saved successfully for module: ${selectedModule}`);
        } catch (err: any) {
            console.error("Save privileges failed:", err);
            alert(`Error saving changes: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (appUserId) {
            fetchModulePrivileges(appUserId, 1, true); 
        }
    }, [appUserId, fetchModulePrivileges]);

    return {
        loading,
        error,
        modules,
        selectedModule,
        userInfo,
        privileges,
        handleModuleChange,
        togglePrivilege,
        resetAllPrivileges,
        savePrivileges
    };
};