/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
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
  markNotificationsRead,
  markNotificationRead,
} from "../../slices/NotificationSlice";
import Thongbao from "../../assets/sound/thongbaomuahang.mp3";
import { fetchProfile } from "../../slices/profileSlice";
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
  const prevUnreadCount = useRef(0);
  const audioRef = useRef(null);

  // Số lượng thông báo chưa đọc
  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

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

    // Get saved sound preference
    const savedSoundPreference = localStorage.getItem("notificationSound");
    if (savedSoundPreference !== null) {
      setSoundEnabled(savedSoundPreference === "true");
    }

    // Listen for changes in dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    dispatch(fetchNotifications());
    prevUnreadCount.current = notifications.filter(
      (n) => n.is_read === 0
    ).length;
    const interval = setInterval(() => {
      dispatch(fetchNotifications()).then((action) => {
        if (action.payload && Array.isArray(action.payload)) {
          const newUnread = action.payload.filter(
            (n) => n.is_read === 0
          ).length;
          // Cập nhật badge và hiệu ứng chuông
          if (newUnread > 0) {
            setShowNotificationDot(true);
          } else {
            setShowNotificationDot(false);
          }
          if (newUnread > prevUnreadCount.current) {
            toast.info("Bạn có đơn hàng mới!", {
              position: "top-right",
              autoClose: 4000,
            });
            if (audioRef.current && isSoundEnabled) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
          }
          prevUnreadCount.current = newUnread;
        }
      });
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [dispatch, isSoundEnabled]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);

    // Đồng bộ trạng thái với mobile sidebar
    if (window.innerWidth > 768) {
      setIsSidebarActive(!newState);
    }

    // Thêm hiệu ứng khi click vào nút
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

    // Đồng bộ trạng thái với desktop sidebar
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(!newState);
    }

    // Thêm hiệu ứng khi click vào nút
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

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  //   document.body.classList.toggle("dark-mode");
  // };

  // const clearNotifications = () => {
  //   setNotificationCount(0);
  //   setShowNotificationDot(false);
  // };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    setShowNotificationDot(false);
    const notificationBell = e.currentTarget.querySelector(".bi-bell");
    if (notificationBell) {
      notificationBell.classList.remove("admin_dh-bell-ring");
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      try {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminID");
        toast.success("Đăng xuất thành công");
        navigate("/AdminLogin", { replace: true });
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
      }
    }
  };

  const handleMarkAsRead = () => {
    dispatch(markNotificationsRead());
    setShowNotificationDot(false);
  };

  const handleNotificationItemClick = (noti) => {
    if (noti.is_read !== 1 && noti.notification_id) {
      dispatch(markNotificationRead(noti.notification_id));
    }
    if (noti.order_id) {
      navigate(`/admin/orderdetail/${noti.order_id}`);
    }
  };

  const toggleSound = () => {
    const newSoundState = !isSoundEnabled;
    setSoundEnabled(newSoundState);
    localStorage.setItem("notificationSound", newSoundState);
  };

  // const adminID = localStorage.getItem("adminID");
  // const users = useSelector((state) => state.adminuser?.users || []);
  // const currentUser = users.find((u) => String(u.user_id) === String(adminID));

  const { profile } = useSelector((state) => state.profile);

  const checkRole = profile?.user?.role;
  

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

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
              <Link to="/" className="d-flex align-items-center">
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
                      to="/admin"
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
                    location.pathname.includes("/admin/chatbot") ? "active" : ""
                  }
                >
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle d-flex align-items-center justify-content-between ${
                      isDropdownActive("chatbot") ? "show" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown("chatbot");
                    }}
                    data-title="Chatbot"
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-robot" style={{ color: "#0071e3" }} />
                      <span className="ms-3"> Hỗ trợ </span>
                    </div>
                    <i
                      className={`bi bi-caret-${
                        isDropdownActive("chatbot") ? "down" : "right"
                      }-fill`}
                    />
                  </a>
                  <div
                    className={`admin_dh-submenu ${
                      isDropdownActive("chatbot") ? "show" : ""
                    }`}
                  >
                    <div>
                      <Link to="/admin/chatlive">Tin nhắn khách hàng</Link>
                    </div>
                    {checkRole !== "sale" && (
                      <div>
                        <Link to="/admin/chatbot">Chatbot</Link>
                      </div>
                    )}
                  </div>
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
                        marginRight: "-13px",
                        fontSize: 23,
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
                            {notifications.length > 0 && (
                              <button
                                className=" text-decoration-none admin-dh-custom-mark-read-btn"
                                onClick={handleMarkAsRead}
                              >
                                <i className="bi bi-check-all me-1"></i>
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="dropdown-item text-muted">
                              Không có thông báo mới
                            </div>
                          ) : (
                            notifications.map((noti, idx) => (
                              <div
                                key={noti.notification_id || idx}
                                className={`dropdown-item admin_dh-notification-item d-flex align-items-start ${
                                  noti.is_read === 1 ? "" : "unread"
                                }`}
                                onClick={() =>
                                  handleNotificationItemClick(noti)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <div className="admin_dh-notification-icon admin_dh-bg-primary-soft">
                                  <i className="bi bi-bell"></i>
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
                            ))
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
                          src={profile?.user?.image_url}
                          alt={profile?.user?.username || "avatar"}
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

                    <li>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{ textAlign: "left", width: "100%" }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          {/* Main Content */}
          <div className="admin_dh-main-content">
            <Outlet />
            <div className="admin_dh-footer-space"></div>
          </div>
        </div>

        {/* Scroll to top button */}
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
      <audio
        ref={audioRef}
        src={Thongbao}
        preload="auto"
        style={{ display: "none" }}
      />
    </>
  );
};
export default Homeadmin;
