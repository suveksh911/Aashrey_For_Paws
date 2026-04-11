import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const MultiImageUpload = ({ onImagesChange, maxImages = 5 }) => {
    const fileInputRef = useRef(null);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Combine with existing files and enforce max image limit
        const combinedFiles = [...selectedFiles, ...files].slice(0, maxImages);
        setSelectedFiles(combinedFiles);
        
        // Generate preview URLs
        const urls = combinedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        
        if (onImagesChange) {
            onImagesChange(combinedFiles);
        }
    };

    const removeImage = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        
        const newUrls = [...previewUrls];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
        
        if (onImagesChange) {
            onImagesChange(newFiles);
        }
    };

    return (
        <div style={{ padding: '1.5rem', border: '2px dashed #d6d3d1', borderRadius: '12px', textAlign: 'center', background: '#fafaf9', transition: 'all 0.2s', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()} className="hover:border-[#8D6E63] hover:bg-[#f5f5f4]">
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
            />
            
            <div style={{ padding: '1rem' }}>
                <FaCloudUploadAlt size={45} color="#8D6E63" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '0.75rem', fontWeight: 'bold', color: '#5D4037', fontSize: '1.05rem', margin: '10px 0 2px' }}>
                    Click to browse files
                </p>
                <p style={{ fontSize: '0.85rem', color: '#78716c', margin: 0 }}>
                    Max {maxImages} images (JPEG, PNG, WEBP)
                </p>
            </div>

            {previewUrls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '1.5rem', justifyContent: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e7e5e4' }} onClick={(e) => e.stopPropagation()}>
                    {previewUrls.map((url, i) => (
                        <div key={i} style={{ position: 'relative', width: '85px', height: '85px' }}>
                            <img 
                                src={url} 
                                alt={`preview-${i}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e7e5e4' }} 
                            />
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                style={{
                                    position: 'absolute', top: '-6px', right: '-6px',
                                    background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%',
                                    width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiImageUpload;
