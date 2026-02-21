/* ============ Configuration & Setup Files ============ */

/**
 * Environment Variables Configuration
 * Create a .env file in the frontend directory with these variables
 */

// .env.example content:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
REACT_APP_XPLR_BAUD_RATE=115200
REACT_APP_XPLR_UPDATE_RATE=1
REACT_APP_ENABLE_DEBUG_MODE=true

---

/**
 * Tailwind Configuration (if custom config needed)
 * tailwind.config.js
 */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          medium: 'rgba(255, 255, 255, 0.15)',
          dark: 'rgba(0, 0, 0, 0.15)',
        },
      },
      backdropBlur: {
        glass: '10px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%, 100%': { textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' },
          '50%': { textShadow: '0 0 30px rgba(255, 255, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};

---

/**
 * PostCSS Configuration (if custom needed)
 * postcss.config.js
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

---

/**
 * Package.json scripts enhancements
 */

{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "set REACT_APP_DEBUG=true && react-scripts start",
    "prod-build": "REACT_APP_ENV=production react-scripts build",
    "format": "prettier --write 'src/**/*.{js,jsx,css}'",
    "lint": "eslint src/",
    "xplr-demo": "node scripts/xplr-demo.js"
  }
}

---

/**
 * XPLR Device Connection Setup
 * src/config/xplrConfig.js
 */

export const XPLR_CONFIG = {
  // Serial communication
  BAUD_RATE: 115200,
  DATA_BITS: 8,
  STOP_BITS: 1,
  PARITY: 'none',
  
  // Update rates
  GGA_RATE: 1,        // 1 Hz
  RMC_RATE: 1,        // 1 Hz
  GSA_RATE: 0,        // Don't request
  
  // Device identification
  USB_VENDOR_ID: 0x1546,
  USB_PRODUCT_ID: 0x01a9,
  
  // Timeout settings
  CONNECTION_TIMEOUT: 5000,    // 5 seconds
  READ_TIMEOUT: 10000,          // 10 seconds
  
  // NMEA parser settings
  BUFFER_MAX_LENGTH: 1024,
  PARSE_TIMEOUT: 1000,
  
  // Data validation
  MIN_SATELLITES: 4,
  MAX_HDOP: 10,
  ACCEPT_RTK_FLOAT: true,
  
  // Logging
  DEBUG_MODE: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
  LOG_NMEA_DATA: false,
  LOG_PARSED_DATA: true,
};

---

/**
 * Backend Configuration
 * backend/.env example
 */

// backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/xplr-tracker
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

// Data retention
DATA_RETENTION_DAYS=30
PURGE_OLD_DATA=true

// API configuration
API_RATE_LIMIT=1000
API_TIMEOUT=30000

// Logging
LOG_LEVEL=info
LOG_FORMAT=combined

---

/**
 * Google Maps API Configuration
 * src/config/mapsConfig.js
 */

export const MAPS_CONFIG = {
  API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  
  // Map defaults
  DEFAULT_CENTER: {
    lat: 28.6139,
    lng: 77.209,
  },
  
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 5,
  MAX_ZOOM: 21,
  
  // Map styling
  MAP_TYPE_CONTROL: true,
  FULLSCREEN_CONTROL: true,
  ZOOM_CONTROL: true,
  STREET_VIEW_CONTROL: false,
  
  // Marker styling
  MARKER_COLORS: {
    start: '#4ade80',    // Green
    end: '#ef4444',      // Red
    live: '#3b82f6',     // Blue
    waypoint: '#f59e0b', // Amber
  },
  
  // Polyline styling
  POLYLINE_STYLE: {
    strokeColor: '#3b82f6',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    geodesic: true,
  },
  
  // Map themes
  THEMES: {
    light: [],
    dark: [
      {
        elementType: 'geometry',
        stylers: [{ color: '#212121' }],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }],
      },
      // ... more dark theme styles
    ],
  },
};

---

/**
 * Chart Configuration
 * src/config/chartConfig.js
 */

export const CHART_CONFIG = {
  // Speed chart settings
  SPEED_CHART: {
    MAX_DATA_POINTS: 60,
    UPDATE_INTERVAL: 1000,
    COLORS: {
      line: '#60a5fa',
      dot: '#3b82f6',
      tooltip: 'rgba(0, 0, 0, 0.8)',
    },
    AXIS: {
      stroke: 'rgba(255,255,255,0.7)',
    },
  },
  
  // Distance chart settings
  DISTANCE_CHART: {
    MAX_DATA_POINTS: 60,
    COLORS: {
      area: '#a78bfa',
      line: '#8b5cf6',
    },
  },
  
  // Accuracy chart settings
  ACCURACY_CHART: {
    COLORS: {
      excellent: '#4ade80',
      good: '#60a5fa',
      fair: '#f59e0b',
      poor: '#ef4444',
    },
  },
};

---

/**
 * Error Handling Configuration
 * src/config/errorConfig.js
 */

export const ERROR_MESSAGES = {
  // Geolocation errors
  PERMISSION_DENIED: 'Location permission denied. Please enable location in settings.',
  POSITION_UNAVAILABLE: 'Location unavailable. Please check GPS signal.',
  TIMEOUT: 'Location request timed out. Please try again.',
  
  // XPLR device errors
  SERIAL_NOT_SUPPORTED: 'Web Serial API not supported in this browser.',
  DEVICE_NOT_FOUND: 'XPLR HPG2 device not found. Please connect USB device.',
  CONNECTION_FAILED: 'Failed to connect to XPLR device. Please try again.',
  READ_ERROR: 'Error reading from device. Connection may be lost.',
  PARSE_ERROR: 'Failed to parse device data. Please check connection.',
  
  // API errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Generic
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

---

/**
 * Storage Configuration (for caching)
 * src/config/storageConfig.js
 */

export const STORAGE_CONFIG = {
  // Local storage keys
  KEYS: {
    LAST_LOCATION: 'xplr_last_location',
    DEVICE_PREFERENCE: 'xplr_device_preference',
    USER_SETTINGS: 'xplr_user_settings',
    ROUTE_HISTORY: 'xplr_route_history',
    MAP_ZOOM: 'xplr_map_zoom',
  },
  
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTO_SAVE_INTERVAL: 5000,        // 5 seconds
  
  // Cache duration
  LOCATION_CACHE_TIME: 1000,
  DATA_CACHE_TIME: 5000,
};

---

/**
 * Analytics Configuration (optional)
 * src/config/analyticsConfig.js
 */

export const ANALYTICS_CONFIG = {
  ENABLED: false,
  TRACKING_ID: 'YOUR_TRACKING_ID',
  
  EVENTS: {
    APP_START: 'app_start',
    GEOLOCATION_START: 'geolocation_start',
    XPLR_CONNECTED: 'xplr_connected',
    XPLR_DISCONNECTED: 'xplr_disconnected',
    LOCATION_UPDATE: 'location_update',
    ERROR: 'error',
  },
};

---

/**
 * Notification Configuration
 * src/config/notificationConfig.js
 */

export const NOTIFICATION_CONFIG = {
  DURATION: 3000,
  
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  
  POSITION: 'top-right',
  
  MESSAGES: {
    XPLR_CONNECTED: '🛰️ XPLR HPG2 Connected!',
    XPLR_DISCONNECTED: '❌ XPLR HPG2 Disconnected',
    RTK_FIXED: '⭐ RTK Fixed - Centimeter accuracy achieved!',
    RTK_FLOAT: '📍 RTK Float - ~5-10cm accuracy',
    LOCATION_SAVED: '✅ Location saved to server',
  },
};

---

/**
 * Performance Optimization Config
 * src/config/performanceConfig.js
 */

export const PERFORMANCE_CONFIG = {
  // Debounce settings (in ms)
  DEBOUNCE: {
    MAP_UPDATE: 250,
    STATS_UPDATE: 500,
    LOCATION_UPDATE: 100,
  },
  
  // Throttle settings (in ms)
  THROTTLE: {
    SCROLL: 100,
    RESIZE: 150,
    INPUT: 200,
  },
  
  // Virtual scrolling
  VIRTUALIZATION_ENABLED: true,
  ITEM_HEIGHT: 50,
  BUFFER_SIZE: 5,
  
  // Image optimization
  IMAGE_COMPRESSION: 0.8,
  MAX_IMAGE_SIZE: 500,
  
  // Code splitting
  CODE_SPLITTING_ENABLED: true,
  LAZY_LOAD_MAP: true,
};

---

These configuration files provide:
✅ Environment variables setup
✅ Tailwind customization
✅ XPLR device parameters
✅ Google Maps settings
✅ Chart configurations
✅ Error handling
✅ Storage management
✅ Analytics options
✅ Performance tuning

Create these files in your src/config/ directory for a fully customized setup!
