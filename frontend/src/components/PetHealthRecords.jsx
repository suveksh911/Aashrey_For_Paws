import React, { useEffect, useState } from 'react';
import { FaSyringe, FaNotesMedical, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';

const PetHealthRecords = ({ pet, isEditable = false, onUpdate }) => {


    const vaccinations = pet.vaccinations || [];
    const medicalHistory = pet.medicalHistory || [];

    const handleVaccinationChange = (index, field, value) => {
        if (!onUpdate) return;
        const newVac = [...vaccinations];
        newVac[index] = { ...newVac[index], [field]: value };
        onUpdate('vaccinations', newVac);
    };

    const addVaccination = () => {
        if (!onUpdate) return;
        onUpdate('vaccinations', [...vaccinations, { name: '', date: '', nextDue: '' }]);
    };

    const removeVaccination = (index) => {
        if (!onUpdate) return;
        onUpdate('vaccinations', vaccinations.filter((_, i) => i !== index));
    };

    const handleHistoryChange = (index, field, value) => {
        if (!onUpdate) return;
        const newHist = [...medicalHistory];
        newHist[index] = { ...newHist[index], [field]: value };
        onUpdate('medicalHistory', newHist);
    };

    const addHistory = () => {
        if (!onUpdate) return;
        onUpdate('medicalHistory', [...medicalHistory, { condition: '', date: '', notes: '' }]);
    };

    const removeHistory = (index) => {
        if (!onUpdate) return;
        onUpdate('medicalHistory', medicalHistory.filter((_, i) => i !== index));
    };

    return (
        <div className="pet-health-records" style={{ marginTop: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#5d4037' }}>
                <FaNotesMedical /> Health & Medical Records
            </h2>

            <div className="health-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '1.5rem' }}>

                {}
                <div className="vaccination-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                            <FaSyringe /> Vaccination History
                        </h3>
                        {isEditable && (
                            <button type="button" onClick={addVaccination} className="btn-add">
                                <FaPlus /> Add
                            </button>
                        )}
                    </div>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Vaccine</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Administered Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: '#d9534f' }}>Next Due</th>
                                    {isEditable && <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(vaccinations.length > 0 ? vaccinations : [
                                   
                                    { name: 'Rabies', date: '2023-01-15', nextDue: '2024-01-15' },
                                    { name: 'Distemper', date: '2023-06-10', nextDue: '2024-06-10' },
                                    { name: 'Parvovirus', date: '2023-02-20', nextDue: '2023-08-20' }
                                ]).map((vac, index) => {
                                    const today = new Date();
                                    const dueDate = new Date(vac.nextDue);
                                    const diffTime = dueDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    let statusBadge = null;
                                    if (!isEditable) {
                                        if (diffDays < 0) {
                                            statusBadge = <span className="health-badge overdue">Overdue</span>;
                                        } else if (diffDays <= 30) {
                                            statusBadge = <span className="health-badge upcoming">Due Soon</span>;
                                        }
                                    }

                                    return (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>
                                                {isEditable ?
                                                    <input type="text" value={vac.name} onChange={(e) => handleVaccinationChange(index, 'name', e.target.value)} className="table-input" placeholder="Name" /> :
                                                    vac.name}
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                {isEditable ?
                                                    <input type="date" value={vac.date} onChange={(e) => handleVaccinationChange(index, 'date', e.target.value)} className="table-input" /> :
                                                    vac.date}
                                            </td>
                                            <td style={{ padding: '10px', fontWeight: !isEditable ? 'bold' : 'normal', color: !isEditable ? '#5d4037' : 'inherit' }}>
                                                {isEditable ?
                                                    <input type="date" value={vac.nextDue} onChange={(e) => handleVaccinationChange(index, 'nextDue', e.target.value)} className="table-input" /> :
                                                    <>
                                                        {vac.nextDue} {statusBadge}
                                                    </>
                                                }
                                            </td>
                                            {isEditable && (
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    <button type="button" onClick={() => removeVaccination(index)} className="btn-delete">
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <style>{`
                        .health-badge {
                            font-size: 0.75rem;
                            padding: 2px 6px;
                            border-radius: 4px;
                            margin-left: 8px;
                            color: white;
                        }
                        .health-badge.overdue { background-color: #dc3545; }
                        .health-badge.upcoming { background-color: #ffc107; color: #856404; }
                    `}</style>
                </div>

                {}
                <div className="medical-history-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
                            <FaCalendarAlt /> Medical History
                        </h3>
                        {isEditable && (
                            <button type="button" onClick={addHistory} className="btn-add">
                                <FaPlus /> Add
                            </button>
                        )}
                    </div>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Condition</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Notes</th>
                                    {isEditable && <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {medicalHistory.length === 0 && (
                                    <tr><td colSpan={isEditable ? 4 : 3} style={{ padding: '10px', textAlign: 'center', color: '#999' }}>No medical history.</td></tr>
                                )}
                                {medicalHistory.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            {isEditable ?
                                                <input type="text" value={item.condition} onChange={(e) => handleHistoryChange(index, 'condition', e.target.value)} className="table-input" placeholder="Condition" /> :
                                                item.condition}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {isEditable ?
                                                <input type="date" value={item.date} onChange={(e) => handleHistoryChange(index, 'date', e.target.value)} className="table-input" /> :
                                                item.date}
                                        </td>
                                        <td style={{ padding: '10px', color: '#666' }}>
                                            {isEditable ?
                                                <input type="text" value={item.notes} onChange={(e) => handleHistoryChange(index, 'notes', e.target.value)} className="table-input" placeholder="Notes" /> :
                                                item.notes}
                                        </td>
                                        {isEditable && (
                                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                                <button type="button" onClick={() => removeHistory(index)} className="btn-delete">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <style>{`
                 @media (min-width: 900px) {
                    .health-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .btn-add {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.85rem;
                }
                .btn-delete {
                    background: none;
                    border: none;
                    color: #dc3545;
                    cursor: pointer;
                }
                .table-input {
                    padding: 6px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    width: 100%;
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
};

export default PetHealthRecords;
