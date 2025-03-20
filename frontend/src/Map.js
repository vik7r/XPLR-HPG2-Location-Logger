// Updated Map.js for live tracking, speed, and distance
import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px"
};

const center = {
  lat: 28.6139,
  lng: 77.2090
};

const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0; 
  const R = 6371e3;
  const lat1 = loc1.latitude * (Math.PI / 180);
  const lat2 = loc2.latitude * (Math.PI / 180);
  const deltaLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const deltaLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

function MapComponent() {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [previousTimestamp, setPreviousTimestamp] = useState(Date.now());

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        console.log("Previous Location:", previousLocation);
        console.log("Current Location:", newLocation);

        if (previousLocation) {
          const dist = calculateDistance(previousLocation, newLocation);
          setDistance((prev) => prev + dist / 1000); // Convert to km
          
          const timeDiff = (Date.now() - previousTimestamp) / 1000; 
          const calculatedSpeed = dist / timeDiff;
          setSpeed(calculatedSpeed.toFixed(2)); 
        }

        setPreviousLocation(newLocation);
        setPreviousTimestamp(Date.now());
        setLocation(newLocation);
        setPath((prevPath) => [...prevPath, { lat: newLocation.latitude, lng: newLocation.longitude }]);
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [previousLocation, previousTimestamp]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCV9FysfrhVUzBQb4CJCZ-kBEYYcIBmEYw">
      <GoogleMap mapContainerStyle={containerStyle} center={location || center} zoom={15}>
        {location && <Marker position={{ lat: location.latitude, lng: location.longitude }} />}
        <Polyline path={path} options={{ strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 2 }} />
      </GoogleMap>
      <div>
        <p>Speed: {speed} m/s</p>
        <p>Distance Traveled: {distance.toFixed(2)} km</p>
      </div>
    </LoadScript>
  );
}

export default MapComponent;
