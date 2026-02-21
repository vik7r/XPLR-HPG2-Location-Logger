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

// Connect to XPLR HPG2 device and parse coordinates
const connectToXPLRHPG2 = (setDeviceLocation, setDeviceStatus, setDeviceAccuracy) => {
  // Try to connect to XPLR HPG2 via WebSocket or Serial API
  if (navigator.serial) {
    // Using Web Serial API for direct device connection
    navigator.serial.getPorts().then(async (ports) => {
      if (ports.length === 0) {
        setDeviceStatus("No XPLR HPG2 device found. Ensure it's connected.");
        return;
      }
      
      const port = ports[0];
      await port.open({ baudRate: 115200 });
      setDeviceStatus("Connected to XPLR HPG2");
      
      const reader = port.readable.getReader();
      
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const data = new TextDecoder().decode(value);
          parseXPLRCoordinates(data, setDeviceLocation, setDeviceAccuracy);
        }
      } catch (error) {
        console.error("Device reading error:", error);
        setDeviceStatus("Error reading from XPLR HPG2");
      }
    });
  } else {
    // Fallback: simulate XPLR HPG2 data or use geolocation
    setDeviceStatus("Web Serial API not available. Using simulated XPLR data.");
  }
};

// Parse XPLR HPG2 NMEA sentence data
const parseXPLRCoordinates = (data, setDeviceLocation, setDeviceAccuracy) => {
  const lines = data.split("\n");
  
  lines.forEach((line) => {
    // Parse GGA sentence (Position and fix data)
    if (line.startsWith("$GPGGA") || line.startsWith("$GNGGA")) {
      const parts = line.split(",");
      if (parts.length >= 7 && parts[2] && parts[4]) {
        const lat = parseFloat(parts[2]) / 100;
        const latDir = parts[3];
        const lng = parseFloat(parts[4]) / 100;
        const lngDir = parts[5];
        const fixQuality = parseInt(parts[6]);
        const satCount = parseInt(parts[7]) || 0;
        
        const latitude = (latDir === "S") ? -lat : lat;
        const longitude = (lngDir === "W") ? -lng : lng;
        
        setDeviceLocation({
          latitude,
          longitude,
          accuracy: calculateAccuracyFromSats(satCount, fixQuality)
        });
        
        setDeviceAccuracy(satCount);
      }
    }
  });
};

// Calculate accuracy based on satellite count
const calculateAccuracyFromSats = (satCount, fixQuality) => {
  const qualityFactors = {
    0: "No fix",
    1: "GPS fix",
    2: "DGPS fix",
    3: "PPS fix",
    4: "RTK fixed",
    5: "RTK float"
  };
  return qualityFactors[fixQuality] || "Unknown";
};

function App() {
  const [locations, setLocations] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [useXPLR, setUseXPLR] = useState(false);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState("Disconnected");
  const [deviceAccuracy, setDeviceAccuracy] = useState(0);

  // Toggle between geolocation and XPLR HPG2
  useEffect(() => {
    if (useXPLR) {
      connectToXPLRHPG2(setDeviceLocation, setDeviceStatus, setDeviceAccuracy);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          async (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed || 0,
              accuracy: position.coords.accuracy
            };

            if (previousLocation) {
              const distance = calculateDistance(previousLocation, newLocation);
              setTotalDistance((prevDistance) => prevDistance + distance);
            }

            setSpeed(position.coords.speed || 0);
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
    }
  }, [useXPLR, previousLocation]);

  // Handle XPLR device location updates
  useEffect(() => {
    if (useXPLR && deviceLocation) {
      if (previousLocation) {
        const distance = calculateDistance(previousLocation, deviceLocation);
        setTotalDistance((prevDistance) => prevDistance + distance);
      }

      setPreviousLocation(deviceLocation);

      try {
        axios.post(`${API_URL}/log`, {
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
          accuracy: deviceLocation.accuracy,
          source: "XPLR HPG2"
        });
        setLocations((prevLocations) => [deviceLocation, ...prevLocations]);
      } catch (error) {
        console.error("❌ Error saving XPLR location:", error);
      }
    }
  }, [deviceLocation, useXPLR]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-3xl p-8 mb-8 shadow-2xl hover:bg-white/40 transition-all">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
            🛰️ XPLR HPG2 Location Tracker
          </h1>
          <p className="text-white/80 text-lg drop-shadow-md">
            Real-time GPS and high-precision positioning with modern glassmorphism UI
          </p>
        </div>

        {/* Device Selection */}
        <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setUseXPLR(false)}
              className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-sm ${
                !useXPLR
                  ? "bg-blue-500/80 text-white shadow-lg scale-105"
                  : "bg-white/40 text-white/70 hover:bg-white/50"
              }`}
            >
              📱 Built-in Geolocation
            </button>
            <button
              onClick={() => setUseXPLR(true)}
              className={`px-6 py-3 rounded-full font-semibold transition-all backdrop-blur-sm ${
                useXPLR
                  ? "bg-blue-500/80 text-white shadow-lg scale-105"
                  : "bg-white/40 text-white/70 hover:bg-white/50"
              }`}
            >
              🛰️ XPLR HPG2
            </button>
            <div className="flex-1 text-right">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                useXPLR && deviceStatus === "Connected to XPLR HPG2"
                  ? "bg-green-500/60 text-white"
                  : "bg-yellow-500/60 text-white"
              }`}>
                {useXPLR ? deviceStatus : "Geolocation Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Speed Card */}
          <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/40 to-blue-600/40 border border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-semibold drop-shadow">Current Speed</p>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {speed.toFixed(2)} <span className="text-lg">m/s</span>
            </p>
            <p className="text-white/70 text-sm mt-2">
              {(speed * 3.6).toFixed(2)} km/h
            </p>
          </div>

          {/* Distance Card */}
          <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/40 to-purple-600/40 border border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-semibold drop-shadow">Total Distance</p>
              <span className="text-2xl">📍</span>
            </div>
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {(totalDistance / 1000).toFixed(2)} <span className="text-lg">km</span>
            </p>
            <p className="text-white/70 text-sm mt-2">
              {totalDistance.toFixed(0)} meters
            </p>
          </div>

          {/* Accuracy Card */}
          <div className="backdrop-blur-md bg-gradient-to-br from-pink-500/40 to-pink-600/40 border border-white/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-semibold drop-shadow">
                {useXPLR ? "Satellites" : "Accuracy"}
              </p>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              {useXPLR ? deviceAccuracy : "High"}
            </p>
            <p className="text-white/70 text-sm mt-2">
              {useXPLR ? "Connected satellites" : "Geolocation enabled"}
            </p>
          </div>
        </div>

        {/* Map and Chart */}
        <Map locations={locations} useXPLR={useXPLR} deviceLocation={deviceLocation} />
      </div>
    </div>
  );
}

export default App;
