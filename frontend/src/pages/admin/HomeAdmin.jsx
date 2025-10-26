/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../../assets/admin/HomeAdmin.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo2.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "../../slices/NotificationSlice";
import {
  fetchRefundNotifications,
  markRefundNotificationRead,
  markReturnNotificationRead,
} from "../../slices/NotificationSlice";
import Thongbao from "../../assets/sound/thongbaomuahang.mp3";
import HoanHang from "../../assets/sound/yeucauhoanhoangmoinhat.mp3";
import { fetchProfileAdmin } from "../../slices/adminProfile";
import Swal from "sweetalert2";
import Pusher from "pusher-js";
const sidebarCollapsedStyles = {
  submenu: {
    position: "absolute",
    left: "100%",
    top: "0",
    width: "200px",
    background: "var(--admin_dh-card-bg)",
    borderRadius: "var(--admin_dh-radius-sm)",
    boxShadow: "var(--admin_dh-box-shadow-hover)",
    border: "1px solid var(--admin_dh-border)",
    padding: "8px 0",
    zIndex: 1050,
  },
};

const Homeadmin = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotificationDot, setShowNotificationDot] = useState(true);
  const [isSoundEnabled, setSoundEnabled] = useState(true);
  const location = useLocation();
  const sidebarCollapseRef = useRef(null);
  const sidebarOpenRef = useRef(null);
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.adminNotification);
  const { adminProfile } = useSelector((state) => state.adminProfile);
  const checkRole = adminProfile?.user?.role;

  // Audio và tracking refs
  const audioRef = useRef(null);
  const hoanHangAudioRef = useRef(null);
  const processedNotifications = useRef(new Set()); // Track tất cả thông báo đã xử lý
  const lastNotificationCount = useRef(0); // Track số lượng thông báo cuối cùng
  const globalNotificationLock = useRef(false); // Global lock cho tất cả notification processing
  const soundPlayTimeout = useRef(null); // Timeout để debounce sound

  // Realtime return notification states
  const [returnNotifications, setReturnNotifications] = useState([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);

  // Số lượng thông báo chưa đọc - bao gồm cả thông báo hoàn hàng realtime
  const unreadCount = useMemo(() => {
    // Thông báo thường (không bao gồm refund từ API)
    const regularUnread = notifications.filter((n) => n.is_read === 0 && n.type !== 'refund').length;
    
    // Thông báo hoàn hàng từ API (chỉ lấy lần đầu)
    const apiRefundUnread = notifications.filter((n) => n.is_read === 0 && n.type === 'refund').length;
    
    // Thông báo hoàn hàng realtime
    const realtimeReturnUnread = returnNotifications.filter(
      (n) => n.is_read === 0
    ).length;
    
    return regularUnread + apiRefundUnread + realtimeReturnUnread;
  }, [notifications, returnNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (storedSidebarState !== null) {
      const collapsed = storedSidebarState === "true";
      setIsSidebarCollapsed(collapsed);
      if (window.innerWidth > 768) {
        setIsSidebarActive(!collapsed);
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarActive(false);
      } else {
        setIsSidebarActive(!isSidebarCollapsed);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarActive(false);
    }
  }, [location]);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDarkMode);

    const savedSoundPreference = localStorage.getItem("notificationSound");
    if (savedSoundPreference !== null) {
      setSoundEnabled(savedSoundPreference === "true");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Initial fetch - CHỈ LẤY THÔNG BÁO THƯỜNG
    dispatch(fetchNotifications());
    
    // Chỉ fetch thông báo hoàn hàng ban đầu nếu không phải role sale
    if (checkRole && checkRole !== "sale") {
      dispatch(fetchRefundNotifications());
    }

    // API polling for regular notifications
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
      // KHÔNG GỊI fetchRefundNotifications() - chỉ dùng realtime
    }, 10000); // Tăng thời gian từ 2s lên 10s

    return () => clearInterval(interval);
  }, [dispatch, checkRole]);

  // Singleton notification handler - chỉ cho phép 1 notification được xử lý tại một thời điểm
  const playNotificationSound = useCallback(
    (type, message = "", source = "unknown") => {
      // Kiểm tra nếu âm thanh bị tắt
      if (!isSoundEnabled) {
        return;
      }

      // Kiểm tra nếu đang có lock - TUYỆT ĐỐI KHÔNG CHO PHÉP
      if (globalNotificationLock.current) {
        return;
      }

      // Đặt lock NGAY LẬP TỨC
      globalNotificationLock.current = true;

      try {
        if (type === 'refund') {
          // Phát MP3 cho hoàn hàng
          if (hoanHangAudioRef.current) {
            hoanHangAudioRef.current.currentTime = 0;
            hoanHangAudioRef.current.play().catch((error) => {
              console.warn('Không thể phát âm thanh hoàn hàng:', error);
            });
          }
        } else {
          // Phát MP3 cho đơn hàng thường
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
              console.warn('Không thể phát âm thanh đơn hàng:', error);
            });
          }
        }
        
        // Giải phóng lock sau khi âm thanh phát (delay 2 giây để đảm bảo)
        setTimeout(() => {
          globalNotificationLock.current = false;
        }, 2000);
        
      } catch (error) {
        console.error('Lỗi phát âm thanh:', error);
        globalNotificationLock.current = false;
      }

      // Emergency timeout để giải phóng lock (10 giây)
      setTimeout(() => {
        if (globalNotificationLock.current) {
          globalNotificationLock.current = false;
        }
      }, 10000);
    }, 
    [isSoundEnabled]
  );



  // Xử lý thông báo từ API (không bao gồm realtime) - CHỈ CHO THÔNG BÁO THƯỜNG
  useEffect(() => {
    // Chỉ đếm thông báo thường (không phải refund)
    const currentUnreadCount = notifications.filter(
      (n) => n.is_read === 0 && n.type !== 'refund'
    ).length;
    
    const totalUnreadCount = unreadCount; // Sử dụng unreadCount đã tính toán

    setShowNotificationDot(totalUnreadCount > 0);

    // Chỉ xử lý khi có thông báo THƯỜNG mới (tăng số lượng)
    if (currentUnreadCount > lastNotificationCount.current) {
      // Hiển thị toast
      toast.info("Bạn có thông báo mới!", {
        position: "top-right",
        autoClose: 4000,
        closeButton: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Lấy thông báo THƯỜNG mới chưa được xử lý
      const unreadNotifications = notifications.filter((n) => n.is_read === 0 && n.type !== 'refund');
      const newNotifications = unreadNotifications.filter((notification) => {
        const notificationId = notification.notification_id;
        return (
          notificationId && !processedNotifications.current.has(notificationId)
        );
      });

      if (newNotifications.length > 0) {
        // Đánh dấu đã xử lý ngay lập tức
        newNotifications.forEach((notification) => {
          const notificationId = notification.notification_id;
          if (notificationId) {
            processedNotifications.current.add(notificationId);
          }
        });

        // Chỉ phát âm thanh cho đơn hàng thường
        playNotificationSound("order", "", "API-useEffect");
      }
    }

    lastNotificationCount.current = currentUnreadCount;
  }, [notifications, unreadCount, playNotificationSound]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);

    if (window.innerWidth > 768) {
      setIsSidebarActive(!newState);
    }

    if (sidebarCollapseRef.current) {
      sidebarCollapseRef.current.classList.add("admin_dh-active");
      setTimeout(() => {
        if (sidebarCollapseRef.current) {
          sidebarCollapseRef.current.classList.remove("admin_dh-active");
        }
      }, 500);
    }
  };

  const toggleMobileSidebar = () => {
    const newState = !isSidebarActive;
    setIsSidebarActive(newState);

    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(!newState);
    }

    if (sidebarOpenRef.current) {
      sidebarOpenRef.current.classList.add("admin_dh-active");
      setTimeout(() => {
        if (sidebarOpenRef.current) {
          sidebarOpenRef.current.classList.remove("admin_dh-active");
        }
      }, 500);
    }
  };

  const handleContentClick = () => {
    // Chỉ đóng sidebar trên thiết bị di động
    if (window.innerWidth <= 768 && isSidebarActive) {
      setIsSidebarActive(false);
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? "" : menu);
  };

  const isDropdownActive = (menu) => activeDropdown === menu;

  const handleNotificationClick = (e) => {
    e.preventDefault();
    setShowNotificationDot(false);
    const notificationBell = e.currentTarget.querySelector(".bi-bell");
    if (notificationBell) {
      notificationBell.classList.remove("admin_dh-bell-ring");
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminID");
        localStorage.removeItem("token");
        localStorage.removeItem("userID");
        toast.success("Đăng xuất thành công");
        navigate("/AdminLogin", { replace: true });
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
      }
    }
  };

  const handleMarkAsRead = async () => {
    try {
      // Đánh dấu tất cả thông báo thường đã đọc
      await dispatch(markNotificationsRead()).unwrap();

      // Lấy tất cả thông báo hoàn hàng từ API chưa đọc
      const unreadRefundNotifications = notifications.filter(
        (n) => n.type === "refund" && n.is_read === 0
      );

      // Đánh dấu từng thông báo hoàn hàng từ API đã đọc
      const refundPromises = unreadRefundNotifications.map((notification) => {
        if (notification.return_notification_id) {
          return dispatch(
            markRefundNotificationRead(notification.return_notification_id)
          );
        }
        return Promise.resolve();
      });

      // Đánh dấu tất cả thông báo hoàn hàng realtime đã đọc
      const realtimeRefundPromises = returnNotifications
        .filter(n => n.is_read === 0)
        .map(notification => markReturnNotificationAsRead(notification.id));

      // Chờ tất cả thông báo được đánh dấu đã đọc
      await Promise.all([...refundPromises, ...realtimeRefundPromises]);

      setShowNotificationDot(false);
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      // Vẫn ẩn dot ngay cả khi có lỗi để tránh trạng thái không nhất quán
      setShowNotificationDot(false);
    }
  };

  const handleNotificationItemClick = (noti) => {
    // Mark notification as read
    if (noti.is_read !== 1) {
      if (noti.type === "refund" && noti.return_notification_id) {
        // For refund notifications, use the return_notification_id to mark as read
        dispatch(markRefundNotificationRead(noti.return_notification_id));
      } else if (noti.notification_id) {
        // For regular notifications
        dispatch(markNotificationRead(noti.notification_id));
      }
    }

    // Navigate to appropriate detail page
    if (noti.type === "refund") {
      // For refund notifications, navigate to return request detail using return_request.return_id
      if (noti.return_request && noti.return_request.return_id) {
        navigate(`/admin/detailorderreturn/${noti.return_request.return_id}`);
      } else if (noti.order_id) {
        // Fallback to order detail if no return_request.return_id
        navigate(`/admin/orderdetail/${noti.order_id}`);
      }
    } else if (noti.order_id) {
      // For regular order notifications, navigate to order detail
      navigate(`/admin/orderdetail/${noti.order_id}`);
    }
  };

  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setSoundEnabled(newSoundState);
    localStorage.setItem("notificationSound", newSoundState);
  };

  useEffect(() => {
    dispatch(fetchProfileAdmin());
  }, [dispatch]);

  const setupReturnNotificationsRealtime = useCallback(() => {
    // Cleanup existing connection safely
    if (pusherRef.current) {
      try {
        if (channelRef.current) {
          channelRef.current.unbind_all();
          channelRef.current = null;
        }
        
        // Only unsubscribe if connection is still active
        if (pusherRef.current.connection.state === 'connected') {
          pusherRef.current.unsubscribe("private-admin.notifications");
        }
        
        pusherRef.current.disconnect();
        pusherRef.current = null;
      } catch (error) {
        pusherRef.current = null;
        channelRef.current = null;
      }
    }

    setConnectionStatus("connecting");

    try {
      // Initialize Pusher with proper config
      const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_BASE_URL_REAL_TIME}/broadcasting/auth`,
        auth: {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    Accept: "application/json",
  },
}

      });

      pusherRef.current = pusher;

      // Connection event handlers
      pusher.connection.bind("connecting", () => {
        setConnectionStatus("connecting");
      });

      pusher.connection.bind("connected", () => {
        setConnectionStatus("connected");
        setIsRealtimeConnected(true);
      });

      pusher.connection.bind("disconnected", () => {
        setConnectionStatus("disconnected");
        setIsRealtimeConnected(false);
      });

      pusher.connection.bind("error", (error) => {
        setConnectionStatus("failed");
        setIsRealtimeConnected(false);
      });

      pusher.connection.bind("state_change", (states) => {
        // State change tracking without logging
      });

      // Subscribe to private channel
      const channel = pusher.subscribe("private-admin.notifications");
      channelRef.current = channel;

      // Channel subscription handlers
      channel.bind('pusher:subscription_succeeded', () => {
        // Successfully subscribed
      });

      channel.bind('pusher:subscription_error', (error) => {
        // Channel subscription error
      });

      // Listen for ReturnNotificationCreated events - use full event name
      channel.bind('App\\Events\\ReturnNotificationCreated', (eventData) => {
        // Extract the actual data from the event structure
        const data = eventData.data || eventData;
        
        // Validate required fields
        if (!data || !data.id || !data.message) {
          return;
        }
        
        const newNotification = {
          id: data.id,
          order_id: data.order_id,
          return_request_id: data.return_request_id,
          message: data.message,
          is_read: data.is_read || 0,
          created_at: data.created_at,
          type: "refund",
          return_notification_id: data.id,
        };

        // Add to realtime notifications with force update
        setReturnNotifications((prevNotifications) => {
          // Check for duplicates
          const exists = prevNotifications.some(n => n.id === newNotification.id);
          if (exists) {
            return prevNotifications;
          }
          
          const updatedNotifications = [newNotification, ...prevNotifications];
          return updatedNotifications;
        });

        // Show toast notification
        toast.info(
          <div>
            <strong>Thông báo hoàn hàng mới</strong>
            <br />
            <small>{data.message}</small>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );

        // Play sound if enabled
        if (isSoundEnabled) {
          setTimeout(() => {
            playNotificationSound("refund", data.message, "realtime-pusher");
          }, 300);
        }
      });

      // Listen to all channel events for debugging if needed
      channel.bind_global((event, data) => {
        // Global event listener
      });

    } catch (error) {
      setConnectionStatus("failed");
    }
  }, [isSoundEnabled, playNotificationSound]);

  // Setup realtime connection when admin profile is ready
  useEffect(() => {
    let isActive = true; // Flag to prevent setup after cleanup
    
    if (checkRole && checkRole !== "sale" && adminProfile?.user?.id) {
      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        if (isActive) { // Only setup if still active
          setupReturnNotificationsRealtime();
        }
      }, 2000); // Increase delay to 2 seconds

      return () => {
        isActive = false; // Mark as inactive
        clearTimeout(timeoutId);
        
        // Add delay to cleanup to avoid race conditions
        setTimeout(() => {
          if (pusherRef.current) {
            try {
              if (channelRef.current) {
                channelRef.current.unbind_all();
                channelRef.current = null;
              }
              
              // Only unsubscribe if connection is still active
              if (pusherRef.current.connection.state === 'connected') {
                pusherRef.current.unsubscribe("private-admin.notifications");
              }
              
              pusherRef.current.disconnect();
              pusherRef.current = null;
            } catch (error) {
              pusherRef.current = null;
              channelRef.current = null;
            }
          }
        }, 100);
      };
    }
  }, [setupReturnNotificationsRealtime, checkRole, adminProfile?.user?.id]);

  // Hàm xử lý để đánh dấu đã đọc thông báo hoàn hàng - sử dụng Redux
  const markReturnNotificationAsRead = useCallback(
    async (notificationId) => {
      console.log('🔔 [DEBUG] Bắt đầu đánh dấu thông báo ID:', notificationId);
      try {
        const result = await dispatch(
          markReturnNotificationRead(notificationId)
        );

        console.log('🔔 [DEBUG] Kết quả từ Redux:', result);

        if (markReturnNotificationRead.fulfilled.match(result)) {
          console.log('🔔 [DEBUG] Thành công! Cập nhật local state...');
          // Cập nhật state local sau khi Redux thành công
          setReturnNotifications((prevNotifications) => {
            const updated = prevNotifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, is_read: 1 }
                : notification
            );
            console.log('🔔 [DEBUG] State đã cập nhật:', updated);
            return updated;
          });
          return true;
        } else {
          console.log('🗿 [DEBUG] Lỗi: Redux trả về rejected');
          return false;
        }
      } catch (error) {
        console.error('🗿 [DEBUG] Lỗi khi đánh dấu đã đọc:', error);
        return false;
      }
    },
    [dispatch]
  );

  // Xử lý khi click vào thông báo hoàn hàng
  const handleReturnNotificationClick = useCallback(
    async (notification) => {
      console.log('🔔 [DEBUG] Click vào thông báo:', notification);
      
      // Đánh dấu đã đọc nếu chưa đọc (Optimistic update)
      if (notification.is_read === 0) {
        console.log('🔔 [DEBUG] Thông báo chưa đọc, đánh dấu ngay...');
        
        // Cập nhật UI ngay lập tức (optimistic)
        setReturnNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notification.id ? { ...n, is_read: 1 } : n
          )
        );
        
        // Gọi API trong background
        markReturnNotificationAsRead(notification.id).catch(() => {
          // Nếu API lỗi, hoàn nguyên lại
          console.error('🗿 [DEBUG] API lỗi, hoàn nguyên lại UI');
          setReturnNotifications(prevNotifications =>
            prevNotifications.map(n =>
              n.id === notification.id ? { ...n, is_read: 0 } : n
            )
          );
        });
      }

      // Chuyển hướng đến trang chi tiết đơn hoàn hàng
      if (notification.return_request_id) {
        navigate(`/admin/detailorderreturn/${notification.return_request_id}`);
      } else if (notification.order_id) {
        navigate(`/admin/orderdetail/${notification.order_id}`);
      }
    },
    [markReturnNotificationAsRead, navigate]
  );

  return (
    <>
      <div className={`admin_dh-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
        <nav
          id="admin_dh-sidebar"
          className={`${
            isSidebarCollapsed ? "admin_dh-sidebar-collapsed" : ""
          } ${isSidebarActive ? "admin_dh-sidebar-active" : ""}`}
        >
          <div className="admin_dh-sidebar-header">
            <div className="admin_dh-logo-container">
              <Link
                to={
                  checkRole && checkRole === "sale"
                    ? "/admin/product"
                    : "/admin/chart"
                }
                className="d-flex align-items-center"
              >
                <div className="admin_dh-logo-img">
                  <img src={logo} alt="DH Mobile" />
                </div>
              </Link>
            </div>

            <button
              type="button"
              className="admin_dh-sidebar-toggle d-md-none"
              onClick={toggleMobileSidebar}
              aria-label="Close menu"
              style={{
                backgroundColor: "rgba(255, 69, 58, 0.15)",
                color: "var(--admin_dh-danger)",
                boxShadow: "0 2px 10px rgba(255, 69, 58, 0.2)",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="admin_dh-sidebar-nav">
            {checkRole !== "sale" && (
              <div className="admin_dh-nav-section">
                <div className="admin_dh-nav-section-title mt-3">Trang chủ</div>
                <div className="admin_dh-components">
                  <div
                    className={location.pathname === "/admin" ? "active" : ""}
                  >
                    <Link
                      to="/admin/chart"
                      className="admin_dh-nav-link"
                      data-title="Dashboard"
                    >
                      <i
                        className="bi bi-speedometer2"
                        style={{ color: "#0071e3" }}
                      />
                      <span>Thống Kê</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="admin_dh-nav-section">
              <div
                className={`admin_dh-nav-section-title ${
                  checkRole !== "sale" ? "" : "mt-3"
                }`}
              >
                Quản lí sản phẩm
              </div>
              <div className="admin_dh-components">
                {checkRole !== "sale" && (
                  <div
                    className={
                      location.pathname.includes("/admin/categories")
                        ? "active"
                        : ""
                    }
                  >
                    <a
                      href="#"
                      className={`admin_dh-dropdown-toggle ${
                        isDropdownActive("categories") ? "show" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown("categories");
                      }}
                      data-title="Categories"
                      style={isSidebarCollapsed ? { position: "relative" } : {}}
                    >
                      <i
                        className="bi bi-ui-checks-grid"
                        style={{ color: "#28cd41" }}
                      />
                      <span>Danh mục</span>
                      <i
                        className={`bi bi-caret-${
                          isDropdownActive("categories") ? "down" : "right"
                        }-fill`}
                        style={{ marginLeft: "8px" }}
                      ></i>
                    </a>
                    <div
                      className={`admin_dh-submenu ${
                        isDropdownActive("categories") ? "show" : ""
                      }`}
                      style={
                        isSidebarCollapsed && isDropdownActive("categories")
                          ? sidebarCollapsedStyles.submenu
                          : {}
                      }
                    >
                      <div>
                        <Link to="/admin/categories">Danh sách danh mục</Link>
                      </div>
                      <div>
                        <Link to="/admin/Addcategories">Thêm danh mục </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={
                    location.pathname.includes("/admin/product") ? "active" : ""
                  }
                >
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${
                      isDropdownActive("products") ? "show" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown("products");
                    }}
                    data-title="Products"
                  >
                    <i
                      className="bi bi-box-seam"
                      style={{ color: "#5ac8fa" }}
                    />
                    <span>Sản phẩm</span>
                    <i
                      className={`bi bi-caret-${
                        isDropdownActive("products") ? "down" : "right"
                      }-fill`}
                      style={{ marginLeft: "8px" }}
                    ></i>
                  </a>
                  <div
                    className={`admin_dh-submenu ${
                      isDropdownActive("products") ? "show" : ""
                    }`}
                  >
                    <div>
                      <Link to="/admin/product">Danh sách sản phẩm</Link>
                    </div>
                    {checkRole !== "sale" && (
                      <>
                        <div>
                          <Link to="/admin/addproduct">Thêm sản phẩm</Link>
                        </div>
                        <div>
                          <Link to="/admin/attribute">Thuộc tính</Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {checkRole !== "sale" && (
              <div className="admin_dh-nav-section">
                <div className="admin_dh-nav-section-title">
                  Quản lí tài khoản
                </div>
                <div className="admin_dh-components">
                  <div
                    className={
                      location.pathname.includes("/admin/accounts")
                        ? "active"
                        : ""
                    }
                  >
                    <a
                      href="#"
                      className={`admin_dh-dropdown-toggle ${
                        isDropdownActive("accounts") ? "show" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown("accounts");
                      }}
                      data-title="Tài khoản"
                      style={isSidebarCollapsed ? { position: "relative" } : {}}
                    >
                      <i
                        className="bi bi-person-lines-fill"
                        style={{ color: "#bf5af2" }}
                      />
                      <span>Tài khoản</span>
                      <i
                        className={`bi bi-caret-${
                          isDropdownActive("accounts") ? "down" : "right"
                        }-fill`}
                        style={{ marginLeft: "8px" }}
                      ></i>
                    </a>
                    <div
                      className={`admin_dh-submenu ${
                        isDropdownActive("accounts") ? "show" : ""
                      }`}
                      style={
                        isSidebarCollapsed && isDropdownActive("accounts")
                          ? sidebarCollapsedStyles.submenu
                          : {}
                      }
                    >
                      <div>
                        <Link to="/admin/accounts">Danh sách tài khoản</Link>
                      </div>
                      <div>
                        <Link to="/admin/addaccount">Thêm tài khoản</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {checkRole !== "sale" && (
              <div className="admin_dh-nav-section">
                <div className="admin_dh-nav-section-title">
                  Quản lí bán hàng
                </div>
                <div className="admin_dh-components">
                  <div
                    className={
                      location.pathname.includes("/admin/orders")
                        ? "active"
                        : ""
                    }
                  >
                    <a
                      href="#"
                      className={`admin_dh-dropdown-toggle ${
                        isDropdownActive("orders") ? "show" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown("orders");
                      }}
                      data-title="Đơn hàng"
                      style={isSidebarCollapsed ? { position: "relative" } : {}}
                    >
                      <i
                        className="bi bi-bag-check"
                        style={{ color: "#28cd41" }}
                      />
                      <span>Đơn hàng</span>
                      <i
                        className={`bi bi-caret-${
                          isDropdownActive("orders") ? "down" : "right"
                        }-fill`}
                        style={{ marginLeft: "8px" }}
                      ></i>
                    </a>
                    <div
                      className={`admin_dh-submenu ${
                        isDropdownActive("orders") ? "show" : ""
                      }`}
                      style={
                        isSidebarCollapsed && isDropdownActive("orders")
                          ? sidebarCollapsedStyles.submenu
                          : {}
                      }
                    >
                      <div>
                        <Link to="/admin/orders">Tất cả đơn hàng</Link>
                      </div>
                      <div>
                        <Link to="/admin/orders-cancelled">
                          Đơn hàng hoàn trả{" "}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      location.pathname.includes("/admin/vouchers")
                        ? "active"
                        : ""
                    }
                  >
                    <a
                      href="#"
                      className={`admin_dh-dropdown-toggle d-flex align-items-center justify-content-between ${
                        isDropdownActive("vouchers") ? "show" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown("vouchers");
                      }}
                      data-title="Voucher"
                      style={isSidebarCollapsed ? { position: "relative" } : {}}
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className="bi bi-ticket-perforated"
                          style={{ color: "#ff9f0a" }}
                        />
                        <span className="ms-3">Voucher</span>
                      </div>
                      <i
                        className={`mr-5 bi bi-caret-${
                          isDropdownActive("vouchers") ? "down" : "right"
                        }-fill`}
                      />
                    </a>
                    <div
                      className={`admin_dh-submenu ${
                        isDropdownActive("vouchers") ? "show" : ""
                      }`}
                      style={
                        isSidebarCollapsed && isDropdownActive("vouchers")
                          ? sidebarCollapsedStyles.submenu
                          : {}
                      }
                    >
                      <div>
                        <Link to="/admin/vouchers">Danh sách mã giảm giá</Link>
                      </div>
                      <div>
                        <Link to="/admin/addvoucher">Thêm mã giảm giá</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Tiếp thị</div>
              <div className="admin_dh-components">
                <div
                  className={
                    location.pathname === "/admin/membership" ? "active" : ""
                  }
                >
                  <Link
                    to="/admin/membership"
                    className="admin_dh-nav-link"
                    data-title="Dashboard"
                  >
                    <i
                      className="bi bi-person-vcard"
                      style={{ color: "#ff9f0a" }}
                    />

                    <span>Cấp bậc hạng</span>
                  </Link>
                </div>
                <div
                  className={
                    location.pathname.includes("/admin/banners") ? "active" : ""
                  }
                >
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${
                      isDropdownActive("banners") ? "show" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown("banners");
                    }}
                    data-title="Banner"
                  >
                    <i className="bi bi-image" style={{ color: "#0071e3" }} />
                    <span>Banner</span>
                    <i
                      className={`bi bi-caret-${
                        isDropdownActive("banners") ? "down" : "right"
                      }-fill`}
                      style={{ marginLeft: "8px" }}
                    ></i>
                  </a>
                  <div
                    className={`admin_dh-submenu ${
                      isDropdownActive("banners") ? "show" : ""
                    }`}
                  >
                    <div>
                      <Link to="/admin/banners">Danh sách banner</Link>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    location.pathname === "/admin/chatbot" ? "active" : ""
                  }
                >
                  <Link
                    to="/admin/chatbot"
                    className="admin_dh-nav-link"
                    data-title="Dashboard"
                  >
                    <i className="bi bi-robot" style={{ color: "#197fe6" }}></i>

                    <span> Chat bot </span>
                  </Link>
                </div>

                <div
                  className={
                    location.pathname === "/admin/chatlive" ? "active" : ""
                  }
                >
                  <Link
                    to="/admin/chatlive"
                    className="admin_dh-nav-link"
                    data-title="Dashboard"
                  >
                    <i
                      className="bi bi-messenger"
                      style={{ color: "#197fe6" }}
                    ></i>

                    <span> Tin nhắn </span>
                  </Link>
                </div>
                <div
                  className={
                    location.pathname.includes("/admin/articles")
                      ? "active"
                      : ""
                  }
                >
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${
                      isDropdownActive("articles") ? "show" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown("articles");
                    }}
                    data-title="Bài viết"
                  >
                    <i
                      className="bi bi-file-earmark-text"
                      style={{ color: "#ff9f0a" }}
                    />

                    <span>Bài viết </span>
                    <i
                      className={`bi bi-caret-${
                        isDropdownActive("articles") ? "down" : "right"
                      }-fill`}
                      style={{ marginLeft: "8px" }}
                    ></i>
                  </a>
                  <div
                    className={`admin_dh-submenu ${
                      isDropdownActive("articles") ? "show" : ""
                    }`}
                  >
                    <div>
                      <Link to="/admin/articles">Tất cả bài viết </Link>
                    </div>
                    <div>
                      <Link to="/admin/blog/add-blog">Thêm bài viết</Link>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    location.pathname === "/admin/comments" ? "active" : ""
                  }
                >
                  <Link
                    to="/admin/comments"
                    className="admin_dh-nav-link"
                    data-title="Dashboard"
                  >
                    <i
                      className="bi bi-chat-dots"
                      style={{ color: "#ff9f0a" }}
                    />
                    <span>Bình Luận</span>
                  </Link>
                </div>

                {checkRole !== "sale" && (
                  <div
                    className={
                      location.pathname === "/admin/comments" ? "active" : ""
                    }
                  >
                    <Link
                      to="/admin/withdraw-money"
                      className="admin_dh-nav-link"
                      data-title="Dashboard"
                    >
                      <i
                        className="bi bi-cash-coin"
                        style={{ color: "#ff9f0a" }}
                      />
                      <span>Rút tiền</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ height: "20px" }}></div>

          {/* Extra space for mobile view */}
          <div className="d-md-none" style={{ height: "60px" }}></div>
        </nav>
        {/* Page Content */}
        <div
          id="admin_dh-content"
          className={`${
            isSidebarCollapsed ? "admin_dh-content-expanded" : ""
          } ${
            isSidebarActive
              ? "admin_dh-content-dimmed admin_dh-content-active"
              : ""
          }`}
          onClick={handleContentClick}
        >
          {/* Top Navigation */}
          <nav className="admin_dh-navbar navbar-expand-lg">
            <div className="admin_dh_container">
              <div
                className="admin_dh-navbar-left"
                style={{ gap: 10, alignItems: "center" }}
              >
                <button
                  type="button"
                  id="admin_dh-sidebarCollapse"
                  className="btn admin_dh-btn d-none d-md-flex"
                  onClick={toggleSidebar}
                  ref={sidebarCollapseRef}
                  aria-label="Toggle sidebar"
                  style={{
                    backgroundColor: "var(--admin_dh-primary)",
                    color: "white",
                  }}
                >
                  <i className="bi bi-layout-sidebar" />
                </button>
                <button
                  type="button"
                  id="admin_dh-sidebarOpen"
                  className="btn admin_dh-btn d-md-none"
                  onClick={toggleMobileSidebar}
                  ref={sidebarOpenRef}
                  style={{
                    backgroundColor: "var(--admin_dh-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-layout-sidebar" />
                </button>
              </div>
              <div className="admin_dh-navbar-right">
                {checkRole !== "sale" && (
                  <>
                    <button
                      className="btn admin_dh-btn admin_dh-sound-toggle"
                      onClick={toggleSound}
                      title={
                        isSoundEnabled
                          ? "Tắt âm thanh thông báo"
                          : "Bật âm thanh thông báo"
                      }
                      style={{
                        marginRight: "-8px",
                        fontSize: 20,
                        color: isSoundEnabled
                          ? "var(--admin_dh-primary)"
                          : "var(--admin_dh-text-muted)",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      <i
                        className={`bi ${
                          isSoundEnabled ? "bi-volume-up" : "bi-volume-mute"
                        }`}
                      ></i>
                    </button>

                    <div className="admin_dh-notifications-nav">
                      <div className="dropdown">
                        <a
                          className="nav-link position-relative"
                          href="#"
                          role="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          onClick={handleNotificationClick}
                        >
                          <i
                            className={`bi bi-bell${
                              unreadCount > 0 && showNotificationDot
                                ? " admin_dh-bell-ring"
                                : ""
                            }`}
                          />
                          {unreadCount > 0 && showNotificationDot && (
                            <span className="position-absolute admin_dh-notification-badge rounded-pill">
                              {unreadCount}
                            </span>
                          )}
                        </a>
                        <div className="dropdown-menu dropdown-menu-end admin_dh-notification-dropdown">
                          <div className="dropdown-header d-flex justify-content-between align-items-center">
                            <h5
                              className="mb-0"
                              style={{ fontSize: "18px", fontWeight: "600" }}
                            >
                              Thông báo
                            </h5>
                            {(notifications.length > 0 || returnNotifications.length > 0) && (
                              <button
                                className=" text-decoration-none admin-dh-custom-mark-read-btn"
                                onClick={handleMarkAsRead}
                              >
                                <i className="bi bi-check-all me-1"></i>
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 &&
                          returnNotifications.length === 0 ? (
                            <div className="dropdown-item text-muted">
                              Không có thông báo mới
                            </div>
                          ) : (
                            <>
                              {/* Hiển thị thông báo hoàn hàng realtime trước */}
                              {returnNotifications.map((noti, idx) => (
                                <div
                                  key={`return-realtime-${noti.id}-${idx}`}
                                  className={`dropdown-item admin_dh-notification-item d-flex align-items-start ${
                                    noti.is_read === 1 ? "" : "unread"
                                  }`}
                                  onClick={() =>
                                    handleReturnNotificationClick(noti)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="admin_dh-notification-icon admin_dh-bg-warning-soft">
                                    <i className="bi bi-arrow-return-left"></i>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                   
                                    <p className="mb-0" title={noti.message}>
                                      {noti.message}
                                    </p>
                                    <small className="text-muted">
                                      <i className="bi bi-clock me-1"></i>
                                      {noti.created_at
                                        ? new Date(
                                            noti.created_at
                                          ).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : ""}
                                      {noti.order_id && (
                                        <span className="ms-2 text-info">
                                          Đơn #{noti.order_id}
                                        </span>
                                      )}
                                    </small>
                                  </div>
                                </div>
                              ))}

                              {/* Hiển thị thông báo thường từ Redux */}
                              {notifications.map((noti, idx) => (
                                <div
                                  key={`${noti.type || "default"}-${
                                    noti.type === "refund"
                                      ? noti.return_notification_id
                                      : noti.notification_id || idx
                                  }-${idx}`}
                                  className={`dropdown-item admin_dh-notification-item d-flex align-items-start ${
                                    noti.is_read === 1 ? "" : "unread"
                                  }`}
                                  onClick={() =>
                                    handleNotificationItemClick(noti)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <div
                                    className={`admin_dh-notification-icon ${
                                      noti.type === "refund"
                                        ? "admin_dh-bg-warning-soft"
                                        : "admin_dh-bg-primary-soft"
                                    }`}
                                  >
                                    <i
                                      className={`bi ${
                                        noti.type === "refund"
                                          ? "bi-arrow-return-left"
                                          : "bi-bell"
                                      }`}
                                    ></i>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <p className="mb-0" title={noti.message}>
                                      {noti.message}
                                    </p>
                                    <small className="text-muted">
                                      <i className="bi bi-clock me-1"></i>
                                      {noti.created_at
                                        ? new Date(
                                            noti.created_at
                                          ).toLocaleDateString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : ""}
                                    </small>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="dropdown admin_dh-user-dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <div className="admin_dh-user-avatar">
                      <img
                        src={adminProfile?.user?.image_url}
                        alt={adminProfile?.user?.username || "avatar"}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <i className="bi bi-caret-down-fill ms-2 text-muted"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end admin_dh-user-menu">
                    <li>
                      <div className="menu-divider" />
                    </li>
                    <div className="Homeadmin-user123">
                      Xin chào {adminProfile?.user?.username}
                    </div>
                    <li>
                      <Link
                        to={`/admin/detailacccount/${adminProfile?.user?.id}`}
                        className="dropdown-item"
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <i
                          className="bi bi-person-circle me-2"
                          style={{ color: "#0d6efd" }}
                        ></i>
                        Trang cá nhân
                      </Link>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <i
                          className="bi bi-box-arrow-right me-2"
                          style={{ color: "red" }}
                        ></i>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          <div className="admin_dh-main-content">
            <Outlet />
            <div className="admin_dh-footer-space"></div>
          </div>
        </div>

        {showScrollTop && (
          <button
            className="admin_dh-scroll-to-top"
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
        )}
      </div>
      {/* Audio cho thông báo đơn hàng */}
      {checkRole !== "sale" && (
        <>
          <audio
            ref={audioRef}
            src={Thongbao}
            preload="auto"
            style={{ display: "none" }}
          />
          <audio
            ref={hoanHangAudioRef}
            src={HoanHang}
            preload="auto"
            style={{ display: "none" }}
          />
        </>
      )}
    </>
  );
};
export default Homeadmin;
