import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from localStorage on mount
        const storedPassword = localStorage.getItem('admin_password');
        if (storedPassword) {
            setAdminPassword(storedPassword);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (password) => {
        setAdminPassword(password);
        setIsAuthenticated(true);
        localStorage.setItem('admin_password', password);
    };

    const logout = () => {
        setAdminPassword('');
        setIsAuthenticated(false);
        localStorage.removeItem('admin_password');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, adminPassword, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
