import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "24px",
  overflow: "hidden",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const R = 6371e3;
  const lat1 = loc1.latitude * (Math.PI / 180);
  const lat2 = loc2.latitude * (Math.PI / 180);
  const deltaLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const deltaLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

function MapComponent() {
  const [location, setLocation] = useState(null);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [previousTimestamp, setPreviousTimestamp] = useState(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (previousLocation && previousTimestamp) {
          const dist = calculateDistance(previousLocation, newLocation);
          setDistance((prev) => prev + dist / 1000);
          const timeDiff = (position.timestamp - previousTimestamp) / 1000;
          if (timeDiff > 0) {
            const calculatedSpeed = dist / timeDiff;
            setSpeed(calculatedSpeed.toFixed(2));
            setSpeedHistory((prev) => [
              ...prev.slice(-29),
              {
                time: new Date().toLocaleTimeString(),
                speed: +calculatedSpeed.toFixed(2),
              },
            ]);
          }
        }

        try {
          await axios.post("https://vr10-1neww.onrender.com/log", {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
          });
        } catch (err) {
          console.error("Error saving location:", err);
        }

        setPreviousLocation(newLocation);
        setPreviousTimestamp(position.timestamp);
        setLocation(newLocation);
        setPath((prevPath) => [
          ...prevPath,
          {
            lat: newLocation.latitude,
            lng: newLocation.longitude,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      },
      (error) => console.error("Geolocation Error:", error),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [previousLocation, previousTimestamp]);

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : defaultCenter;

  return (
    <div className="space-y-8">
      {/* Map Container with Glassmorphism */}
      <div className="backdrop-blur-md bg-white/20 border border-white/50 rounded-3xl overflow-hidden shadow-2xl">
        <LoadScript googleMapsApiKey="AIzaSyCV9FysfrhVUzBQb4CJCZ-kBEYYcIBmEYw">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
            {path.length > 0 && (
              <>
                <Marker 
                  position={path[0]} 
                  label={{text: "Start", color: "white", fontSize: "14px", fontWeight: "bold"}}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4ade80",
                    fillOpacity: 1,
                    strokeColor: "#fff",
                    strokeWeight: 2,
                  }}
                />
                <Marker 
                  position={path[path.length - 1]} 
                  label={{text: "End", color: "white", fontSize: "14px", fontWeight: "bold"}}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                    strokeColor: "#fff",
                    strokeWeight: 2,
                  }}
                />
              </>
            )}

            {location && (
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                label={{text: "Live", color: "white", fontSize: "12px", fontWeight: "bold"}}
                animation={window.google.maps.Animation?.BOUNCE}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#3b82f6",
                  fillOpacity: 0.8,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                }}
              />
            )}

            {path.length > 1 && (
              <Polyline
                path={path}
                options={{
                  strokeColor: "#3b82f6",
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                  geodesic: true,
                }}
              />
            )}

            {showTimestamps && hoveredIndex !== null && path[hoveredIndex]?.timestamp && (
              <InfoWindow
                position={path[hoveredIndex]}
                onCloseClick={() => setHoveredIndex(null)}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                  {path[hoveredIndex].timestamp}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed Stats */}
        <div className="backdrop-blur-md bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/80 text-sm font-semibold">Current Speed</p>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-3xl font-bold text-white drop-shadow-lg">
            {speed} <span className="text-sm">m/s</span>
          </p>
        </div>

        {/* Distance Stats */}
        <div className="backdrop-blur-md bg-gradient-to-br from-violet-500/40 to-purple-500/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/80 text-sm font-semibold">Distance Traveled</p>
            <span className="text-2xl">📏</span>
          </div>
          <p className="text-3xl font-bold text-white drop-shadow-lg">
            {distance.toFixed(2)} <span className="text-sm">km</span>
          </p>
        </div>

        {/* Toggle Button */}
        <div className="backdrop-blur-md bg-gradient-to-br from-pink-500/40 to-rose-500/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <button
            onClick={() => setShowTimestamps((prev) => !prev)}
            className="w-full px-4 py-3 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl border border-white/40"
          >
            {showTimestamps ? "🕐 Hide Timestamps" : "🕐 Show Timestamps"}
          </button>
        </div>
      </div>

      {/* Speed Chart with Glassmorphism */}
      <div className="backdrop-blur-md bg-white/20 border border-white/50 rounded-2xl p-6 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-4 drop-shadow-lg">📊 Speed Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={speedHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" />
            <YAxis 
              label={{ value: "Speed (m/s)", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.7)" }}
              stroke="rgba(255,255,255,0.7)"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "12px",
                color: "white"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="#60a5fa" 
              strokeWidth={3} 
              dot={{fill: "#3b82f6", r: 5}}
              activeDot={{r: 7}}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MapComponent;
