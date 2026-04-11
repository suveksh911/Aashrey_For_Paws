import React, { useState, useEffect } from 'react';
import { FaSyringe, FaCheckCircle, FaExclamationTriangle, FaClock, FaPlus, FaTimes, FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/axios';

const STATUS_CONFIG = {
    Upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: <FaClock className="inline mr-1" />, border: 'border-blue-200' },
    'Due Today': { label: 'Due Today', color: 'bg-orange-100 text-orange-700', icon: <FaExclamationCircle className="inline mr-1" />, border: 'border-orange-400' },
    'Due Soon': { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700', icon: <FaExclamationTriangle className="inline mr-1" />, border: 'border-yellow-300' },
    Overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: <FaExclamationTriangle className="inline mr-1" />, border: 'border-red-300' },
    Completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle className="inline mr-1" />, border: 'border-green-200' },
};

function getStatus(nextDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalized today
    
    const due = new Date(nextDateStr);
    due.setHours(0, 0, 0, 0); // Normalized due date
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays <= 7) return 'Due Soon';
    return 'Upcoming';
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const VACCINE_OPTIONS = [
    'Rabies', 'DHPP', 'Bordetella', 'Leptospirosis', 'Canine Influenza',
    'FVRCP', 'FeLV', 'Parvovirus', 'Distemper', 'Hepatitis',
    'Parainfluenza', 'Kennel Cough', 'Lyme Disease', 'Booster'
];

export default function VaccinationReminder({ showAddForm = false }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [pets, setPets] = useState([]);
    const [form, setForm] = useState({ petId: '', petName: '', vaccineName: '', vaccinationDate: '', executionDate: '', notes: '', reminderDays: 3 });
    const [customVaccine, setCustomVaccine] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vacRes, petRes] = await Promise.allSettled([
                api.get('/vaccinations/my-vaccines'),
                api.get('/pets/my-pets'),
            ]);
            if (vacRes.status === 'fulfilled' && vacRes.value.data.success) {
                const enriched = vacRes.value.data.data.map(v => ({
                    ...v,
                    computedStatus: v.status === 'Completed' ? 'Completed' : getStatus(v.nextVaccinationDate),
                }));
                setRecords(enriched);
            }
            if (petRes.status === 'fulfilled' && petRes.value.data.success) {
                setPets(petRes.value.data.data);
            }
        } catch {
            toast.error('Failed to load vaccination reminders');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDone = async (id) => {
        try {
            await api.patch(`/vaccinations/${id}/complete`);
            setRecords(prev => prev.map(r => r._id === id ? { ...r, status: 'Completed', computedStatus: 'Completed' } : r));
            toast.success('Marked as completed!');
        } catch {
            toast.error('Failed to update record');
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!form.petName || !form.vaccineName || !form.vaccinationDate) {
            toast.warn('Please fill all required fields'); return;
        }
        setSubmitting(true);
        try {
            const payload = { ...form };
            if (form.executionDate) {
                payload.executionDate = form.executionDate;
            }
            if (editingId) {
                const res = await api.put(`/vaccinations/${editingId}`, payload);
                if (res.data.success) {
                    const v = res.data.data;
                    setRecords(prev => prev.map(r => r._id === editingId ? { ...v, computedStatus: getStatus(v.nextVaccinationDate) } : r));
                    toast.success('Vaccination updated!');
                    resetFormState();
                }
            } else {
                const res = await api.post('/vaccinations/add', payload);
                if (res.data.success) {
                    const v = res.data.data;
                    setRecords(prev => [{ ...v, computedStatus: getStatus(v.nextVaccinationDate) }, ...prev]);
                    toast.success('Vaccination recorded & schedule generated!');
                    resetFormState();
                }
            }
        } catch {
            toast.error(editingId ? 'Failed to update vaccination' : 'Failed to schedule vaccination');
        } finally {
            setSubmitting(false);
        }
    };

    const resetFormState = () => {
        setForm({ petId: '', petName: '', vaccineName: '', vaccinationDate: '', executionDate: '', notes: '', reminderDays: 3 });
        setCustomVaccine(false);
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        const yyyyMMdd = (dt) => dt ? new Date(dt).toISOString().split('T')[0] : '';
        const isCustom = !VACCINE_OPTIONS.includes(record.vaccineName);
        
        setForm({
            petId: record.petId || '',
            petName: record.petName,
            vaccineName: record.vaccineName,
            vaccinationDate: yyyyMMdd(record.vaccinationDate),
            executionDate: yyyyMMdd(record.nextVaccinationDate),
            notes: record.notes || '',
            reminderDays: record.reminderDays ?? 3
        });
        setCustomVaccine(isCustom);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this reminder?")) return;
        try {
            const res = await api.delete(`/vaccinations/${id}`);
            if (res.data.success) {
                setRecords(prev => prev.filter(r => r._id !== id));
                toast.success('Vaccination deleted');
            }
        } catch {
            toast.error('Failed to delete vaccination');
        }
    };

    const filtered = filter === 'All' ? records : records.filter(r => r.computedStatus === filter);
    const overdueCount = records.filter(r => r.computedStatus === 'Overdue').length;
    const dueTodayCount = records.filter(r => r.computedStatus === 'Due Today').length;
    const dueSoonCount = records.filter(r => r.computedStatus === 'Due Soon').length;

    if (loading) return (
        <div className="flex items-center justify-center py-10 text-gray-400">
            <FaSyringe className="animate-pulse mr-2" size={20} /> Loading vaccination records…
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-[#5D4037] flex items-center gap-2">
                        <FaSyringe /> Vaccination Reminders
                    </h2>
                    {(overdueCount > 0 || dueTodayCount > 0 || dueSoonCount > 0) && (
                        <p className="text-sm font-semibold mt-1">
                            <span className="text-red-600">⚠️ {overdueCount} overdue</span>
                            {dueTodayCount > 0 && <span className="text-orange-600"> · {dueTodayCount} due today</span>}
                            {dueSoonCount > 0 && <span className="text-yellow-600"> · {dueSoonCount} due soon</span>}
                        </p>
                    )}
                </div>
                {showAddForm && (
                    <button
                        onClick={() => {
                            if (showForm) {
                                resetFormState();
                            } else {
                                setShowForm(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-[#8D6E63] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#5D4037] transition-colors"
                    >
                        {showForm ? <FaTimes /> : <FaPlus />}
                        {showForm ? 'Cancel' : 'Schedule Vaccine'}
                    </button>
                )}
            </div>

            {/* Add form */}
            {showForm && (
                <form onSubmit={handleAddSubmit} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Pet Name *</label>
                        <input
                            type="text" placeholder="Enter your pet's name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={form.petName}
                            onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Vaccine Name *</label>
                        <select
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={customVaccine ? 'Other' : form.vaccineName}
                            onChange={e => {
                                if (e.target.value === 'Other') {
                                    setCustomVaccine(true);
                                    setForm(f => ({ ...f, vaccineName: '' }));
                                } else {
                                    setCustomVaccine(false);
                                    setForm(f => ({ ...f, vaccineName: e.target.value }));
                                }
                            }}
                        >
                            <option value="">Select a vaccine</option>
                            {VACCINE_OPTIONS.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                            <option value="Other">Other (type manually)</option>
                        </select>
                        {customVaccine && (
                            <input
                                type="text" placeholder="Enter vaccine name"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                                value={form.vaccineName}
                                onChange={e => setForm(f => ({ ...f, vaccineName: e.target.value }))}
                                autoFocus
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Vaccination Date *</label>
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={form.vaccinationDate}
                            onChange={e => setForm(f => ({ ...f, vaccinationDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Next Due Date <span className="text-xs font-normal text-gray-400">(Optional)</span></label>
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={form.executionDate}
                            onChange={e => setForm(f => ({ ...f, executionDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Remind Me Before</label>
                        <select
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={form.reminderDays}
                            onChange={e => setForm(f => ({ ...f, reminderDays: parseInt(e.target.value) }))}
                        >
                            <option value={1}>1 Day</option>
                            <option value={3}>3 Days</option>
                            <option value={7}>7 Days</option>
                            <option value={14}>14 Days</option>
                            <option value={30}>30 Days</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Notes (Optional)</label>
                        <input
                            type="text" placeholder="e.g. Clinic name, batch no..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8D6E63]"
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        />
                    </div>
                    <div className="flex items-end sm:col-span-2">
                        <button
                            type="submit" disabled={submitting}
                            className="w-full bg-[#8D6E63] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#5D4037] transition-colors disabled:opacity-60"
                        >
                            {submitting ? 'Saving…' : (editingId ? 'Update' : 'Schedule')}
                        </button>
                    </div>
                </form>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['All', 'Overdue', 'Due Today', 'Due Soon', 'Upcoming', 'Completed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === f
                                ? 'bg-[#8D6E63] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f} {f === 'All' ? `(${records.length})` : ''}
                    </button>
                ))}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <FaSyringe size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No vaccination records found.</p>
                    {showAddForm && (
                        <button onClick={() => setShowForm(true)} className="mt-3 text-[#8D6E63] text-sm font-semibold underline">
                            + Schedule one now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map(record => {
                        const cfg = STATUS_CONFIG[record.computedStatus] || STATUS_CONFIG.Upcoming;
                        return (
                            <div
                                key={record._id}
                                className={`bg-white rounded-2xl border-2 ${cfg.border} p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${record.computedStatus === 'Due Today' ? 'animate-pulse-subtle' : ''}`}
                            >
                                {/* Icon circle */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                                    <FaSyringe size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <div>
                                            <p className="font-bold text-[#3E2723] text-sm">{record.petName}</p>
                                            <p className="text-gray-500 text-xs">{record.vaccineName}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                                            {cfg.icon}{cfg.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-2">
                                        <p>💉 Vaccinated: <span className="font-semibold text-gray-700">{formatDate(record.vaccinationDate)}</span></p>
                                        <p>📅 Next Due: <span className={`font-semibold ${cfg.color.split(' ')[1]}`}>{formatDate(record.nextVaccinationDate)}</span></p>
                                        {record.notes && <p className="italic mt-1 border-t border-gray-200 pt-1">Note: {record.notes}</p>}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {record.computedStatus !== 'Completed' && (
                                            <button
                                                onClick={() => handleMarkDone(record._id)}
                                                className="mt-2 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1"
                                            >
                                                <FaCheckCircle size={11} /> Mark Done
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="mt-2 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1"
                                        >
                                            <FaEdit size={11} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record._id)}
                                            className="mt-2 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1"
                                        >
                                            <FaTrash size={11} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
