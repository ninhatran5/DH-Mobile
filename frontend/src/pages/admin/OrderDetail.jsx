import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchorderdetails,
  updateOrderStatus,
  cancelOrder,
} from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import Swal from "sweetalert2";
import Pusher from 'pusher-js';

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
  const maxRetries = 3;

  const getUserId = useCallback(() => {
    if (order?.user_id) {
      return order.user_id.toString();
    }
    
    const userIdFromStorage = localStorage.getItem("userID");
    if (userIdFromStorage) {
      return userIdFromStorage;
    }
    
    const adminId = localStorage.getItem("adminId") || localStorage.getItem("admin_id");
    if (adminId) {
      return adminId;
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
    
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000); // Max 30s
    
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
      userIdSource: order?.user_id ? 'order_data' : (localStorage.getItem("userID") ? 'localStorage_userID' : 'localStorage_adminId')
    };
  }, [getUserId, orderId, order]);

  const initializePusher = useCallback(async () => {
    const userId = getUserId();
    
    try {
      setIsInitializing(true);
      setConnectionStatus('connecting');
      
      // Clear timeouts trước khi tạo mới
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

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
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        activityTimeout: 60000,
        pongTimeout: 30000,
        disableStats: true,
      });

      // Promise-based connection với timeout
      const connectionPromise = new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error('Connection timeout after 10 seconds'));
        }, 10000);

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

      // Channel subscription promise
      const subscriptionPromise = new Promise((resolve, reject) => {
        const subTimeout = setTimeout(() => {
          reject(new Error('Channel subscription timeout'));
        }, 5000);

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

      channel.bind('OrderUpdated', (data) => {
        if (data.order && data.order.order_id === parseInt(orderId)) {
          setLastUpdateTime(new Date().toISOString());
          dispatch(fetchorderdetails(orderId));
          
          setTimeout(() => {
            const activeItem = document.querySelector('.history-item.active');
            if (activeItem) {
              activeItem.classList.add('realtime-highlight');
              setTimeout(() => activeItem.classList.remove('realtime-highlight'), 2000);
            }
          }, 100);
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

  // **Fixed main effect với proper dependencies**
  useEffect(() => {
    const userId = getUserId();
    
    if (!userId || !orderId) {
      return;
    }

    // Thêm delay để tránh vòng lặp
    const initTimer = setTimeout(() => {
      initializePusher();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, [orderId, retryCount]);

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
        userId: userId ? '✅' : '❌ Missing',
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
        source: connectionDiagnostics.userIdSource,
        orderUserId: order?.user_id || 'N/A',
        availableStorageKeys: Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('user') || key.toLowerCase().includes('admin')
        )
      },
      orderInfo: {
        hasOrderData: !!order,
        orderId: orderId,
        orderUserId: order?.user_id || 'N/A',
        channelName: `orders.${userId}`
      }
    };
  }, [getUserId, orderId, pusher, orderChannel, retryCount, maxRetries, connectionDetails, connectionDiagnostics, order, isInitializing]);

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

    switch (connectionStatus) {
      case 'error':
      case 'failed':
        return { 
          icon: '❌', 
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
      default:
        return { 
          icon: '⚪', 
          text: 'Initializing...', 
          color: '#6c757d',
          bgColor: '#e2e3e5'
        };
    }
  }, [connectionStatus, isInitializing]);

  const showDiagnostics = useCallback(async () => {
    const diagnostics = await runDiagnostics();
    
    Swal.fire({
      title: '🔍 Connection Diagnostics',
      html: `
        <div style="text-align: left; font-family: monospace; font-size: 12px;">
          <h4>Environment:</h4>
          ${Object.entries(diagnostics.environment).map(([key, value]) => 
            `<div><strong>${key}:</strong> ${value}</div>`
          ).join('')}
          
          <h4>User Info:</h4>
          <div><strong>User ID:</strong> ${diagnostics.userInfo.userId || 'Not found'}</div>
          <div><strong>Source:</strong> ${diagnostics.userInfo.source}</div>
          <div><strong>Order User ID:</strong> ${diagnostics.userInfo.orderUserId}</div>
          <div><strong>Available Keys:</strong> ${diagnostics.userInfo.availableStorageKeys.join(', ') || 'None'}</div>
          
          <h4>Order Info:</h4>
          <div><strong>Has Order Data:</strong> ${diagnostics.orderInfo.hasOrderData ? 'Yes' : 'No'}</div>
          <div><strong>Order ID:</strong> ${diagnostics.orderInfo.orderId}</div>
          <div><strong>Channel Name:</strong> ${diagnostics.orderInfo.channelName}</div>
          
          <h4>Connection:</h4>
          <div><strong>Pusher State:</strong> ${diagnostics.connection.pusherState}</div>
          <div><strong>Channel State:</strong> ${diagnostics.connection.channelState}</div>
          <div><strong>Socket ID:</strong> ${diagnostics.connection.socketId}</div>
          <div><strong>Retry Count:</strong> ${diagnostics.connection.retryCount}/${diagnostics.connection.maxRetries}</div>
          <div><strong>Is Initializing:</strong> ${diagnostics.connection.isInitializing ? 'Yes' : 'No'}</div>
          <div><strong>Last Error:</strong> ${diagnostics.connection.lastError}</div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'OK',
      width: '800px'
    });
  }, [runDiagnostics]);

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
        
        <button 
          onClick={showDiagnostics}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Xem chi tiết kết nối"
        >
          🔍
        </button>
        
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
    lastUpdateTime,
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
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // **Memoized next status**
  const nextStatus = useMemo(() => getNextStatus(order?.status), [order?.status]);

  // **Updated handler functions với thông báo thành công**
  const handleUpdateStatus = useCallback(async () => {
    if (!order?.order_id || !nextStatus || nextStatus === order.status) return;
    
    setUpdating(true);
    try {
      await dispatch(updateOrderStatus({ orderId: order.order_id, status: nextStatus })).unwrap();
      
      // 🎉 Thêm thông báo thành công
      Swal.fire({
        title: 'Thành công!',
        text: `Đã cập nhật trạng thái đơn hàng sang "${nextStatus}"`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (e) {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
    }
    setUpdating(false);
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
      
      // 🎉 Thêm thông báo thành công cho việc hủy đơn
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
        description: 'Đơn hàng đã được đặt',
        priority: 1,
        timestamp: order.order_date
      },
      {
        key: 'confirmed',
        title: 'Đã xác nhận',
        icon: '✅',
        description: 'Xác nhận và chuẩn bị',
        priority: 2,
        timestamp: order.status === 'Đã xác nhận' ? (lastUpdateTime || new Date().toISOString()) : null
      },
      {
        key: 'shipping',
        title: 'Đang vận chuyển',
        icon: '🚚',
        description: 'Đang giao hàng',
        priority: 3,
        timestamp: order.status === 'Đang vận chuyển' ? (lastUpdateTime || new Date().toISOString()) : null
      },
      {
        key: 'delivered',
        title: 'Đã giao hàng',
        icon: '📦',
        description: 'Giao thành công',
        priority: 4,
        timestamp: order.status === 'Đã giao hàng' ? (lastUpdateTime || new Date().toISOString()) : null
      },
      {
        key: 'completed',
        title: 'Hoàn thành',
        icon: '🎉',
        description: 'Đơn hàng hoàn tất',
        priority: 5,
        timestamp: order.status === 'Hoàn thành' ? (lastUpdateTime || new Date().toISOString()) : null
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

  // ✅ BỎ LOADING - chỉ hiển thị nếu không có dữ liệu
  if (error) return <p className="order-detail-error">{error}</p>;
  if (!order && !loading) return <div>Không tìm thấy đơn hàng</div>;
  
  // Hiển thị nội dung ngay lập tức, không cần chờ loading
  return (
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
                <span className="status-returned-text">{order?.status || 'Đang tải...'}</span>
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
                <span className="summary-value">{order?.total_amount ? formatCurrency(order.total_amount) : 'Đang tải...'}</span>
              </div>
            
              <div className="summary-row final">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value highlight final-amount">{order?.total_amount ? formatCurrency(order.total_amount) : 'Đang tải...'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
