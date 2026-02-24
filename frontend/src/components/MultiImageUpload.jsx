import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

/**
 * Reusable component for uploading multiple images with preview.
 * @param {function} onImagesChange - Callback function that receives the array of selected files.
 * @param {number} maxImages - Maximum number of images allowed (default: 5).
 */
const MultiImageUpload = ({ onImagesChange, maxImages = 5 }) => {
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + previews.length > maxImages) {
            alert(`You can only upload a maximum of ${maxImages} images.`);
            return;
        }

        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        const updatedPreviews = [...previews, ...newPreviews];
        setPreviews(updatedPreviews);

        // Pass the actual File objects to the parent
        onImagesChange(updatedPreviews.map(p => p.file));
    };

    const removeImage = (index) => {
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
        onImagesChange(updatedPreviews.map(p => p.file));
    };

    return (
        <div className="multi-image-upload">
            <div className="upload-box">
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-label">
                    <FaCloudUploadAlt size={40} color="var(--color-primary)" />
                    <p>Click to upload images</p>
                    <span>(Max {maxImages} images)</span>
                </label>
            </div>

            {previews.length > 0 && (
                <div className="preview-grid">
                    {previews.map((preview, index) => (
                        <div key={index} className="preview-item">
                            <img src={preview.url} alt={`Preview ${index}`} />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeImage(index)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .multi-image-upload {
                    margin-bottom: 1rem;
                }
                .upload-box {
                    border: 2px dashed #ccc;
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.3s;
                    background: #fafafa;
                }
                .upload-box:hover {
                    border-color: var(--color-primary);
                    background: #f0f8ff;
                }
                .upload-label {
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                .upload-label p {
                    margin: 0;
                    font-weight: 500;
                    color: #555;
                }
                .upload-label span {
                    font-size: 0.8rem;
                    color: #888;
                }
                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: 10px;
                    margin-top: 1rem;
                }
                .preview-item {
                    position: relative;
                    width: 100%;
                    height: 100px;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .preview-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .remove-btn {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 10px;
                }
                .remove-btn:hover {
                    background: red;
                }
            `}</style>
        </div>
    );
};

export default MultiImageUpload;
