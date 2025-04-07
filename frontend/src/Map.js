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
  height: "500px",
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
    axios
      .get("https://vr10-1neww.onrender.com/logs")
      .then((res) => {
        const historyPath = res.data.map((loc) => ({
          lat: loc.latitude,
          lng: loc.longitude,
          timestamp: new Date(loc.timestamp).toLocaleTimeString(),
        }));
        setPath(historyPath);
      })
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

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
    <div className="flex flex-col items-center px-4 py-6 gap-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-5xl rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <LoadScript googleMapsApiKey="AIzaSyCV9FysfrhVUzBQb4CJCZ-kBEYYcIBmEYw">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
            {path.length > 0 && (
              <>
                <Marker position={path[0]} label="Start" />
                <Marker position={path[path.length - 1]} label="End" />
              </>
            )}
            {location && (
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                label="Live"
              />
            )}
            <Polyline
              path={path}
              options={{ strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 2 }}
              onMouseOver={(e) => {
                const index = path.findIndex(
                  (p) => p.lat === e.latLng.lat() && p.lng === e.latLng.lng()
                );
                setHoveredIndex(index);
              }}
            />
            {showTimestamps && hoveredIndex !== null && path[hoveredIndex]?.timestamp && (
              <InfoWindow
                position={path[hoveredIndex]}
                onCloseClick={() => setHoveredIndex(null)}
              >
                <div>{path[hoveredIndex].timestamp}</div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 text-center space-y-2 w-full max-w-xl">
        <p className="text-lg font-medium text-gray-700">
          <strong>Speed:</strong> {speed} m/s
        </p>
        <p className="text-lg font-medium text-gray-700">
          <strong>Distance Traveled:</strong> {distance.toFixed(2)} km
        </p>
        <button
          onClick={() => setShowTimestamps((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Toggle Timestamps
        </button>
      </div>

      <div className="w-full max-w-4xl h-64 p-4 bg-white shadow-md rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={speedHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: "Speed (m/s)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Line type="monotone" dataKey="speed" stroke="#8884d8" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MapComponent;
