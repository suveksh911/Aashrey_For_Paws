import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
};

const center = {
    lat: 27.7172, // Kathmandu
    lng: 85.3240
};

const MapComponent = ({ pets = [] }) => {
    const [selectedPet, setSelectedPet] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        // Process pets to assign random locations near Kathmandu for demo purposes
        // In production, this would use actual lat/lng from pet data
        if (pets.length > 0) {
            const processedMarkers = pets.map((pet, index) => {
                // Generate random offsets for demo if no coords exist
                // Kathmandu roughly 27.7, 85.3
                const lat = pet.lat || (27.7172 + (Math.random() - 0.5) * 0.1);
                const lng = pet.lng || (85.3240 + (Math.random() - 0.5) * 0.1);
                return { ...pet, lat, lng };
            });
            setMarkers(processedMarkers);
        }
    }, [pets]);

    return (
        <LoadScript googleMapsApiKey="YOUR_API_KEY_HERE">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
            >
                {markers.map(pet => (
                    <Marker
                        key={pet._id || pet.id}
                        position={{ lat: pet.lat, lng: pet.lng }}
                        onClick={() => setSelectedPet(pet)}
                    />
                ))}

                {selectedPet && (
                    <InfoWindow
                        position={{ lat: selectedPet.lat, lng: selectedPet.lng }}
                        onCloseClick={() => setSelectedPet(null)}
                    >
                        <div className="map-popup-card">
                            <div className="popup-img">
                                <img src={selectedPet.image || selectedPet.images?.[0]} alt={selectedPet.name} />
                            </div>
                            <div className="popup-info">
                                <h4>{selectedPet.name}</h4>
                                <p className="breed">{selectedPet.breed}</p>
                                <p className="status" style={{ color: selectedPet.adoptionStatus === 'Available' ? 'green' : 'red' }}>{selectedPet.adoptionStatus}</p>
                                <Link to={`/pet/${selectedPet._id}`} className="btn-view">View Profile</Link>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
            <style>{`
                .map-popup-card {
                    width: 200px;
                }
                .popup-img img {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .popup-info h4 {
                    margin: 8px 0 4px;
                    font-size: 1rem;
                }
                .popup-info .breed {
                    font-size: 0.85rem;
                    color: #666;
                    margin: 0;
                }
                .popup-info .status {
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin: 4px 0 8px;
                }
                .btn-view {
                    display: block;
                    background: #5d4037;
                    color: white;
                    text-align: center;
                    padding: 5px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-size: 0.85rem;
                }
            `}</style>
        </LoadScript>
    );
};

export default React.memo(MapComponent);
