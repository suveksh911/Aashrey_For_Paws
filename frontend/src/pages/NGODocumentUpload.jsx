import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';
import api from '../services/axios';

const NGODocumentUpload = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState({
        registrationCert: null,
        panCard: null,
        taxClearance: null
    });
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!files.registrationCert || !files.panCard) {
            toast.error("Registration Certificate and PAN Card are required.");
            return;
        }

        setLoading(true);

        // Simulate API upload
        try {
            // In a real app, uses FormData to send files
            // const formData = new FormData();
            // formData.append('registrationCert', files.registrationCert);
            // ...

            setTimeout(() => {
                toast.success("Documents uploaded successfully!");
                // Update local status for demo
                const user = JSON.parse(localStorage.getItem('user')) || {};
                user.verificationStatus = 'Pending';
                localStorage.setItem('user', JSON.stringify(user));

                navigate('/verification-status');
            }, 1500);

        } catch (error) {
            toast.error("Failed to upload documents.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1 className="mb-4">NGO Verification</h1>
            <p className="mb-4 text-muted">Please upload the following documents to verify your organization. Verified NGOs get a "Verified" badge and more trust from adopters.</p>

            <div className="verification-form-card">
                <form onSubmit={handleSubmit}>

                    <div className="form-group upload-group">
                        <label>1. Registration Certificate *</label>
                        <div className={`file-drop-area ${files.registrationCert ? 'has-file' : ''}`}>
                            <input type="file" onChange={(e) => handleFileChange(e, 'registrationCert')} accept=".pdf,.jpg,.jpeg,.png" />
                            {files.registrationCert ? (
                                <div className="file-info">
                                    <FaFileAlt size={24} color="#28a745" />
                                    <span>{files.registrationCert.name}</span>
                                </div>
                            ) : (
                                <div className="placeholder">
                                    <FaCloudUploadAlt size={30} color="#ccc" />
                                    <span>Click to upload Registration Certificate</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group upload-group">
                        <label>2. PAN Card *</label>
                        <div className={`file-drop-area ${files.panCard ? 'has-file' : ''}`}>
                            <input type="file" onChange={(e) => handleFileChange(e, 'panCard')} accept=".pdf,.jpg,.jpeg,.png" />
                            {files.panCard ? (
                                <div className="file-info">
                                    <FaFileAlt size={24} color="#28a745" />
                                    <span>{files.panCard.name}</span>
                                </div>
                            ) : (
                                <div className="placeholder">
                                    <FaCloudUploadAlt size={30} color="#ccc" />
                                    <span>Click to upload PAN Card</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group upload-group">
                        <label>3. Tax Clearance (Optional)</label>
                        <div className={`file-drop-area ${files.taxClearance ? 'has-file' : ''}`}>
                            <input type="file" onChange={(e) => handleFileChange(e, 'taxClearance')} accept=".pdf,.jpg,.jpeg,.png" />
                            {files.taxClearance ? (
                                <div className="file-info">
                                    <FaFileAlt size={24} color="#28a745" />
                                    <span>{files.taxClearance.name}</span>
                                </div>
                            ) : (
                                <div className="placeholder">
                                    <FaCloudUploadAlt size={30} color="#ccc" />
                                    <span>Click to upload Tax Clearance</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Uploading...' : 'Submit Documents'}
                    </button>
                </form>
            </div>

            <style>{`
                .verification-form-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .upload-group {
                    margin-bottom: 2rem;
                }
                .upload-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #444;
                }
                .file-drop-area {
                    border: 2px dashed #ddd;
                    border-radius: 8px;
                    padding: 1.5rem;
                    position: relative;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fafafa;
                }
                .file-drop-area:hover {
                    border-color: var(--color-primary);
                    background: #f0f8ff;
                }
                .file-drop-area.has-file {
                    border-style: solid;
                    border-color: #28a745;
                    background: #e6f9ed;
                }
                .file-drop-area input {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    opacity: 0;
                    cursor: pointer;
                }
                .placeholder, .file-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    pointer-events: none;
                }
                .file-info span { font-weight: 500; color: #333; }
                .text-muted { color: #666; }
                .btn-block { width: 100%; padding: 12px; font-size: 1.1rem; }
            `}</style>
        </div>
    );
};

export default NGODocumentUpload;
