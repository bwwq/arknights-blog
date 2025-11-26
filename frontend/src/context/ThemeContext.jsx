import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// CSS variable names
const CSS_VARIABLES = [
    'bg-black', 'bg-dark', 'bg-panel', 'border-color',
    'accent-primary', 'accent-secondary', 'text-primary', 'text-secondary'
];

// Theme ID to CSS file mapping
const THEME_CSS_MAP = {
    'arknights': '/src/styles/arknights-theme.css', // This one is special, handled by App.jsx import
    'plain': '/themes/plain-theme.css',
    'green': '/themes/green-theme.css',
    'ocean': '/themes/ocean-theme.css',
    'orange': '/themes/orange-theme.css',
    'purple': '/themes/purple-theme.css'
};

// Theme display names
const THEME_NAMES = {
    'arknights': 'Arknights',
    'plain': '素色',
    'green': '护眼绿',
    'ocean': '深海蓝',
    'orange': '暖阳橙',
    'purple': '夜幕紫'
};

// Theme preview colors (accent-primary of each theme)
const THEME_COLORS = {
    'arknights': '#23ADE5',
    'plain': '#d97757',
    'green': '#4a9d5f',
    'ocean': '#58a6ff',
    'orange': '#ff7b54',
    'purple': '#a78bfa'
};

export const ThemeProvider = ({ children }) => {
    const [serverTheme, setServerTheme] = useState('arknights'); // Theme from server
    const [currentTheme, setCurrentTheme] = useState('arknights'); // Locally active theme
    const [customSchemes, setCustomSchemes] = useState({});
    const [loading, setLoading] = useState(true);

    // Load theme configuration from backend
    useEffect(() => {
        loadThemeConfig();
    }, []);

    const loadThemeConfig = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/theme`);
            const { activeTheme: theme, customSchemes: schemes } = response.data;

            const initialTheme = theme || 'arknights';
            setServerTheme(initialTheme);
            setCurrentTheme(initialTheme);
            setCustomSchemes(schemes || {});

            // Apply the theme
            applyTheme(initialTheme, schemes || {});
        } catch (error) {
            console.error('Failed to load theme config:', error);
            // Fallback to default theme
            applyTheme('arknights', {});
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (themeName, schemes = customSchemes) => {
        // Check if it's a preset theme
        if (THEME_CSS_MAP[themeName]) {
            // Load preset theme CSS
            loadPresetTheme(themeName);
        } else if (themeName.startsWith('custom:')) {
            // Apply custom theme colors
            const schemeName = themeName.substring(7);
            const scheme = schemes[schemeName];
            if (scheme) {
                applyCustomColors(scheme);
            }
        }
    };

    const loadPresetTheme = (themeId) => {
        // Remove any existing theme link
        const existingLink = document.getElementById('theme-stylesheet');
        if (existingLink) {
            existingLink.remove();
        }

        // Don't create a link for arknights theme (it's already loaded in App.jsx)
        if (themeId === 'arknights') {
            // Reset any custom color variables
            const root = document.documentElement;
            CSS_VARIABLES.forEach(varName => {
                root.style.removeProperty(`--${varName}`);
            });
            return;
        }

        // Create and append new theme stylesheet
        const link = document.createElement('link');
        link.id = 'theme-stylesheet';
        link.rel = 'stylesheet';
        link.href = THEME_CSS_MAP[themeId];
        document.head.appendChild(link);
    };

    const applyCustomColors = (colors) => {
        const root = document.documentElement;

        // Apply all color variables
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    };

    // Switch theme locally (for all users)
    const switchTheme = (themeName) => {
        setCurrentTheme(themeName);
        applyTheme(themeName);
    };

    // Save current theme as global default (Admin only)
    const saveAsGlobalDefault = async () => {
        try {
            // Send to backend (requires admin auth)
            const response = await axios.put(
                `${config.API_URL}/api/theme/active`,
                { activeTheme: currentTheme },
                {
                    headers: {
                        'x-admin-password': localStorage.getItem('adminPassword')
                    }
                }
            );

            if (response.data.success) {
                setServerTheme(currentTheme);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save global theme:', error);
            throw error;
        }
    };

    const saveCustomScheme = async (name, colors) => {
        try {
            const response = await axios.post(
                `${config.API_URL}/api/theme/scheme`,
                { name, colors },
                {
                    headers: {
                        'x-admin-password': localStorage.getItem('adminPassword')
                    }
                }
            );

            if (response.data.success) {
                // Update local state
                setCustomSchemes(prev => ({
                    ...prev,
                    [name]: colors
                }));
            }

            return response.data;
        } catch (error) {
            console.error('Failed to save scheme:', error);
            throw error;
        }
    };

    const deleteCustomScheme = async (name) => {
        try {
            const response = await axios.delete(
                `${config.API_URL}/api/theme/scheme/${encodeURIComponent(name)}`,
                {
                    headers: {
                        'x-admin-password': localStorage.getItem('adminPassword')
                    }
                }
            );

            if (response.data.success) {
                // Update local state
                setCustomSchemes(prev => {
                    const updated = { ...prev };
                    delete updated[name];
                    return updated;
                });

                // If the deleted scheme was active, reload theme config
                if (currentTheme === `custom:${name}`) {
                    await loadThemeConfig();
                }
            }

            return response.data;
        } catch (error) {
            console.error('Failed to delete scheme:', error);
            throw error;
        }
    };

    const getThemeDisplayName = (themeName) => {
        if (THEME_NAMES[themeName]) {
            return THEME_NAMES[themeName];
        }
        if (themeName.startsWith('custom:')) {
            return themeName.substring(7);
        }
        return themeName;
    };

    const value = {
        activeTheme: currentTheme, // Expose currentTheme as activeTheme for compatibility
        serverTheme,
        customSchemes,
        loading,
        switchTheme,
        saveAsGlobalDefault,
        saveCustomScheme,
        deleteCustomScheme,
        getThemeDisplayName,
        THEME_NAMES,
        THEME_COLORS
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
