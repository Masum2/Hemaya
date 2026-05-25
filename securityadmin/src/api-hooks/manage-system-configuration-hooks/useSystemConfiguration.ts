// src/hooks/useSystemConfiguration.ts
import { useState, useEffect, useCallback } from 'react';
import { getSystemConfigurations, type ApiConfigItem } from '../../api/manage-system-configuration/SystemConfiguration';

export interface ConfigItem {
    id: number;
    code: number;
    configuration: string;
    status: boolean;
    value: number;
}

const configNameMap: Record<number, string> = {
    257: 'Lock Time For Case Note',
    258: 'Max Intake Decision',
    513: 'Max Case Decision',
    514: 'Open Access to Case',
    769: 'Days Until License Expires',
    1025: 'Multi-Factor Authentication',
    1281: 'Email Notification',
    1282: 'Text Notification',
    1283: 'Audit Logging',
    1537: 'System Security Protocol'
};

export const useSystemConfiguration = () => {
    const [data, setData] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    // ডেটা লোড করার ফাংশন
    const fetchConfigurations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSystemConfigurations();
            if (response && response.Data) {
                const mappedData: ConfigItem[] = response.Data.map((item: ApiConfigItem) => ({
                    id: item.Id,
                    code: item.Code,
                    configuration: configNameMap[item.Code] || `Configuration Profile (${item.Code})`,
                    status: item.IsActive,
                    value: item.Value
                }));
                setData(mappedData);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong while fetching configuration');
        } finally {
            setLoading(false);
        }
    }, []);

    // সিঙ্গেল আইটেম আপডেট করার ফাংশন - Try different HTTP methods
// সিঙ্গেল আইটেম আপডেট করার ফিক্সড ফাংশন - PUT Method
const updateConfiguration = async (updatedItem: ConfigItem) => {
    try {
        // পেজ ফাইল থেকে চেকবক্সের যে কারেন্ট স্ট্যাটাস (true/false) আসছে, 
        // সরাসরি সেটাই পেলোডে পাঠানো হচ্ছে। এক্সট্রা কোনো ইনভার্ট লজিক লাগবে না।
        const payload = {
            id: updatedItem.id,
            code: updatedItem.code,
            value: Number(updatedItem.value),
            isActive: updatedItem.status // সরাসরি ইউজারের সিলেক্ট করা ট্রু/ফলস যাচ্ছে
        };

        // আপডেট এপিআই কল (আপনার সার্ভার অনুযায়ী মেথড PUT বা POST রাখুন, যেহেতু আগেরবার PUT কাজ করেছে)
        const response = await fetch('/api/SecurityAdmin/UpdateConfiguration', {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Update failed with status: ${response.status}`);
        }

        // এপিআই সাকসেস হলে সরাসরি ইউজারের আপডেটেড ডাটা লোকাল স্টেটে বসে যাবে
        setData(prev => prev.map(item => 
            item.id === updatedItem.id ? updatedItem : item
        ));

        alert('Configuration updated successfully!');
        return true;
    } catch (err: any) {
        console.error("Configuration update error:", err);
        alert(`Update failed: ${err.message || 'Unknown error occurred'}`);
        return false;
    }
};
    // Alternative: Update configuration using GET method with query parameters
    const updateConfigurationViaGet = async (updatedItem: ConfigItem) => {
        setUpdating(true);
        try {
            const params = new URLSearchParams({
                id: updatedItem.id.toString(),
                code: updatedItem.code.toString(),
                value: updatedItem.value.toString(),
                isActive: (!updatedItem.status).toString()
            });

            const response = await fetch(`/api/SecurityAdmin/UpdateConfiguration?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Update failed with status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Update successful (GET):", result);
            
            // Update local state
            setData(prev => prev.map(item => 
                item.id === updatedItem.id 
                    ? { ...updatedItem, status: !updatedItem.status }
                    : item
            ));
            
            return true;
        } catch (err: any) {
            console.error("Configuration update error:", err);
            alert(`Update failed: ${err.message || 'Unknown error occurred'}`);
            return false;
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchConfigurations();
    }, [fetchConfigurations]);

    return {
        data,
        loading,
        error,
        updating,
        updateConfiguration,
        updateConfigurationViaGet, // Alternative GET method
        refetch: fetchConfigurations
    };
};