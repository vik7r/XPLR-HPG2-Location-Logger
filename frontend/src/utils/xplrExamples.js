/* ============ XPLR HPG2 Setup & Integration Guide ============ */

/**
 * Quick Start: Using XPLR HPG2 Device Integration
 * 
 * This file provides examples of how to use the XPLR device module
 */

import XPLRDevice from './utils/xplrDevice';

/**
 * Example 1: Basic Device Connection
 */
export const basicConnection = async () => {
  const device = new XPLRDevice();

  const handleData = (parsedData) => {
    console.log("Received location data:", parsedData);
    
    if (parsedData.type === "GGA") {
      console.log(`Location: ${parsedData.latitude}, ${parsedData.longitude}`);
      console.log(`Satellites: ${parsedData.satellites}`);
      console.log(`Fix Quality: ${parsedData.fixQuality}`);
      console.log(`Altitude: ${parsedData.altitude}m`);
    }
    
    if (parsedData.type === "RMC") {
      console.log(`Speed: ${parsedData.speed.toFixed(2)} m/s`);
      console.log(`Course: ${parsedData.course}°`);
    }
  };

  const handleError = (error) => {
    console.error("Device error:", error);
  };

  const result = await device.connect(handleData, handleError);
  console.log(result.message);

  return device;
};

/**
 * Example 2: Advanced Integration with React State
 */
export const advancedReactIntegration = (setLocation, setDeviceStatus) => {
  const device = new XPLRDevice();

  const handleData = (parsedData) => {
    if (parsedData.type === "GGA") {
      setLocation({
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
        accuracy: parsedData.fixQuality,
        satellites: parsedData.satellites,
        altitude: parsedData.altitude,
        hdop: parsedData.hdop,
        timestamp: parsedData.timestamp,
      });

      // Update satellite count
      setDeviceStatus(`Connected - ${parsedData.satellites} satellites`);
    }
  };

  const handleError = (error) => {
    setDeviceStatus(`Error: ${error}`);
  };

  return { device, handleData, handleError };
};

/**
 * Example 3: Calculate Accuracy Score Based on Fix Quality & Satellites
 */
export const calculateAccuracyScore = (fixQuality, satelliteCount, hdop) => {
  let score = 0;

  // Fix quality factor (0-30 points)
  const fixScores = {
    "No Fix": 0,
    "GPS Fix": 15,
    "DGPS Fix": 20,
    "PPS Fix": 25,
    "RTK Fixed": 30,
    "RTK Float": 28,
  };
  score += fixScores[fixQuality] || 0;

  // Satellite count factor (0-40 points)
  score += Math.min(40, satelliteCount * 4);

  // HDOP factor (0-30 points) - lower HDOP is better
  if (hdop < 1) score += 30;
  else if (hdop < 2) score += 25;
  else if (hdop < 5) score += 15;
  else if (hdop < 10) score += 8;
  else score += 0;

  return {
    score: Math.min(100, score),
    quality: score > 85 ? "Excellent" : score > 70 ? "Good" : score > 50 ? "Fair" : "Poor",
  };
};

/**
 * Example 4: Distance & Speed Calculations
 */
export const locationCalculations = {
  /**
   * Haversine formula - Calculate distance between two points
   */
  haversineDistance: (loc1, loc2) => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = loc1.latitude * (Math.PI / 180);
    const lat2 = loc2.latitude * (Math.PI / 180);
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  },

  /**
   * Calculate bearing between two points
   */
  calculateBearing: (loc1, loc2) => {
    const lat1 = loc1.latitude * (Math.PI / 180);
    const lat2 = loc2.latitude * (Math.PI / 180);
    const dLng = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360; // Bearing in degrees (0-360)
  },

  /**
   * Convert speed from knots to m/s
   */
  knotsToMs: (knots) => knots * 0.514444,

  /**
   * Convert speed from m/s to km/h
   */
  msToKmh: (ms) => ms * 3.6,
};

/**
 * Example 5: NMEA Sentence Validation
 */
export const validateNMEASentence = (sentence) => {
  // Basic structure check
  if (!sentence.startsWith("$")) {
    return { valid: false, reason: "Invalid start character" };
  }

  // Checksum validation (if present)
  if (sentence.includes("*")) {
    const [data, checksum] = sentence.split("*");
    let calculatedChecksum = 0;

    for (let i = 1; i < data.length; i++) {
      calculatedChecksum ^= data.charCodeAt(i);
    }

    const expectedChecksum = parseInt(checksum, 16);
    if (calculatedChecksum !== expectedChecksum) {
      return { valid: false, reason: "Checksum mismatch" };
    }
  }

  return { valid: true, reason: "Valid NMEA sentence" };
};

/**
 * Example 6: Data Logging Helper
 */
export const dataLogger = {
  logs: [],

  addLog: function (data) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      data,
    });
  },

  exportCSV: function () {
    if (this.logs.length === 0) return "";

    const headers = ["Timestamp", "Latitude", "Longitude", "Speed", "Satellites", "Fix Quality"];
    const rows = this.logs.map((log) => [
      log.timestamp,
      log.data.latitude,
      log.data.longitude,
      log.data.speed || "N/A",
      log.data.satellites || "N/A",
      log.data.fixQuality || "N/A",
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    return csv;
  },

  downloadCSV: function (filename = "location_log.csv") {
    const csv = this.exportCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  clearLogs: function () {
    this.logs = [];
  },
};

/**
 * Example 7: Device Configuration Commands
 * These are common u-blox XPLR configuration commands
 */
export const xplrCommands = {
  // Set output rate to 10Hz
  setOutputRate10Hz: "$PUBX,40,GGA,0,10,0,0",

  // Set output rate to 1Hz
  setOutputRate1Hz: "$PUBX,40,GGA,0,1,0,0",

  // Request GGA sentence every second
  requestGGA: "$PUBX,40,GGA,0,1,0,0",

  // Request RMC sentence every second
  requestRMC: "$PUBX,40,RMC,0,1,0,0",

  // Request GSA sentence every second
  requestGSA: "$PUBX,40,GSA,0,1,0,0",

  // Request all common sentences
  requestAll: "$PUBX,40,GGA,0,1,0,0\n$PUBX,40,RMC,0,1,0,0\n$PUBX,40,GSA,0,1,0,0",

  // Restart device
  restart: "$PUBX,00",

  // Get device info
  getDeviceInfo: "$PUBX,00",
};

export default {
  basicConnection,
  advancedReactIntegration,
  calculateAccuracyScore,
  locationCalculations,
  validateNMEASentence,
  dataLogger,
  xplrCommands,
};
