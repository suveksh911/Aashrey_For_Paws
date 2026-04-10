import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const triggerReminders = async () => {
        try {
            await api.post('/vaccinations/check-reminders');
        } catch (err) {
            console.warn("Reminder check failed (silent background task)", err);
        }
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/users/me');
            if (res.data.success) {
                const fullUser = res.data.data;
                setUser(fullUser);
                localStorage.setItem('loggedInUser', fullUser.name);
                localStorage.setItem('email', fullUser.email);
                setIsAuthenticated(true);
            }
        } catch (err) {
            console.error("Failed to refresh user profile", err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('email');
        const _id = localStorage.getItem('_id');

        if (token) {
            // Set basic info first from LS
            if (loggedInUser) {
                setUser({ name: loggedInUser, role, email, _id });
                setIsAuthenticated(true);
            }
            // Then fetch full profile for details & image
            refreshUser();
            triggerReminders();
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { name, role, token, _id } = response.data.data;
                const { message } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('role', role);
                localStorage.setItem('email', email);
                if (_id) localStorage.setItem('_id', _id);

                setUser({ name, role, email, _id });
                setIsAuthenticated(true);
                triggerReminders();
                toast.success(message || 'Login Successful');
                return { success: true, role };
            } else {
                toast.error(response.data.message || 'Login failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Network error: Backend is unreachable';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            if (response.data.success) {
                toast.success(response.data.message);
                return { success: true };
            } else {
                toast.error(response.data.message || 'Signup failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Network error: Backend is unreachable';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };


    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('_id');
        setUser(null);
        setIsAuthenticated(false);
        toast.info('Logged out successfully');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
