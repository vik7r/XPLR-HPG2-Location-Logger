/* ============ XPLR HPG2 Device Configuration & Utilities ============ */

/**
 * XPLR HPG2 Connection Manager
 * Handles WebSerial and WebSocket connections to u-blox XPLR devices
 */

export class XPLRDevice {
  constructor() {
    this.port = null;
    this.isConnected = false;
    this.baudRate = 115200;
    this.buffer = "";
  }

  /**
   * Detect and connect to XPLR HPG2 device via Web Serial API
   */
  async connect(onData, onError) {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API not supported in this browser");
      }

      const filters = [
        { usbVendorId: 0x1546, usbProductId: 0x01a9 }, // u-blox
      ];

      this.port = await navigator.serial.requestPort({ filters });
      await this.port.open({ baudRate: this.baudRate, dataBits: 8, stopBits: 1, parity: "none" });

      this.isConnected = true;
      this.startReading(onData, onError);

      return { success: true, message: "Connected to XPLR HPG2" };
    } catch (error) {
      onError(error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Start reading data from serial port
   */
  async startReading(onData, onError) {
    const reader = this.port.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const text = new TextDecoder().decode(value);
        this.buffer += text;

        // Process complete NMEA sentences
        const lines = this.buffer.split("\n");
        this.buffer = lines[lines.length - 1]; // Keep incomplete line

        for (let i = 0; i < lines.length - 1; i++) {
          const sentence = lines[i].trim();
          if (sentence.length > 0) {
            const parsed = this.parseNMEA(sentence);
            if (parsed) {
              onData(parsed);
            }
          }
        }
      }
    } catch (error) {
      onError(error.message);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse NMEA sentence into structured data
   * Supports: GGA (position), RMC (position, speed, date), GSA (fix quality)
   */
  parseNMEA(sentence) {
    if (!sentence.startsWith("$")) return null;

    const parts = sentence.split(",");
    const type = parts[0].substring(1, 6);

    try {
      switch (type) {
        case "GPGGA":
        case "GNGGA":
          return this.parseGGA(parts);
        case "GPRMC":
        case "GNRMC":
          return this.parseRMC(parts);
        case "GPGSA":
        case "GNGSA":
          return this.parseGSA(parts);
        default:
          return null;
      }
    } catch (error) {
      console.error("NMEA parse error:", error);
      return null;
    }
  }

  /**
   * Parse GGA sentence (Essential fix data)
   * Format: $GPGGA,hhmmss.ss,ddmm.mmmm,a,dddmm.mmmm,a,x,xx,x.x,x.x,M,x.x,M,x.x,xxxx
   */
  parseGGA(parts) {
    if (parts.length < 12) return null;

    const time = parts[1];
    const lat = this.convertDMtoDec(parts[2], parts[3]);
    const lng = this.convertDMtoDec(parts[4], parts[5]);
    const fixQuality = parseInt(parts[6]); // 0=Invalid, 1=GPS, 2=DGPS, 3=PPS, 4=RTK, 5=RTK Float
    const satCount = parseInt(parts[7]);
    const hdop = parseFloat(parts[8]); // Horizontal dilution of precision
    const altitude = parseFloat(parts[9]);

    return {
      type: "GGA",
      time,
      latitude: lat,
      longitude: lng,
      fixQuality: this.getFixQualityName(fixQuality),
      satellites: satCount,
      hdop,
      altitude,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Parse RMC sentence (Position, speed, date)
   */
  parseRMC(parts) {
    if (parts.length < 8) return null;

    const time = parts[1];
    const status = parts[2]; // A=Active, V=Void
    const lat = this.convertDMtoDec(parts[3], parts[4]);
    const lng = this.convertDMtoDec(parts[5], parts[6]);
    const speed = parseFloat(parts[7]); // Speed over ground in knots
    const course = parseFloat(parts[8]); // Course over ground

    return {
      type: "RMC",
      time,
      status: status === "A" ? "Active" : "Void",
      latitude: lat,
      longitude: lng,
      speed: speed * 0.514444, // Convert knots to m/s
      speedKnots: speed,
      course,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Parse GSA sentence (DOP and active satellites)
   */
  parseGSA(parts) {
    if (parts.length < 18) return null;

    const mode = parts[1]; // A=Auto, M=Manual
    const fixType = parseInt(parts[2]); // 1=No fix, 2=2D, 3=3D
    const pdop = parseFloat(parts[15]); // Position dilution of precision
    const hdop = parseFloat(parts[16]); // Horizontal dilution of precision
    const vdop = parseFloat(parts[17]); // Vertical dilution of precision

    const activeSats = parts.slice(3, 15).filter((s) => s.length > 0);

    return {
      type: "GSA",
      mode,
      fixType: fixType === 1 ? "No Fix" : fixType === 2 ? "2D Fix" : "3D Fix",
      activeSatellites: activeSats.map(Number),
      pdop,
      hdop,
      vdop,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convert Degrees/Minutes to Decimal Degrees
   * Format: DDmm.mmmm
   */
  convertDMtoDec(dmValue, direction) {
    if (!dmValue) return null;

    const dm = parseFloat(dmValue);
    const degrees = Math.floor(dm / 100);
    const minutes = dm - degrees * 100;
    let decimal = degrees + minutes / 60;

    if (direction === "S" || direction === "W") {
      decimal = -decimal;
    }

    return parseFloat(decimal.toFixed(6));
  }

  /**
   * Get human-readable fix quality name
   */
  getFixQualityName(quality) {
    const names = {
      0: "No Fix",
      1: "GPS Fix",
      2: "DGPS Fix",
      3: "PPS Fix",
      4: "RTK Fixed",
      5: "RTK Float",
      6: "Estimated",
    };
    return names[quality] || "Unknown";
  }

  /**
   * Disconnect from device
   */
  async disconnect() {
    try {
      if (this.port) {
        await this.port.close();
        this.isConnected = false;
        this.port = null;
        return { success: true, message: "Disconnected from XPLR HPG2" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Send command to device
   */
  async sendCommand(command) {
    try {
      if (!this.isConnected || !this.port) {
        throw new Error("Device not connected");
      }

      const writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(command + "\r\n"));
      writer.releaseLock();

      return { success: true, message: "Command sent" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      port: this.port ? "Open" : "Closed",
      baudRate: this.baudRate,
    };
  }
}

export default XPLRDevice;
