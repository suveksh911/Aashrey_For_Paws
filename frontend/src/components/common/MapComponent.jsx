import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center = [27.7172, 85.3240]; // Kathmandu Latitude & Longitude

const MapComponent = ({ pets = [] }) => {
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        // Assign random offsets around Kathmandu for pets without strict coordinates
        if (pets.length > 0) {
            const processedMarkers = pets.map((pet) => {
                const lat = pet.lat || (27.7172 + (Math.random() - 0.5) * 0.1);
                const lng = pet.lng || (85.3240 + (Math.random() - 0.5) * 0.1);
                return { ...pet, lat, lng };
            });
            setMarkers(processedMarkers);
        }
    }, [pets]);

    return (
        <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {markers.map(pet => (
                    <Marker key={pet._id || pet.id} position={[pet.lat, pet.lng]}>
                        <Popup>
                            <div className="map-popup-card" style={{ width: '200px' }}>
                                <div className="popup-img" style={{ marginBottom: '8px' }}>
                                    <img 
                                        src={pet.image || pet.images?.[0] || 'https://placehold.co/600x400/5d4037/FFF?text=Image+Unavailable'} 
                                        alt={pet.name} 
                                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px' }} 
                                    />
                                </div>
                                <div className="popup-info">
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#5d4037' }}>{pet.name}</h4>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#666' }}>{pet.breed}</p>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold', color: pet.adoptionStatus === 'Available' ? 'green' : 'red' }}>
                                        {pet.adoptionStatus}
                                    </p>
                                    <Link 
                                        to={`/pet/${pet._id}`} 
                                        style={{ display: 'block', background: '#5d4037', color: 'white', textAlign: 'center', padding: '6px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default React.memo(MapComponent);
