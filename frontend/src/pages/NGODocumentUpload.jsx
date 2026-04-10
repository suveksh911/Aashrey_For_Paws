import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBuilding, FaPhone, FaMapMarkerAlt, FaFileAlt, FaIdCard } from 'react-icons/fa';
import api from '../services/axios';

const NGODocumentUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        orgName: '',
        phone: '',
        registrationNo: '',
        address: '',
        mission: '',
        email: '',
        documentImage: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be under 5 MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            setFormData(prev => ({ ...prev, documentImage: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.orgName || !formData.phone || !formData.registrationNo || !formData.address) {
            toast.error('Please fill all required fields.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/ngo/upload-documents', formData);
            toast.success('Verification application submitted! Our admin team will review within 24–48 hours.');
            navigate('/verification-status');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { icon: <FaBuilding />, label: 'Organisation Name', name: 'orgName', type: 'text', required: true, placeholder: 'e.g. Animal Rescue Nepal' },
        { icon: <FaIdCard />, label: 'Registration Number', name: 'registrationNo', type: 'text', required: true, placeholder: 'Government registration number' },
        { icon: <FaPhone />, label: 'Contact Phone', name: 'phone', type: 'tel', required: true, placeholder: '+977 98XXXXXXXX' },
        { icon: <FaMapMarkerAlt />, label: 'Address', name: 'address', type: 'text', required: true, placeholder: 'City, District, Nepal' },
        { icon: <FaFileAlt />, label: 'Email', name: 'email', type: 'email', required: false, placeholder: 'ngo@example.com' },
    ];

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '700px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>NGO Verification</h1>
                <p style={{ color: '#888', lineHeight: '1.6' }}>
                    Fill in your organization details to apply for verification. Verified NGOs receive a
                    <strong> "Verified" badge</strong>, gaining more trust from potential adopters and donors.
                    Our admin team will review your application within <strong>24–48 hours</strong>.
                </p>
            </div>

            <div className="verification-form-card">
                <form onSubmit={handleSubmit}>
                    {fields.map(field => (
                        <div className="form-group field-group" key={field.name}>
                            <label>
                                <span className="field-icon">{field.icon}</span>
                                {field.label} {field.required && <span style={{ color: '#dc3545' }}>*</span>}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                required={field.required}
                            />
                        </div>
                    ))}

                    <div className="form-group field-group">
                        <label>
                            <span className="field-icon"><FaFileAlt /></span>
                            Mission Statement <span style={{ color: '#888', fontWeight: '400', fontSize: '0.85rem' }}>(optional)</span>
                        </label>
                        <textarea
                            name="mission"
                            value={formData.mission}
                            onChange={handleChange}
                            placeholder="Describe your organization's mission and how you help animals..."
                            rows="4"
                        />
                    </div>

                    <div className="form-group field-group">
                        <label>
                            <span className="field-icon"><FaIdCard /></span>
                            Registration Document Upload <span style={{ color: '#888', fontWeight: '400', fontSize: '0.85rem' }}>(optional)</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ padding: '0.5rem', background: '#f8f9fa' }}
                        />
                        {formData.documentImage && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <img src={formData.documentImage} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ background: '#fff3cd', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#856404' }}>
                        ℹ️ By submitting this form, you confirm that the information provided is accurate and that your organisation is a legitimate animal welfare entity registered in Nepal.
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}
                        style={{ width: '100%', padding: '12px', fontSize: '1.05rem', fontWeight: '600' }}>
                        {loading ? '⏳ Submitting Application...' : '✅ Submit for Verification'}
                    </button>
                </form>
            </div>

            <style>{`
                .verification-form-card { background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                .field-group { margin-bottom: 1.5rem; }
                .field-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 0.45rem; color: #444; font-size: 0.95rem; }
                .field-icon { color: #8D6E63; }
                .field-group input, .field-group textarea {
                    width: 100%; padding: 0.7rem 0.9rem;
                    border: 1px solid #ddd; border-radius: 8px;
                    font-size: 0.97rem; box-sizing: border-box;
                    transition: border-color 0.2s; font-family: inherit;
                }
                .field-group input:focus, .field-group textarea:focus { outline: none; border-color: #8D6E63; box-shadow: 0 0 0 3px rgba(141,110,99,0.15); }
                .field-group textarea { resize: vertical; }
            `}</style>
        </div>
    );
};

export default NGODocumentUpload;
