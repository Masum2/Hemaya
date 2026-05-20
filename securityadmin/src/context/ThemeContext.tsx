import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setBrandColor: (color: string) => void;
    setFontFamily: (font: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(
        (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // ডাইনামিক কালার চেঞ্জার
    const setBrandColor = (color: string) => {
        document.documentElement.style.setProperty('--primary-brand', color);
    };

    // ডাইনামিক ফন্ট চেঞ্জার
    const setFontFamily = (font: string) => {
        document.documentElement.style.setProperty('--font-family', font);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setBrandColor, setFontFamily }}>
            <div className="font-dynamic min-h-screen">
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};