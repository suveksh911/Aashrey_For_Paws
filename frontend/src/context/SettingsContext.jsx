import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/axios';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        platformAddress: '',
        platformPhone: '',
        platformEmail: ''
    });
    const [loaded, setLoaded] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            // Silently fall back to empty strings
        } finally {
            setLoaded(true);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = () => fetchSettings();

    return (
        <SettingsContext.Provider value={{ settings, loaded, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
