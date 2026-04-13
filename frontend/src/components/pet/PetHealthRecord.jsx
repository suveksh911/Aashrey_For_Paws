import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSyringe, FaNotesMedical, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import api from '../../services/axios';
import { useAuth } from '../../context/AuthContext';

const PetHealthRecord = ({ pet, petId, ownerId }) => {
    const { id } = useParams();
    const actualPetId = petId || pet?._id || id;
    const actualOwnerId = ownerId || pet?.ownerId?._id || pet?.ownerId;
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [newRecord, setNewRecord] = useState({
        recordType: 'Vaccination',
        date: new Date().toISOString().split('T')[0],
        description: '',
        nextDueDate: ''
    });

    useEffect(() => {
        if (actualPetId) {
            fetchRecords();
        }
    }, [actualPetId]);

    const fetchRecords = async () => {
        try {
            const response = await api.get(`/pets/${actualPetId}/health-records`);
            let apiRecords = response.data.success ? response.data.data : [];
            
            // Merge with local pet data if available
            let localRecords = [];
            if (pet) {
                if (pet.vaccinations && pet.vaccinations.length > 0) {
                    localRecords.push(...pet.vaccinations.map((v, idx) => ({
                        id: `local-v-${idx}`,
                        recordType: 'Vaccination',
                        date: v.date,
                        description: v.name,
                        nextDueDate: v.nextDue
                    })));
                }
                if (pet.medicalHistory && pet.medicalHistory.length > 0) {
                    localRecords.push(...pet.medicalHistory.map((m, idx) => ({
                        id: `local-m-${idx}`,
                        recordType: 'Treatment',
                        date: m.date,
                        description: m.condition + (m.notes ? `: ${m.notes}` : ''),
                    })));
                }
            }

            // Combine and sort by date descending
            const combined = [...apiRecords, ...localRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecords(combined);
        } catch (error) {
            console.error("Failed to fetch health records", error);
            // Fallback to local data only if API fails
            if (pet) {
                let localRecords = [];
                if (pet.vaccinations) {
                    localRecords.push(...pet.vaccinations.map((v, idx) => ({
                        id: `local-v-${idx}`, recordType: 'Vaccination', date: v.date, description: v.name, nextDueDate: v.nextDue
                    })));
                }
                if (pet.medicalHistory) {
                    localRecords.push(...pet.medicalHistory.map((m, idx) => ({
                        id: `local-m-${idx}`, recordType: 'Treatment', date: m.date, description: m.condition + (m.notes ? `: ${m.notes}` : ''),
                    })));
                }
                setRecords(localRecords.sort((a, b) => new Date(b.date) - new Date(a.date)));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            const recordToAdd = {
                ...newRecord,
            };

            const response = await api.post(`/pets/${actualPetId}/health-records`, recordToAdd);
            
            if (response.data.success) {
                setRecords([response.data.data, ...records]);
                toast.success('Health record added successfully!');
                setShowForm(false);
                setNewRecord({
                    recordType: 'Vaccination',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    nextDueDate: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add record');
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;

        try {
            await api.delete(`/pets/${actualPetId}/health-records/${recordId}`);
            setRecords(records.filter(r => r.id !== recordId));
            toast.info('Record deleted');
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    const canEdit = (user?._id && user._id === actualOwnerId) || user?.role === 'Admin';

    if (loading) return <div>Loading health records...</div>;

    return (
        <div className="health-records-container">
            <div className="section-header">
                <h3><FaNotesMedical /> Health & Medical Records</h3>
                {canEdit && (
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '+ Add Record'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleAddRecord} className="health-form">
                    <div className="form-group">
                        <label>Record Type</label>
                        <select
                            value={newRecord.recordType}
                            onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
                        >
                            <option value="Vaccination">Vaccination</option>
                            <option value="Treatment">Medical Treatment</option>
                            <option value="Checkup">Regular Checkup</option>
                            <option value="Surgery">Surgery</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            required
                            value={newRecord.date}
                            onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description / Notes</label>
                        <textarea
                            required
                            rows="2"
                            placeholder="Details about the procedure or vaccine..."
                            value={newRecord.description}
                            onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Next Due Date (Optional)</label>
                        <input
                            type="date"
                            value={newRecord.nextDueDate}
                            onChange={(e) => setNewRecord({ ...newRecord, nextDueDate: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">Save Record</button>
                </form>
            )}

            <div className="records-timeline">
                {records.length === 0 ? (
                    <p className="empty-state">No medical records found.</p>
                ) : (
                    records.map(record => (
                        <div key={record.id} className="timeline-item">
                            <div className="timeline-icon">
                                {record.recordType === 'Vaccination' ? <FaSyringe /> : <FaNotesMedical />}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="record-type">{record.recordType}</span>
                                    <span className="record-date">{record.date}</span>
                                </div>
                                <p className="record-desc">{record.description}</p>
                                {record.nextDueDate && (
                                    <div className="due-date-badge">
                                        <FaCalendarAlt size={12} /> Next Due: {record.nextDueDate}
                                    </div>
                                )}
                            </div>
                            {canEdit && (
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteRecord(record.id)}
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .health-records-container {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border: 1px solid #eee;
                    margin-top: 1rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #f0f0f0;
                    padding-bottom: 1rem;
                }
                .section-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--color-text-dark);
                }
                .health-form {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    border: 1px dashed #ced4da;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #495057;
                    font-size: 0.9rem;
                }
                .form-group input, 
                .form-group select, 
                .form-group textarea {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, 
                .form-group select:focus, 
                .form-group textarea:focus {
                    outline: none;
                    border-color: #8D6E63;
                    box-shadow: 0 0 0 2px rgba(141, 110, 99, 0.2);
                }
                .timeline-item {
                    display: flex;
                    gap: 15px;
                    padding-bottom: 1.5rem;
                    position: relative;
                    border-left: 2px solid #e9ecef;
                    padding-left: 20px;
                    margin-left: 10px;
                }
                .timeline-item:last-child {
                    border-left-color: transparent;
                }
                .timeline-icon {
                    position: absolute;
                    left: -11px;
                    top: 0;
                    width: 24px;
                    height: 24px;
                    background: #fff;
                    border: 2px solid var(--color-primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    font-size: 12px;
                }
                .timeline-content {
                    flex: 1;
                    background: #fff;
                    padding: 10px 15px;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #f1f1f1;
                }
                .timeline-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .record-type {
                    font-weight: 600;
                    color: var(--color-text-dark);
                }
                .record-date {
                    font-size: 0.85rem;
                    color: #6c757d;
                }
                .record-desc {
                    margin: 0;
                    font-size: 0.95rem;
                    color: #495057;
                }
                .due-date-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 8px;
                    padding: 3px 8px;
                    background: #fff3cd;
                    color: #856404;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                .delete-btn {
                    background: none;
                    border: none;
                    color: #dc3545;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                    align-self: flex-start;
                }
                .delete-btn:hover {
                    opacity: 1;
                }
                .empty-state {
                    text-align: center;
                    color: #aaa;
                    font-style: italic;
                    padding: 1rem;
                }
            `}</style>
        </div>
    );
};

export default PetHealthRecord;