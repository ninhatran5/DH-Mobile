import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchorderdetails,
  updateOrderStatus,
  cancelOrder,
} from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import "../../assets/admin/order-status-colors.css";
import Swal from "sweetalert2";
import Pusher from 'pusher-js';
import Loading from "../../components/Loading";
const ORDER_STATUS_OPTIONS = [
  "Chờ xác nhận",
  "Đã xác nhận", 
  "Đang vận chuyển",
  "Đã giao hàng",
  "Hoàn thành",
  "Đã hủy"
];

const getNextStatus = (current) => {
  const idx = ORDER_STATUS_OPTIONS.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_OPTIONS.length - 1) return null;
  if (current === "Đã hủy" || current === "Hoàn thành") return null;
  const next = ORDER_STATUS_OPTIONS[idx + 1];
  if (next === "Đã hủy") return null;
  return next;
};

const usePusherConnection = (orderId, order, dispatch) => {
  const [pusher, setPusher] = useState(null);
  const [orderChannel, setOrderChannel] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionDetails, setConnectionDetails] = useState({});
  const [isInitializing, setIsInitializing] = useState(false);
  
  const retryTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const maxRetries = 2; 

  const getUserId = useCallback(() => {
    // Only get user_id from the API order data
    if (order?.user_id) {
      return order.user_id.toString();
    }
    
    return null;
  }, [order?.user_id]);

  // **Fixed cleanup function**
  const cleanup = useCallback(() => {
    // Clear tất cả timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // Unsubscribe channel
    if (orderChannel) {
      orderChannel.unbind_all();
      const userId = getUserId();
      if (userId && pusher) {
        try {
          pusher.unsubscribe(`orders.${userId}`);
        } catch (e) {
          console.warn('Error unsubscribing:', e);
        }
      }
    }
    
    // Disconnect pusher
    if (pusher) {
      try {
        pusher.disconnect();
      } catch (e) {
        console.warn('Error disconnecting pusher:', e);
      }
    }
    
    // Reset states
    setIsRealtimeConnected(false);
    setPusher(null);
    setOrderChannel(null);
    setConnectionStatus('disconnected');
    setIsInitializing(false);
  }, [orderChannel, pusher, getUserId]);

  // **Fixed retry function với proper limits**
  const scheduleRetry = useCallback((attempt) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Kiểm tra nếu đã vượt quá max retries
    if (attempt >= maxRetries) {
      setConnectionStatus('failed');
      setIsInitializing(false);
      return;
    }
    
    const delay = Math.min(Math.pow(2, attempt) * 1000, 10000); // ⚡ Max 10s thay vì 30s
    
    retryTimeoutRef.current = setTimeout(() => {
      if (attempt < maxRetries) {
        setRetryCount(attempt + 1);
      }
    }, delay);
  }, [maxRetries]);

  // **Connection diagnostics - memoized**
  const connectionDiagnostics = useMemo(() => {
    const userId = getUserId();
    return {
      hasValidEnv: !!(import.meta.env.VITE_PUSHER_KEY && import.meta.env.VITE_PUSHER_CLUSTER),
      hasAdminToken: !!localStorage.getItem("adminToken"),
      hasUserId: !!userId,
      hasOrderId: !!orderId,
      hasOrderData: !!order,
      userId: userId,
      orderId: orderId,
      orderUserId: order?.user_id || 'N/A',
      userIdSource: 'api_order_data'
    };
  }, [getUserId, orderId, order]);

  const initializePusher = useCallback(async () => {
    const userId = getUserId();
    
    try {
      setIsInitializing(true);
      setConnectionStatus('connecting');
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // ⚡ Optimized Pusher configuration for faster connections
      const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        authEndpoint: `${import.meta.env.VITE_BASE_URL}broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        },
      });

      // ⚡ Optimized connection promise với shorter timeout
      const connectionPromise = new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('Connection timeout after 3 seconds'));
        }, 3000); // ⚡ Ultra-fast 3s timeout

        const handleConnected = () => {
          clearTimeout(connectionTimeout);
          pusherInstance.connection.unbind('connected', handleConnected);
          pusherInstance.connection.unbind('error', handleError);
          resolve();
        };

        const handleError = (error) => {
          clearTimeout(connectionTimeout);
          pusherInstance.connection.unbind('connected', handleConnected);
          pusherInstance.connection.unbind('error', handleError);
          reject(error);
        };

        pusherInstance.connection.bind('connected', handleConnected);
        pusherInstance.connection.bind('error', handleError);
      });

      // Wait for connection với timeout
      await connectionPromise;

      // Setup state change handlers sau khi connected
      pusherInstance.connection.bind('state_change', (states) => {
        setConnectionStatus(states.current);
        setConnectionDetails(prev => ({ 
          ...prev, 
          currentState: states.current,
          previousState: states.previous,
          stateChangeTime: new Date().toISOString()
        }));
      });

      pusherInstance.connection.bind('disconnected', () => {
        setIsRealtimeConnected(false);
        setConnectionDetails(prev => ({ 
          ...prev, 
          status: 'disconnected',
          disconnectedAt: new Date().toISOString()
        }));
      });

      // Setup channel subscription
      const channelName = `orders.${userId}`;
      const channel = pusherInstance.subscribe(channelName);

      // ⚡ Optimized channel subscription với shorter timeout
      const subscriptionPromise = new Promise((resolve, reject) => {
        const subTimeout = setTimeout(() => {
          reject(new Error('Channel subscription timeout'));
        }, 2000); // ⚡ Ultra-fast 2s subscription timeout

        const handleSubscriptionSuccess = () => {
          clearTimeout(subTimeout);
          channel.unbind('pusher:subscription_succeeded', handleSubscriptionSuccess);
          channel.unbind('pusher:subscription_error', handleSubscriptionError);
          resolve();
        };

        const handleSubscriptionError = (error) => {
          clearTimeout(subTimeout);
          channel.unbind('pusher:subscription_succeeded', handleSubscriptionSuccess);
          channel.unbind('pusher:subscription_error', handleSubscriptionError);
          reject(error);
        };

        channel.bind('pusher:subscription_succeeded', handleSubscriptionSuccess);
        channel.bind('pusher:subscription_error', handleSubscriptionError);
      });

      await subscriptionPromise;

      // ⚡ Ultra-optimized event handler với zero-delay UI updates
      channel.bind('OrderUpdated', (data) => {
        if (data.order && data.order.order_id === parseInt(orderId)) {
          setLastUpdateTime(new Date().toISOString());
          
          // 🚀 INSTANT status update from real-time data
          if (data.order.status) {
            dispatch({
              type: 'adminOrder/updateOrderFromRealtime',
              payload: data.order
            });
          }
          
          // 🚀 Immediate visual feedback - no delays
          const activeItem = document.querySelector('.history-item.active');
          const statusElements = document.querySelectorAll('[data-status]');
          
          if (activeItem) {
            activeItem.classList.add('realtime-highlight');
            setTimeout(() => activeItem.classList.remove('realtime-highlight'), 1200);
          }
          
          // 🚀 Update all status indicators immediately
          statusElements.forEach(el => {
            if (el.dataset.status === data.order.status) {
              el.classList.add('status-active', 'pulse-animation');
              setTimeout(() => el.classList.remove('pulse-animation'), 1000);
            }
          });
          
          // 🚀 Background data refresh - non-blocking
          setTimeout(() => {
            dispatch(fetchorderdetails(orderId));
          }, 0);
        }
      });

      setPusher(pusherInstance);
      setOrderChannel(channel);
      setIsRealtimeConnected(true);
      setRetryCount(0);
      setIsInitializing(false);
      
      setConnectionDetails(prev => ({ 
        ...prev, 
        status: 'connected',
        socketId: pusherInstance.connection.socket_id,
        connectedAt: new Date().toISOString(),
        lastError: null,
        userId: userId,
        userIdSource: connectionDiagnostics.userIdSource,
        channelSubscribed: true,
        channelName: channelName,
        subscribedAt: new Date().toISOString()
      }));

    } catch (error) {
      setConnectionStatus('failed');
      setIsRealtimeConnected(false);
      setIsInitializing(false);
      
      setConnectionDetails(prev => ({ 
        ...prev, 
        status: 'failed',
        lastError: error.message,
        failedAt: new Date().toISOString()
      }));
      
      // Auto retry với exponential backoff
      if (retryCount < maxRetries) {
        scheduleRetry(retryCount);
      }
    }
  }, [getUserId, connectionDiagnostics, retryCount, maxRetries, scheduleRetry, orderId, dispatch, connectionStatus, isInitializing]);

  // **Fixed main effect with proper dependencies**
  useEffect(() => {
    const userId = getUserId();
    
    if (!userId || !orderId) {
      setConnectionStatus('waiting_for_order_data');
      setConnectionDetails(prev => ({ 
        ...prev, 
        status: 'waiting_for_order_data', 
        lastError: !userId ? 'Waiting for order data to get user_id' : 'Missing orderId'
      }));
      return;
    }

    // Avoid initializing if already connected or initializing
    if (isRealtimeConnected || isInitializing) {
      return;
    }

    // ⚡ Zero delay initialization for maximum speed
    initializePusher(); // Execute immediately without any delay

    return () => {
      // Cleanup handled by initializePusher function
    };
  }, [orderId, getUserId]); // Remove retryCount from dependencies to avoid infinite loops

  // Separate effect for retry logic
  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries && !isInitializing && !isRealtimeConnected) {
      initializePusher();
    }
  }, [retryCount, maxRetries, isInitializing, isRealtimeConnected, initializePusher]);

  // **Manual reconnection**
  const forceReconnect = useCallback(() => {
    if (retryCount < maxRetries && !isInitializing) {
      cleanup();
      setTimeout(() => setRetryCount(prev => prev + 1), 500);
    } else {
      Swal.fire('Lỗi', 'Đã vượt quá số lần thử lại tối đa hoặc đang kết nối', 'error');
    }
  }, [retryCount, maxRetries, cleanup, isInitializing]);

  // **Enhanced diagnostics function**
  const runDiagnostics = useCallback(async () => {
    const userId = getUserId();
    
    return {
      timestamp: new Date().toISOString(),
      environment: {
        VITE_PUSHER_KEY: import.meta.env.VITE_PUSHER_KEY ? '✅' : '❌ Missing',
        VITE_PUSHER_CLUSTER: import.meta.env.VITE_PUSHER_CLUSTER ? '✅' : '❌ Missing',
        VITE_BASE_URL: import.meta.env.VITE_BASE_URL ? '✅' : '❌ Missing',
        adminToken: localStorage.getItem("adminToken") ? '✅' : '❌ Missing',
        userId: userId ? '✅' : '❌ Missing (from API order data)',
        orderId: orderId ? '✅' : '❌ Missing',
      },
      connection: {
        pusherState: pusher?.connection.state || 'not_initialized',
        channelState: orderChannel ? 'subscribed' : 'not_subscribed',
        retryCount: retryCount,
        maxRetries: maxRetries,
        socketId: connectionDetails.socketId || 'N/A',
        lastError: connectionDetails.lastError || 'None',
        isInitializing: isInitializing
      },
      userInfo: {
        userId: userId,
        source: 'api_order_data',
        orderUserId: order?.user_id || 'N/A'
      },
      orderInfo: {
        hasOrderData: !!order,
        orderId: orderId,
        orderUserId: order?.user_id || 'N/A',
        channelName: `orders.${userId}`
      }
    };
  }, [getUserId, orderId, pusher, orderChannel, retryCount, maxRetries, connectionDetails, order, isInitializing]);

  return {
    connectionStatus,
    isRealtimeConnected,
    lastUpdateTime,
    retryCount,
    maxRetries,
    forceReconnect,
    runDiagnostics,
    connectionDetails,
    isInitializing
  };
};

const RealtimeStatusIndicator = React.memo(({
  connectionStatus,
  isRealtimeConnected,
  lastUpdateTime,
  retryCount,
  maxRetries,
  forceReconnect,
  runDiagnostics,
  formatDate,
  isInitializing
}) => {
  const getStatusConfig = useMemo(() => {
    if (isInitializing) {
      return { 
        icon: '⚙️', 
        text: 'Initializing...', 
        color: '#17a2b8',
        bgColor: '#d1ecf1'
      };
    }

    if (isRealtimeConnected) {
      return { 
        icon: '🟢', 
        text: 'Live', 
        color: '#28a745',
        bgColor: '#d4edda'
      };
    }

    switch (connectionStatus) {
      case 'connecting':
        return { 
          icon: '🟡', 
          text: 'Connecting...', 
          color: '#ffc107',
          bgColor: '#fff3cd'
        };
      case 'error':
      case 'failed':
        return { 
          icon: '🔴', 
          text: 'Error', 
          color: '#dc3545',
          bgColor: '#f8d7da'
        };
      case 'timeout':
        return { 
          icon: '⏰', 
          text: 'Timeout', 
          color: '#fd7e14',
          bgColor: '#ffeaa7'
        };
      case 'disconnected':
        return { 
          icon: '⚫', 
          text: 'Offline', 
          color: '#6c757d',
          bgColor: '#e2e3e5'
        };
      default:
        return { 
          icon: '⚪', 
          text: 'Initializing...', 
          color: '#6c757d',
          bgColor: '#e2e3e5'
        };
    }
  }, [connectionStatus, isInitializing, isRealtimeConnected]);



  const canRetry = ['error', 'failed', 'timeout'].includes(connectionStatus) && 
                   retryCount < maxRetries && 
                   !isInitializing;

  return (
    <div className="realtime-status" style={{ marginLeft: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          className="realtime-indicator"
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: getStatusConfig.bgColor,
            border: `1px solid ${getStatusConfig.color}`,
            color: getStatusConfig.color,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{getStatusConfig.icon}</span>
          <span>{getStatusConfig.text}</span>
          {retryCount > 0 && (
            <span style={{ fontSize: '10px' }}>({retryCount}/{maxRetries})</span>
          )}
        </div>
        
       
        
        {canRetry && (
          <button 
            onClick={forceReconnect}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Thử kết nối lại"
          >
            🔄
          </button>
        )}
      </div>
      
      {lastUpdateTime && isRealtimeConnected && (
        <div style={{ 
          fontSize: '10px', 
          color: '#666', 
          marginTop: '2px',
          textAlign: 'right'
        }}>
          Cập nhật: {formatDate(lastUpdateTime)}
        </div>
      )}
    </div>
  );
});

RealtimeStatusIndicator.displayName = 'RealtimeStatusIndicator';

// **Main Component - Optimized**
const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useSelector((state) => state.adminOrder);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const {
    connectionStatus,
    isRealtimeConnected,
    lastUpdateTime,
    retryCount,
    maxRetries,
    forceReconnect,
    runDiagnostics,
    isInitializing
  } = usePusherConnection(orderId, order, dispatch);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchorderdetails(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order?.status) {
      setNewStatus(order.status);
    }
  }, [order?.status]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    
    // Handle DD/MM/YYYY HH:mm:ss format
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      
      // Convert DD/MM/YYYY to MM/DD/YYYY for JavaScript Date constructor
      const isoDateString = `${month}/${day}/${year}${timePart ? ' ' + timePart : ''}`;
      const date = new Date(isoDateString);
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Handle standard ISO format or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const getStatusClass = useCallback((status) => {
    const s = status?.trim().toLowerCase();
    switch (s) {
      case "chờ xác nhận":
        return "admin_order-status-pending";
      case "đã xác nhận":
        return "admin_order-status-confirmed";
      case "đang vận chuyển":
        return "admin_order-status-shipping";
      case "đã giao hàng":
        return "admin_order-status-delivered";
      case "hoàn thành":
        return "admin_order-status-success";
      case "đã hủy":
        return "admin_order-status-cancel";
      case "yêu cầu hoàn hàng":
        return "admin_order-status-pending";
      case "đã chấp thuận":
        return "admin_order-status-confirmed";
      case "đang xử lý":
        return "admin_order-status-shipping";
      case "đã hoàn tiền":
        return "admin_order-status-success";
      case "đã trả hàng":
        return "admin_order-status-success";
      case "đã từ chối":
        return "admin_order-status-cancel";
      default:
        return "admin_order-status-default";
    }
  }, []);

  // **Memoized next status**
  const nextStatus = useMemo(() => getNextStatus(order?.status), [order?.status]);

  // **Updated handler functions với thông báo thành công**
  const handleUpdateStatus = useCallback(async () => {
    if (!order?.order_id || !nextStatus || nextStatus === order.status) return;

    const confirmResult = await Swal.fire({
      title: "Xác nhận cập nhật trạng thái",
      text: `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng sang "${nextStatus}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    // ⚡ INSTANT UI UPDATE - Update UI immediately without any delays
    const previousStatus = order.status;
    const optimisticOrder = { ...order, status: nextStatus };
    
    // 🚀 Update Redux store immediately for instant UI feedback
    dispatch({
      type: 'adminOrder/updateOrderStatusOptimistic',
      payload: { orderId: order.order_id, status: nextStatus }
    });

    // 🚀 Update local state immediately
    setNewStatus(nextStatus);
    
    // 🚀 Instant visual feedback
    const statusElement = document.querySelector(`[data-status="${previousStatus}"]`);
    if (statusElement) {
      statusElement.classList.add('status-updating');
    }

    // 🚀 Show immediate success notification
    const successToast = Swal.fire({
      title: "Đang cập nhật...",
      text: `Trạng thái đang được cập nhật sang "${nextStatus}".`,
      icon: "info",
      timer: 800,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      timerProgressBar: true,
    });

    // 🔥 Background API call - non-blocking
    setTimeout(async () => {
      try {
        setUpdating(true);
        await dispatch(updateOrderStatus({ orderId: order.order_id, status: nextStatus })).unwrap();
        
        // 🎉 Quick success confirmation
        Swal.fire({
          text: `Trạng thái đã cập nhật thành công.`,
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } catch (e) {
        console.error('Update status error:', e);
        
        // Revert optimistic update
        dispatch({
          type: 'adminOrder/revertOrderStatusOptimistic',
          payload: { orderId: order.order_id, status: previousStatus }
        });
        setNewStatus(previousStatus);
        
        Swal.fire({
          title: "❌ Lỗi", 
          text: "Không thể cập nhật trạng thái. Đã hoàn tác.", 
          icon: "error",
          timer: 2000,
          toast: true,
          position: "top-end"
        });
        
        // Force refresh data to ensure consistency
        dispatch(fetchorderdetails(order.order_id));
      } finally {
        setUpdating(false);
      }
    }, 0); // Execute immediately but asynchronously

  }, [order?.order_id, order?.status, nextStatus, dispatch]);

  const handleCancelOrder = useCallback(async () => {
    if (!order?.order_id) return;

    const { value: reason } = await Swal.fire({
      title: "Nhập lý do huỷ đơn hàng:",
      input: "text",
      inputPlaceholder: "Nhập lý do...",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      inputValidator: (value) => !value && 'Vui lòng nhập lý do!'
    });

    if (!reason) return;

    setUpdating(true);
    try {
      await dispatch(cancelOrder({ orderId: order.order_id, cancel_reason: reason })).unwrap();
      
      Swal.fire({
        title: 'Đã hủy đơn hàng!',
        text: 'Đơn hàng đã được hủy thành công',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (e) {
      Swal.fire("Lỗi", "Không thể huỷ đơn hàng.", "error");
    }
    setUpdating(false);
  }, [order?.order_id, dispatch]);

  const statusMilestones = useMemo(() => {
    if (!order?.status) return [];

    if (order.status === "Đã hủy") {
      return [
        {
          key: 'cancelled',
          title: 'Đã hủy',
          icon: '❌',
          description: order.cancel_reason ? `Đơn hàng đã bị hủy. Lý do: ${order.cancel_reason}` : 'Đơn hàng đã bị hủy',
          priority: 1,
          isCompleted: true,
          isActive: false,
          isPending: false,
          isCancelled: true,
          timestamp: lastUpdateTime || new Date().toISOString()
        }
      ];
    }

    const normalMilestones = [
      {
        key: 'pending',
        title: 'Chờ xác nhận',
        icon: '📋',
        description: 'Chờ xác nhận',
        priority: 1,
      },
      {
        key: 'confirmed',
        title: 'Đã xác nhận',
        icon: '✅',
        description: 'Đã xác nhận ',
        priority: 2,
        timestamp: order.status === 'Đã xác nhận' ? (lastUpdateTime || new Date().toISOString()) : null
      },
      {
        key: 'shipping',
        title: 'Đang vận chuyển',
        icon: '🚚',
        description: 'Đang vận chuyển',
        priority: 3,
        timestamp: order.status === 'Đang vận chuyển' ? (lastUpdateTime || new Date().toISOString()) : null
      },
      {
        key: 'delivered',
        title: 'Đã giao hàng',
        icon: '📦',
        description: 'Đã giao hàng',
        priority: 4,
      },
      {
        key: 'completed',
        title: 'Hoàn thành',
        icon: '🎉',
        description: 'Hoàn thành',
        priority: 5,
      }
    ];

    const statusToPriority = {
      'chờ xác nhận': 1,
      'đã xác nhận': 2,
      'đang vận chuyển': 3,
      'đã giao hàng': 4,
      'hoàn thành': 5
    };

    const currentPriority = statusToPriority[order.status?.toLowerCase()] || 1;

    return normalMilestones.map(milestone => ({
      ...milestone,
      isCompleted: milestone.priority < currentPriority,
      isActive: milestone.priority === currentPriority,
      isPending: milestone.priority > currentPriority,
      isCancelled: false
    }));
  }, [order?.status, order?.cancel_reason, order?.order_date, lastUpdateTime]);

  if (error) return <p className="order-detail-error">{error}</p>;
  if (!order && !loading) return <div>Không tìm thấy đơn hàng</div>;
  
  return (
    <>
      {updating && <Loading />}
      <div className="detail-order-return-container">
      <button className="back-button" onClick={() => navigate("/admin/orders")}>
        <svg width="24" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Quay lại danh sách đơn hàng
      </button>

      <div className="main-content">
        {/* Left Column */}
        <div className="left-column">
          {/* Order Information */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📋</span>
                <h2 className="card-title">Thông tin đơn hàng</h2>
              </div>
              <div className="order-code">
                Mã đơn: <span className="fw-bold">{order?.order_code || 'Đang tải...'}</span>
              </div>
            </div>
            
            <div className="order-info-grid">
              <div className="info-item">
                <span className="info-label">Khách hàng</span>
                <span className="info-value">{order?.customer || 'Đang tải...'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Ngày đặt hàng</span>
                <span className="info-value">{order?.order_date ? formatDate(order.order_date) : 'Đang tải...'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{order?.email || "Chưa cập nhật"}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Số điện thoại</span>
                <span className="info-value">{order?.phone || "Chưa cập nhật"}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Tổng tiền</span>
                <span className="info-value highlight">{order?.total_amount ? formatCurrency(order.total_amount) : 'Đang tải...'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label mb-2">Phương thức thanh toán</span>
                <div className="payment-method">
                  <span className="payment-icon"></span>
                  {order?.payment_method?.join(" - ") || "COD"}
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-label">Trạng thái đơn hàng</span>
                <span className={getStatusClass(order?.status)}>{order?.status || 'Đang tải...'}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Trạng thái thanh toán</span>
                <span className="status-returned-text">{order?.payment_status || 'Đang tải...'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📍</span>
                <h2 className="card-title">Địa chỉ giao hàng</h2>
              </div>
            </div>
            <div className="address-content">
              <p>{order?.address || "Chưa cập nhật"}</p>
            </div>
          </div>

          {/* Products */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📦</span>
                <h2 className="card-title">Sản phẩm đã đặt</h2>
              </div>
            </div>
            
            {order?.products?.map((product, index) => {
              const storage = product.variant_attributes?.find((attr) => attr.attribute_name === "Bộ nhớ");
              const color = product.variant_attributes?.find((attr) => attr.attribute_name === "Màu sắc");
              
              return (
                <div key={index} className="product-card">
                  <img 
                    src={product.product_image} 
                    alt={product.product_name}
                    className="product-image"
                  />
                  <div className="product-details">
                    <div className="product-name">{product.product_name}</div>
                    <div className="productdetails1">
                      <div className="product-specs">
                        <span>📱 Bộ nhớ: {storage?.attribute_value || "128GB"}</span>
                        <span>🎨 Màu sắc: {color?.attribute_value || "White Titanium"}</span>
                      </div>
                      <div className="product-price-info">
                        <span className="product-quantity">Số lượng: {product.quantity}</span>
                        <span className="product-unit-price">Đơn giá: {formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="product-total">
                    {formatCurrency(product.subtotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📝</span>
                <h2 className="card-title">Lịch sử cập nhật đơn hàng</h2>
              </div>
            </div>
            
            <div className="history-section">
              {statusMilestones.map((milestone) => (
                <div key={milestone.key} className={`history-item ${
                  milestone.isCancelled ? 'cancelled' :
                  milestone.isCompleted ? 'completed' : 
                  milestone.isActive ? 'active' : 'pending'
                }`}>
                  <div className="history-icon">
                    <span>
                      {milestone.isCompleted && !milestone.isCancelled ? '✓' : milestone.icon}
                    </span>
                  </div>
                  <div className="history-content">
                    <div className="history-description">
                      {milestone.description}
                    </div>
                    {milestone.timestamp && (
                      <div className="history-timestamp">
                        {formatDate(milestone.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">⚡</span>
                <h2 className="card-title">Thao tác nhanh</h2>
              </div>
            </div>
            
            <div className="action-buttons">
              {order?.status === "Chờ xác nhận" && (
                <>
                  <button 
                    className="action-button button-primary" 
                    onClick={handleUpdateStatus}
                    disabled={updating}
                  >
                    {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đã xác nhận"'}
                  </button>
                  
                  <button 
                    className="action-button button-danger" 
                    onClick={handleCancelOrder}
                    disabled={updating}
                  >
                    {updating ? 'Đang xử lý...' : 'Huỷ đơn hàng'}
                  </button>
                </>
              )}

              {order?.status === "Đã xác nhận" && (
                <button 
                  className="action-button button-primary" 
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đang vận chuyển"'}
                </button>
              )}

              {order?.status === "Đang vận chuyển" && (
                <button 
                  className="action-button button-primary" 
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đã giao hàng"'}
                </button>
              )}

              {order?.status === "Đã giao hàng" && (
                <div className="success-message">
                  <p>Giao hàng thành công</p>
                </div>
              )}

              {order?.status === "Hoàn thành" && (
                <div className="success-message">
                  <p>Đơn hàng đã hoàn thành</p>
                </div>
              )}

              {order?.status === "Đã hủy" && (
                <div className="cancelled-message">
                  <p>Đơn hàng đã bị hủy</p>
                </div>
              )}

              {!["Chờ xác nhận", "Đã xác nhận", "Đang vận chuyển", "Đã giao hàng", "Hoàn thành", "Đã hủy"].includes(order?.status) && (
                <div className="no-actions">
                  <p>Không có thao tác khả dụng cho trạng thái: {order?.status || 'Đang tải...'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📊</span>
                <h2 className="card-title">Tổng kết đơn hàng</h2>
              </div>
            </div>
            
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{order?.total_amount && (Number(order.voucher_discount) > 0 || Number(order.rank_discount) > 0) ? formatCurrency((Number(order.total_amount) + Number(order.voucher_discount || 0) + Number(order.rank_discount || 0))) : (order?.total_amount ? formatCurrency(order.total_amount) : 'Đang tải...')}</span>
              </div>
              
              {Number(order?.voucher_discount) > 0 && (
                <div className="summary-row discount">
                  <span className="summary-label">Giảm giá voucher:</span>
                  <span className="summary-value discount-amount">- {formatCurrency(order.voucher_discount)}</span>
                </div>
              )}
              
              {Number(order?.rank_discount) > 0 && (
                <div className="summary-row discount">
                  <span className="summary-label">Giảm giá theo hạng:</span>
                  <span className="summary-value discount-amount">- {formatCurrency(order.rank_discount)}</span>
                </div>
              )}
            
              <div className="summary-row final">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value highlight final-amount">{order?.total_amount ? formatCurrency(order.total_amount) : 'Đang tải...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrderDetails;
