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

// Function to calculate distance using Haversine formula
const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0; 
  const R = 6371e3; // Radius of Earth in meters
  const lat1 = loc1.latitude * (Math.PI / 180);
  const lat2 = loc2.latitude * (Math.PI / 180);
  const deltaLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const deltaLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

function MapComponent() {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [previousTimestamp, setPreviousTimestamp] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        console.log("Previous Location:", previousLocation);
        console.log("Current Location:", newLocation);

        if (previousLocation && previousTimestamp) {
          const dist = calculateDistance(previousLocation, newLocation);
          setDistance((prev) => prev + dist / 1000); // Convert to km

          const timeDiff = (position.timestamp - previousTimestamp) / 1000; // Time in seconds
          if (timeDiff > 0) {
            const calculatedSpeed = dist / timeDiff;
            setSpeed(calculatedSpeed.toFixed(2)); // Speed in m/s
          }
        }

        setPreviousLocation(newLocation);
        setPreviousTimestamp(position.timestamp);
        setLocation(newLocation);
        setPath((prevPath) => [...prevPath, { lat: newLocation.latitude, lng: newLocation.longitude }]);
      },
      (error) => console.error("Geolocation Error:", error),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCV9FysfrhVUzBQb4CJCZ-kBEYYcIBmEYw">
      <GoogleMap mapContainerStyle={containerStyle} center={location || center} zoom={15}>
        {location && <Marker position={{ lat: location.latitude, lng: location.longitude }} />}
        <Polyline path={path} options={{ strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 2 }} />
      </GoogleMap>
      <div>
        <p><strong>Speed:</strong> {speed} m/s</p>
        <p><strong>Distance Traveled:</strong> {distance.toFixed(2)} km</p>
      </div>
    </LoadScript>
  );
}

export default MapComponent;
