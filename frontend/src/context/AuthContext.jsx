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


    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedInUser = localStorage.getItem('loggedInUser');
        const role = localStorage.getItem('role');

        if (token && loggedInUser) {
            setUser({ name: loggedInUser, role: role });
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { jwtToken, name, role, message } = response.data;
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('role', role);

                setUser({ name, role });
                setIsAuthenticated(true);
                toast.success(message);
                return { success: true, role };
            } else {
                toast.error(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
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
                toast.error(response.data.message);
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Signup Error Details:", error);
            let msg = 'Signup failed';
            if (error.code === 'ERR_NETWORK') {
                msg = 'Network Error: Backend server is not running or unreachable.';
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            } else if (error.message) {
                msg = error.message;
            }
            toast.error(msg);
            return { success: false, message: msg };
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('role');
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
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
