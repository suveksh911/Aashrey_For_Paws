import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const center = {
    lat: 27.7172, 
    lng: 85.3240
};


const MOCK_MARKERS = [
    { id: 1, name: "Buddy", lat: 27.7172, lng: 85.3240, type: "Dog" },
    { id: 2, name: "Misty", lat: 27.6756, lng: 85.3253, type: "Cat" } 
];

const MapComponent = ({ pets }) => {
    const [selectedDetail, setSelectedDetail] = React.useState(null);

    const markers = pets || MOCK_MARKERS; 

    return (
        <LoadScript googleMapsApiKey="YOUR_API_KEY_HERE">
            {}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
            >
                {markers.map(marker => (
                    <Marker
                        key={marker.id || marker._id}
                        position={{ lat: marker.lat || 27.7172, lng: marker.lng || 85.3240 }} 
                        onClick={() => setSelectedDetail(marker)}
                    />
                ))}

                {selectedDetail && (
                    <InfoWindow
                        position={{ lat: selectedDetail.lat || 27.7172, lng: selectedDetail.lng || 85.3240 }}
                        onCloseClick={() => setSelectedDetail(null)}
                    >
                        <div>
                            <h4>{selectedDetail.name}</h4>
                            <p>{selectedDetail.type}</p>
                            <p>{selectedDetail.location}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
}

export default React.memo(MapComponent);
