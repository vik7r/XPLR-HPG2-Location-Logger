/* -------------------- App.js -------------------- */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Map from "./Map";

// Function to Calculate Distance (Haversine Formula)
const calculateDistance = (loc1, loc2) => {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = loc1.latitude * (Math.PI / 180);
  const lat2 = loc2.latitude * (Math.PI / 180);
  const deltaLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const deltaLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Get backend API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [locations, setLocations] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed || 0
          };

          // Calculate distance only if previousLocation exists
          if (previousLocation) {
            const distance = calculateDistance(previousLocation, newLocation);
            setTotalDistance((prevDistance) => prevDistance + distance);
          }

          setSpeed(position.coords.speed || 0); // Speed in m/s
          setPreviousLocation(newLocation);

          try {
            const response = await axios.post(`${API_URL}/log`, newLocation);
            setLocations((prevLocations) => [response.data.data, ...prevLocations]);
          } catch (error) {
            console.error("❌ Error saving location:", error);
          }
        },
        (error) => console.error("❌ Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, [previousLocation]); // Dependency added for accurate distance tracking

  return (
    <div>
      <h1>🚀 GPS Location Logger</h1>
      <p>📍 Speed: {speed.toFixed(2)} m/s</p>
      <p>📏 Total Distance: {(totalDistance / 1000).toFixed(2)} km</p>
      <Map locations={locations} />
    </div>
  );
}

export default App;
