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
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.log("Backend failed, attempting mock login...");
            return mockLogin(email, password);
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            if (response.data.success) {
                toast.success(response.data.message);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.log("Backend failed, attempting mock signup...");
            return mockSignup(userData);
        }
    };

    // Mock Authentication Logic
    const mockLogin = (email, password) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const token = "mock-jwt-token-" + Date.now();
            localStorage.setItem('token', token);
            localStorage.setItem('loggedInUser', foundUser.name);
            localStorage.setItem('role', foundUser.role);

            setUser({ name: foundUser.name, role: foundUser.role });
            setIsAuthenticated(true);
            toast.success("Login Successful (Mock Mode)");
            return { success: true, role: foundUser.role };
        } else {
            // Also allow a default admin/ngo login if not found
            if (email === 'admin@aashrey.com' && password === 'admin123') {
                localStorage.setItem('token', 'mock-admin-token');
                localStorage.setItem('loggedInUser', 'Admin User');
                localStorage.setItem('role', 'Admin');
                setUser({ name: 'Admin User', role: 'Admin' });
                setIsAuthenticated(true);
                return { success: true, role: 'Admin' };
            }
            toast.error("Invalid credentials (Mock)");
            return { success: false, message: "Invalid credentials" };
        }
    };

    const mockSignup = (userData) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        // Check duplication
        if (users.find(u => u.email === userData.email)) {
            toast.error("User already exists (Mock)");
            return { success: false, message: "User already exists" };
        }

        const newUser = { ...userData, id: Date.now() };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        toast.success("Account created! User saved locally.");
        return { success: true };
    };

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
