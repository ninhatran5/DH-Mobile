import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";

export default function useOrderRealtime({
  userId,
  orderId,
  onOrderUpdate,
  onReturnUpdate,
}) {
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const onReturnUpdateRef = useRef(onReturnUpdate);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const pusherRef = useRef(null);
  const channelsRef = useRef({ orderChannel: null, returnChannel: null });
  const retryTimeoutRef = useRef(null);
  const maxRetries = 3;

  useEffect(() => {
    onOrderUpdateRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    onReturnUpdateRef.current = onReturnUpdate;
  }, [onReturnUpdate]);

  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (channelsRef.current.orderChannel) {
      channelsRef.current.orderChannel.unbind_all();
      pusherRef.current?.unsubscribe(`orders.${userId}`);
    }
    if (channelsRef.current.returnChannel) {
      channelsRef.current.returnChannel.unbind_all();
      pusherRef.current?.unsubscribe(`order.${orderId}`);
    }
    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
    }
    
    channelsRef.current = { orderChannel: null, returnChannel: null };
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setIsInitializing(false);
  }, [userId, orderId]);

  const scheduleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      setConnectionStatus('failed');
      setError('Max retries reached');
      return;
    }
    
    const delay = Math.min(Math.pow(2, retryCount) * 1000, 10000); // Max 10s delay
    
    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount(prev => prev + 1);
    }, delay);
  }, [retryCount, maxRetries]);

  const initializeConnection = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setConnectionStatus('connecting');
    
    try {
      const userToken = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!userToken) {
        throw new Error('No authentication token found');
      }

      const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_BASE_URL}broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
        activityTimeout: 60000,
        pongTimeout: 30000,
      });

      pusherRef.current = pusher;

      // Wait for connection with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        pusher.connection.bind('connected', () => {
          clearTimeout(timeout);
          setConnectionStatus('connected');
          setIsConnected(true);
          setError(null);
          setRetryCount(0);
          setIsInitializing(false);
          resolve();
        });

        pusher.connection.bind('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Setup connection state handlers
      pusher.connection.bind('state_change', (states) => {
        if (states.current === 'disconnected' && isConnected) {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      });

      // Subscribe to channels
      const orderChannel = pusher.subscribe(`orders.${userId}`);
      channelsRef.current.orderChannel = orderChannel;

      orderChannel.bind('pusher:subscription_succeeded', () => {
      });

      // eslint-disable-next-line no-unused-vars
      orderChannel.bind('pusher:subscription_error', (error) => {
        setError('Failed to subscribe to order updates');
      });

      orderChannel.bind('OrderUpdated', (data) => {
        if (data.order && data.order.order_id == orderId) {
          setLastUpdate(new Date().toISOString());
          onOrderUpdateRef.current?.(data.order);
          
          // Add visual effect
          setTimeout(() => {
            const statusElements = document.querySelectorAll('.order-status-pending, .order-status-confirmed, .order-status-shipping, .order-status-shipped, .order-status-delivered');
            statusElements.forEach(el => {
              el.style.transition = 'all 0.3s ease';
              el.style.transform = 'scale(1.05)';
              el.style.boxShadow = '0 0 10px rgba(255, 136, 0, 0.5)';
              setTimeout(() => {
                el.style.transform = 'scale(1)';
                el.style.boxShadow = 'none';
              }, 1000);
            });
          }, 100);
        }
      });

      // Subscribe to return updates
      const returnChannel = pusher.subscribe(`order.${orderId}`);
      channelsRef.current.returnChannel = returnChannel;

      returnChannel.bind('pusher:subscription_succeeded', () => {
      });

      returnChannel.bind('order-return-updated', (data) => {
        setLastUpdate(new Date().toISOString());
        onReturnUpdateRef.current?.(data);
      });

    } catch (error) {
      setError(error.message);
      setConnectionStatus('failed');
      setIsInitializing(false);
      
      // Schedule retry if not max retries
      if (retryCount < maxRetries) {
        scheduleRetry();
      }
    }
  }, [userId, orderId, isInitializing, isConnected, retryCount, maxRetries, scheduleRetry]);

  useEffect(() => {
    if (!userId || !orderId) {
      setError('Missing userId or orderId');
      setConnectionStatus('failed');
      return;
    }

    if (!import.meta.env.VITE_PUSHER_KEY || !import.meta.env.VITE_PUSHER_CLUSTER) {
      setError('Missing Pusher configuration');
      setConnectionStatus('failed');
      return;
    }

    initializeConnection();
    return cleanup;
  }, [userId, orderId]);
  
  // Retry effect
  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries) {
      initializeConnection();
    }
  }, [retryCount, initializeConnection]);

  return {
    connectionStatus,
    isConnected,
    lastUpdate,
    error
  };
}
