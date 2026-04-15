import axios from 'axios';
import config from '../config/config';

const api = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const isAuthError = error.response?.data?.message?.toLowerCase().includes('token') ||
                                error.response?.data?.message?.toLowerCase().includes('unauthorized');
            if (isAuthError) {
                localStorage.removeItem('token');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
