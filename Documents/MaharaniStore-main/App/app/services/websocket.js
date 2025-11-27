import { Platform } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// WebSocket base URL
const WS_BASE_URL = Platform.select({
  ios: 'http://localhost:5001',
  android: 'http://10.0.2.2:5001',
});

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('userData');
      
      if (!token) {
        console.log('⚠️ No auth token found, skipping WebSocket connection');
        return;
      }

      this.socket = io(WS_BASE_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected');
        this.isConnected = true;

        // Join user room if user data exists
        if (user) {
          try {
            const userData = JSON.parse(user);
            if (userData._id || userData.id) {
              this.socket.emit('join-user-room', userData._id || userData.id);
              console.log('👤 Joined user room:', userData._id || userData.id);
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnected = false;
      });

      // Listen for order events
      this.socket.on('order-created', (data) => {
        console.log('📦 Order created:', data);
        this.emit('order-created', data);
      });

      this.socket.on('order-status-updated', (data) => {
        console.log('📦 Order status updated:', data);
        this.emit('order-status-updated', data);
      });

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
    }
  };

  // Disconnect from WebSocket server
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  };

  // Subscribe to events
  on = (event, callback) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  };

  // Emit event to listeners
  emit = (event, data) => {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  };

  // Join admin room (for admin panel)
  joinAdminRoom = () => {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin-room');
      console.log('👨‍💼 Joined admin room');
    }
  };

  // Get connection status
  getConnectionStatus = () => {
    return this.isConnected;
  };
}

// Export singleton instance
export default new WebSocketService();

