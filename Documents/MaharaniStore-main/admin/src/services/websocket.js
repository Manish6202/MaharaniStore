import io from 'socket.io-client';
import { WS_BASE_URL } from '../config/api';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect = () => {
    try {
      this.socket = io(WS_BASE_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Admin WebSocket connected');
        this.isConnected = true;

        // Join admin room
        this.socket.emit('join-admin-room');
        console.log('👨‍💼 Joined admin room');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Admin WebSocket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Admin WebSocket connection error:', error);
        this.isConnected = false;
      });

      // Listen for new orders
      this.socket.on('new-order', (data) => {
        console.log('📦 New order received:', data);
        this.emit('new-order', data);
      });

      // Listen for order status changes
      this.socket.on('order-status-changed', (data) => {
        console.log('📦 Order status changed:', data);
        this.emit('order-status-changed', data);
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
      console.log('🔌 Admin WebSocket disconnected');
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

  // Get connection status
  getConnectionStatus = () => {
    return this.isConnected;
  };
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;

