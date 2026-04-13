import React from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const LocationPicker = ({ position, setPosition }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const onMapClick = (e) => {
    setPosition([e.latLng.lat(), e.latLng.lng()]);
  };

  if (!isLoaded) return <div className="h-64 mt-4 rounded-xl bg-gray-50 flex items-center justify-center text-xs text-gray-400">Loading Map...</div>;

  const center = position ? { lat: position[0], lng: position[1] } : { lat: 27.7172, lng: 85.324 };

  return (
    <div className="h-64 mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onClick={onMapClick}
      >
        {position && (
          <MarkerF position={{ lat: position[0], lng: position[1] }} />
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationPicker;
