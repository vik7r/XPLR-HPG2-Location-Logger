import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  OverlayView,
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

// Dark map style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
];

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
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLng = toRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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
        const newLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (previousLocation && previousTimestamp) {
          const dist = calculateDistance(previousLocation, newLoc);
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
            latitude: newLoc.latitude,
            longitude: newLoc.longitude,
          });
        } catch (err) {
          console.error("Error saving location:", err);
        }

        setPreviousLocation(newLoc);
        setPreviousTimestamp(position.timestamp);
        setLocation(newLoc);
        setPath((prevPath) => [
          ...prevPath,
          {
            lat: newLoc.latitude,
            lng: newLoc.longitude,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [previousLocation, previousTimestamp]);

  const mapCenter = location
    ? { lat: location.latitude, lng: location.longitude }
    : defaultCenter;

  return (
    <div className="flex flex-col gap-6 p-4 bg-black text-white min-h-screen">
      <LoadScript googleMapsApiKey="AIzaSyCV9FysfrhVUzBQb4CJCZ-kBEYYcIBmEYw">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={15}
          options={{ styles: darkMapStyle }}
        >
          {/* Glowing Pulse Marker */}
          {location && (
            <OverlayView
              position={{
                lat: location.latitude,
                lng: location.longitude,
              }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="relative w-6 h-6">
                <div className="absolute w-6 h-6 bg-cyan-400 rounded-full opacity-75 animate-ping" />
                <div className="absolute w-3 h-3 bg-cyan-500 rounded-full top-[6px] left-[6px]" />
              </div>
            </OverlayView>
          )}

          <Polyline
            path={path}
            options={{
              strokeColor: "#00ffff",
              strokeOpacity: 0.8,
              strokeWeight: 3,
            }}
            onMouseOver={(e) => {
              const index = path.findIndex(
                (p) => p.lat === e.latLng.lat() && p.lng === e.latLng.lng()
              );
              setHoveredIndex(index);
            }}
          />

          {showTimestamps &&
            hoveredIndex !== null &&
            path[hoveredIndex]?.timestamp && (
              <InfoWindow
                position={path[hoveredIndex]}
                onCloseClick={() => setHoveredIndex(null)}
              >
                <div className="text-black">
                  {path[hoveredIndex].timestamp}
                </div>
              </InfoWindow>
            )}
        </GoogleMap>
      </LoadScript>

      <div className="text-center space-y-2">
        <p>
          <strong>Speed:</strong> {speed} m/s
        </p>
        <p>
          <strong>Distance Traveled:</strong> {distance.toFixed(2)} km
        </p>
        <button
          onClick={() => setShowTimestamps((prev) => !prev)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-800 rounded-lg"
        >
          Toggle Timestamps
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={speedHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis
              label={{
                value: "Speed (m/s)",
                angle: -90,
                position: "insideLeft",
                fill: "#fff",
              }}
              stroke="#fff"
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#00ffff"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MapComponent;
