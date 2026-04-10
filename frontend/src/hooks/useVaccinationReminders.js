import { useEffect, useRef } from 'react';
import api from '../services/axios';
import { useAuth } from '../context/AuthContext';

const useVaccinationReminders = () => {
    const { user } = useAuth();
    const checkedRef = useRef(false);

    useEffect(() => {
        if (!user || checkedRef.current) return;

        const checkReminders = async () => {
            checkedRef.current = true;
            try {
                // Fetch user's vaccinations
                const vacRes = await api.get('/vaccinations/my-vaccines');
                if (vacRes.data.success) {
                    const vaccinations = vacRes.data.data;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    for (const vac of vaccinations) {
                        // Skip if already completed or notified
                        if (vac.status === 'Completed' || vac.isNotified) continue;

                        const dueDate = new Date(vac.nextVaccinationDate);
                        dueDate.setHours(0, 0, 0, 0);

                        const diffTime = dueDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        // Check if due within next 2 days (0 = today, 1 = tomorrow, 2 = 2 days from now)
                        // Also handle overdue vaccines (diffDays < 0) just in case, but prompt mentioned 0, 1, 2
                        if (diffDays >= 0 && diffDays <= 2) {
                            const isHighPriority = diffDays <= 1; // within 24 hours
                            const type = isHighPriority ? 'alert' : 'info';
                            const formattedDate = new Date(vac.nextVaccinationDate).toLocaleDateString();
                            
                            // Format strictly per instructions:
                            const message = `Reminder: Your pet '${vac.petName}' is due for the '${vac.vaccineName}' vaccination on ${formattedDate}.`;

                            // Create notification via API
                            await api.post('/notifications', {
                                type,
                                message,
                                link: '/user?tab=vaccines'
                            });

                            // Mark as notified in DB to prevent duplicates
                            await api.patch(`/vaccinations/${vac._id}/notified`);
                        }
                    }
                }
            } catch (err) {
                console.error("Error creating vaccination reminders on frontend:", err);
            }
        };

        checkReminders();
    }, [user]);
};

export default useVaccinationReminders;
