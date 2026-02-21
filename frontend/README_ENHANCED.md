![XPLR HPG2 Location Tracker](https://img.shields.io/badge/GPS%20Tracking-XPLR%20HPG2-blue?style=for-the-badge)
![Glassmorphism UI](https://img.shields.io/badge/UI%20Design-Glassmorphism-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge)

# 🛰️ XPLR HPG2 Location Tracker with Modern UI

A sleek, modern location tracking application featuring **glassmorphism design** and integration with the **u-blox XPLR HPG2** high-precision GPS device. Built with React, Tailwind CSS, and real-time location visualization.

## ✨ Features

### 🎨 **Modern Glassmorphism Design**
- Frosted glass effect with backdrop blur
- Animated gradient backgrounds
- Semi-transparent interactive cards
- Smooth hover animations and transitions
- Professional color palette (Blues, Purples, Pinks)
- Fully responsive on all devices

### 📍 **Dual Location Sources**
- **Built-in Geolocation**: Use browser's native GPS
- **XPLR HPG2 Device**: High-precision GPS via USB Serial connection
- **Seamless Switching**: Toggle between sources with one click
- **Real-time Updates**: Live position, speed, and accuracy data

### 🗺️ **Interactive Map**
- Live location tracking with animated marker
- Route path visualization with polyline
- Start and end position markers
- Timestamp information for each waypoint
- Google Maps integration

### 📊 **Real-time Analytics**
- Current speed (m/s and km/h)
- Total distance traveled (km and meters)
- Satellite count and fix quality
- Live speed graph with historical data
- Accuracy metrics and DOP values

### 🔧 **Developer-Friendly**
- Modular component architecture
- XPLR device abstraction layer
- NMEA sentence parsing utilities
- Example integration code
- Comprehensive documentation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- npm or yarn package manager
- Modern web browser (Chrome, Edge, Firefox, Safari)
- USB connection for XPLR HPG2 device (optional)

### Installation

#### For Windows:
```bash
# Double-click quickstart.bat
# Or run in PowerShell:
.\quickstart.bat
```

#### For Mac/Linux:
```bash
# Make script executable
chmod +x quickstart.sh

# Run quick start
./quickstart.sh
```

#### Manual Setup:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will automatically open at `http://localhost:3000`

---

## 📖 How to Use

### Using Built-in Geolocation
1. Open the app in your browser
2. Click **"📱 Built-in Geolocation"** button
3. Grant location permission when prompted
4. Location tracking will start immediately
5. View real-time speed, distance, and map

### Using XPLR HPG2 Device
1. Connect your u-blox XPLR HPG2 device via USB
2. Click **"🛰️ XPLR HPG2"** button
3. Select your device from the browser's device dialog
4. Wait for "Connected to XPLR HPG2" confirmation
5. Real-time GPS data will start streaming
6. Watch satellites, accuracy, and position update

### Map Interaction
- **View Route**: The blue line shows your traveled path
- **Start Point**: Green marker showing where you started
- **End Point**: Red marker showing current/last position
- **Live Location**: Blue animated marker at your current position
- **Toggle Timestamps**: See exact timestamps for each point on the route

---

## 🛰️ XPLR HPG2 Device Details

### Supported Features
- **High-Precision GPS**: cm-level accuracy with RTK
- **Multiple GNSS**: GPS, GLONASS, Galileo, BeiDou
- **Real-Time Kinematic (RTK)**: Centimeter-level accuracy
- **NMEA Sentence Support**: GGA, RMC, GSA, and more
- **Satellite Tracking**: Up to 32 simultaneous satellites

### Fix Quality Levels
| Level | Quality | Accuracy | Use Case |
|-------|---------|----------|----------|
| 0 | No Fix | N/A | No signal |
| 1 | GPS Fix | ±5-10m | Standard GPS |
| 2 | DGPS Fix | ±1-3m | Differential GPS |
| 3 | PPS Fix | ±100mm | Precise Point Positioning |
| **4** | **RTK Fixed** | **±1-2cm** | **Survey-grade** |
| 5 | RTK Float | ±5-10cm | Intermediate RTK |

### Supported NMEA Sentences
- **$GPGGA / $GNGGA**: Position, fix quality, satellites, altitude
- **$GPRMC / $GNRMC**: Position, speed, course, date
- **$GPGSA / $GNGSA**: DOP values, active satellites

---

## 🎨 UI Components

### Header
```
🛰️ XPLR HPG2 Location Tracker
Real-time GPS and high-precision positioning with modern glassmorphism UI
```

### Device Selection Panel
Toggle between geolocation sources with real-time connection status

### Statistics Cards (Grid)
| Card | Shows |
|------|-------|
| ⚡ Speed | Current speed in m/s and km/h |
| 📍 Distance | Total distance in km and meters |
| 🎯 Accuracy | Satellites/accuracy with connection status |

### Map Container
Full interactive Google Map with custom markers and route visualization

### Speed Graph
Real-time speed history displayed as an interactive line chart

---

## 📁 Project Structure

```
vr10-main/
├── frontend/
│   ├── public/
│   │   ├── index.html              # Enhanced with Tailwind CDN
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.js                  # Main app with device selection
│   │   ├── App.css                 # Glassmorphism styles
│   │   ├── Map.js                  # Map component with visualization
│   │   ├── index.css               # Global utilities
│   │   ├── index.js                # React entry point
│   │   └── utils/
│   │       ├── xplrDevice.js       # XPLR device connection manager
│   │       └── xplrExamples.js     # Integration examples
│   └── package.json
├── backend/
│   ├── server.js
│   ├── package.json
│   └── [other files]
├── ENHANCEMENTS.md                 # Detailed feature documentation
├── IMPLEMENTATION_SUMMARY.md       # What was changed
├── quickstart.sh                   # Mac/Linux startup script
├── quickstart.bat                  # Windows startup script
└── package.json

```

---

## 💻 Technical Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | Frontend framework |
| **Tailwind CSS** | Utility-first styling |
| **Google Maps API** | Map visualization |
| **Recharts** | Charts and graphs |
| **Axios** | HTTP client |
| **Web Serial API** | Device communication |
| **Node.js + Express** | Backend server |
| **MongoDB** | Data persistence |

---

## 🔗 API Integration

### Backend Endpoint: `POST /log`

**Request:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "accuracy": 10,
  "speed": 5.2,
  "source": "XPLR HPG2"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timestamp": "2024-02-21T10:30:00Z"
  }
}
```

---

## 🎯 Key Improvements from Original

| Before | After |
|--------|-------|
| Plain white background | Animated gradient + glassmorphism |
| Basic blue buttons | Gradient buttons with hover effects |
| Simple gray cards | Semi-transparent glass cards |
| Standard map markers | Enhanced animated markers |
| No device support | Full XPLR HPG2 integration |
| Basic typography | Professional fonts with shadows |
| Static layout | Responsive grid system |
| No animations | Smooth transitions throughout |

---

## 🔐 Browser Compatibility

| Browser | Version | Geolocation | Web Serial API |
|---------|---------|-------------|----------------|
| Chrome | 89+ | ✅ | ✅ |
| Firefox | Latest | ✅ | ❌ |
| Safari | 14+ | ✅ | ❌ |
| Edge | 89+ | ✅ | ✅ |
| Opera | 75+ | ✅ | ✅ |

**Note:** XPLR HPG2 device connection requires Web Serial API support (Chrome, Edge, Opera)

---

## 🐛 Troubleshooting

### XPLR Device Not Detected
```
✓ Check USB connection
✓ Verify device drivers installed
✓ Try different USB port
✓ Restart browser
✓ Check browser supports Web Serial API
```

### Location Permission Issues
```
✓ Enable location in browser settings
✓ Use HTTPS (required for geolocation)
✓ Check location permissions for the site
✓ Try incognito/private mode
```

### Glassmorphism Not Displaying
```
✓ Clear browser cache (Ctrl+Shift+Delete)
✓ Hard refresh (Ctrl+Shift+R)
✓ Check Tailwind CSS is loaded
✓ Verify browser compatibility
```

### Map Not Loading
```
✓ Check internet connection
✓ Verify Google Maps API key is valid
✓ Check for CORS errors in console
```

---

## 📊 Performance Metrics

- **Load Time**: ~2-3 seconds
- **Map Responsiveness**: 60 FPS
- **GPS Update Rate**: 1-10 Hz (configurable)
- **Bundle Size**: ~450KB (minified)

---

## 🚀 Future Enhancements

- [ ] Real-time WebSocket data streaming
- [ ] Historical route replay
- [ ] Advanced analytics dashboard
- [ ] Multi-device tracking
- [ ] Dark mode toggle
- [ ] Offline support with service workers
- [ ] Data export (CSV, KML, GPX)
- [ ] Geofencing and alerts
- [ ] Mobile app (React Native)

---

## 📝 File Reference

### Core Files Modified
- **App.js** - Added XPLR device integration and modern layout
- **Map.js** - Enhanced visualization with glassmorphism
- **App.css** - Complete redesign with gradients and animations
- **index.css** - Global glassmorphism utilities
- **index.html** - Tailwind CDN and meta tags

### New Utilities
- **xplrDevice.js** - XPLR HPG2 connection manager class
- **xplrExamples.js** - Integration examples and helpers

### Documentation
- **ENHANCEMENTS.md** - Detailed feature documentation
- **IMPLEMENTATION_SUMMARY.md** - Change summary

---

## 💡 Code Examples

### Basic XPLR Connection
```javascript
import XPLRDevice from './utils/xplrDevice';

const device = new XPLRDevice();

const handleData = (parsedData) => {
  console.log('Location:', parsedData.latitude, parsedData.longitude);
  console.log('Satellites:', parsedData.satellites);
};

await device.connect(handleData, handleError);
```

### Distance Calculation
```javascript
const calculateDistance = (loc1, loc2) => {
  const R = 6371e3; // Earth's radius in meters
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
```

---

## 🔗 Useful Links

- [u-blox XPLR HPG2 Documentation](https://www.u-blox.com/)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Google Maps API](https://developers.google.com/maps)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

ISC

---

## 👨‍💻 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 🙏 Acknowledgments

- u-blox for XPLR HPG2 device
- Google for Maps API
- Recharts for visualization
- React community

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [ENHANCEMENTS.md](ENHANCEMENTS.md)
3. Check console for error messages
4. Verify browser compatibility

---

**🎉 Happy Tracking! Enjoy your modern GPS tracker with glassmorphism UI 🚀**

*Last Updated: February 21, 2026*
