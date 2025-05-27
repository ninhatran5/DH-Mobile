import React, { useState, useEffect, useRef } from "react"
import '../../assets/admin/HomeAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo2.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const sidebarCollapsedStyles = {
  submenu: {
    position: 'absolute',
    left: '100%',
    top: '0',
    width: '200px',
    background: 'var(--admin_dh-card-bg)',
    borderRadius: 'var(--admin_dh-radius-sm)',
    boxShadow: 'var(--admin_dh-box-shadow-hover)',
    border: '1px solid var(--admin_dh-border)',
    padding: '8px 0',
    zIndex: 1050
  }
};

const Homeadmin =()=>{
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotificationDot, setShowNotificationDot] = useState(true);
  const location = useLocation();
  const sidebarCollapseRef = useRef(null);
  const sidebarOpenRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (storedSidebarState !== null) {
      const collapsed = storedSidebarState === 'true';
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

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarActive(false);
    }
  }, [location]);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);

    // Listen for changes in dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
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
      sidebarCollapseRef.current.classList.add('admin_dh-active');
      setTimeout(() => {
        if (sidebarCollapseRef.current) {
          sidebarCollapseRef.current.classList.remove('admin_dh-active');
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
      sidebarOpenRef.current.classList.add('admin_dh-active');
      setTimeout(() => {
        if (sidebarOpenRef.current) {
          sidebarOpenRef.current.classList.remove('admin_dh-active');
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
    setActiveDropdown(activeDropdown === menu ? '' : menu);
  };

  const isDropdownActive = (menu) => activeDropdown === menu;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const clearNotifications = () => {
    setNotificationCount(0);
    setShowNotificationDot(false);
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    const notificationBell = e.currentTarget.querySelector('.bi-bell');
    if (notificationBell) {
      notificationBell.classList.add('admin_dh-bell-ring');
      setTimeout(() => {
        notificationBell.classList.remove('admin_dh-bell-ring');
      }, 1000);
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
  return(
    <>
      <div className={`admin_dh-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
        <nav id="admin_dh-sidebar" className={`${isSidebarCollapsed ? 'admin_dh-sidebar-collapsed' : ''} ${isSidebarActive ? 'admin_dh-sidebar-active' : ''}`}>
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
                backgroundColor: 'rgba(255, 69, 58, 0.15)', 
                color: 'var(--admin_dh-danger)',
                boxShadow: '0 2px 10px rgba(255, 69, 58, 0.2)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="admin_dh-sidebar-nav">
            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Overview</div>
              <div className="admin_dh-components">
                <div className={location.pathname === '/admin' ? 'active' : ''}>
                  <Link to="/admin" className="admin_dh-nav-link" data-title="Dashboard">
                    <i className="bi bi-speedometer2" style={{ color: '#0071e3' }} />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Product Management</div>
              <div className="admin_dh-components">
                <div className={location.pathname.includes('/admin/categories') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('categories') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('categories');
                    }}
                    data-title="Categories"
                    style={isSidebarCollapsed ? {position: 'relative'} : {}}
                  >
                    <i className="bi bi-ui-checks-grid" style={{ color: '#28cd41' }} /> 
                    <span>Categories</span>
                    <i className={`bi bi-caret-${isDropdownActive('categories') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div 
                    className={`admin_dh-submenu ${isDropdownActive('categories') ? 'show' : ''}`}
                    style={isSidebarCollapsed && isDropdownActive('categories') ? sidebarCollapsedStyles.submenu : {}}
                  >
                    <div><Link to="/admin/categories">Category List</Link></div>
                    <div><Link to="/admin/Addcategories">Add Category</Link></div>
                  </div>
                </div>

                <div className={location.pathname.includes('/admin/product') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('products') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('products');
                    }}
                    data-title="Products"
                  >
                    <i className="bi bi-box-seam" style={{ color: '#5ac8fa' }} /> 
                    <span>Products</span>
                    <i className={`bi bi-caret-${isDropdownActive('products') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div className={`admin_dh-submenu ${isDropdownActive('products') ? 'show' : ''}`}>
                    <div><Link to="/admin/product">Product List</Link></div>
                    <div><Link to="/admin/addproduct">Add Product</Link></div>
                    <div><Link to="/admin/attribute">Attribute</Link></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Account Management</div>
              <div className="admin_dh-components">
                <div className={location.pathname.includes('/admin/accounts') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('accounts') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('accounts');
                    }}
                    data-title="Tài khoản"
                    style={isSidebarCollapsed ? {position: 'relative'} : {}}
                  >
                    <i className="bi bi-person-lines-fill" style={{ color: '#bf5af2' }} />
                    <span>Tài khoản</span>
                    <i className={`bi bi-caret-${isDropdownActive('accounts') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div 
                    className={`admin_dh-submenu ${isDropdownActive('accounts') ? 'show' : ''}`}
                    style={isSidebarCollapsed && isDropdownActive('accounts') ? sidebarCollapsedStyles.submenu : {}}
                  >
                    <div><Link to="/admin/accounts">Danh sách tài khoản</Link></div>
                    <div><Link to="/admin/addaccount">Thêm tài khoản</Link></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Sales Management</div>
              <div className="admin_dh-components">
               
                
                <div className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('orders') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('orders');
                    }}
                    data-title="Đơn hàng"
                    style={isSidebarCollapsed ? {position: 'relative'} : {}}
                  >
                    <i className="bi bi-bag-check" style={{ color: '#28cd41' }} />
                    <span>Đơn hàng</span>
                    <i className={`bi bi-caret-${isDropdownActive('orders') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div 
                    className={`admin_dh-submenu ${isDropdownActive('orders') ? 'show' : ''}`}
                    style={isSidebarCollapsed && isDropdownActive('orders') ? sidebarCollapsedStyles.submenu : {}}
                  >
                    <div><Link to="/admin/orders">Tất cả đơn hàng</Link></div>
                    <div><Link to="/admin/orders-completed">Đơn đã hoàn thành</Link></div>
                    <div><Link to="/admin/orders-cancelled">Đơn đã hủy</Link></div>
                  </div>
                </div>

                <div className={location.pathname.includes('/admin/vouchers') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('vouchers') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('vouchers');
                    }}
                    data-title="Voucher"
                    style={isSidebarCollapsed ? {position: 'relative'} : {}}
                  >
                    <i className="bi bi-ticket-perforated" style={{ color: '#ff9f0a' }} />
                    <span>Voucher</span>
                    <i className={`bi bi-caret-${isDropdownActive('vouchers') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div 
                    className={`admin_dh-submenu ${isDropdownActive('vouchers') ? 'show' : ''}`}
                    style={isSidebarCollapsed && isDropdownActive('vouchers') ? sidebarCollapsedStyles.submenu : {}}
                  >
                    <div><Link to="/admin/vouchers">Danh sách voucher</Link></div>
                    <div><Link to="/admin/addvoucher">Thêm voucher</Link></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin_dh-nav-section">
              <div className="admin_dh-nav-section-title">Marketing</div>
              <div className="admin_dh-components">
                <div className={location.pathname.includes('/admin/banners') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('banners') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('banners');
                    }}
                    data-title="Banner"
                  >
                    <i className="bi bi-image" style={{ color: '#0071e3' }} />
                    <span>Banner</span>
                    <i className={`bi bi-caret-${isDropdownActive('banners') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div className={`admin_dh-submenu ${isDropdownActive('banners') ? 'show' : ''}`}>
                    <div><Link to="/admin/banners">Danh sách banner</Link></div>
                  </div>
                </div>

                <div className={location.pathname.includes('/admin/chatbot') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('chatbot') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('chatbot');
                    }}
                    data-title="Chatbot"
                  >
                    <i className="bi bi-robot" style={{ color: '#0071e3' }} />
                    <span>Chatbot</span>
                    <i className={`bi bi-caret-${isDropdownActive('chatbot') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div className={`admin_dh-submenu ${isDropdownActive('chatbot') ? 'show' : ''}`}>
                    <div><Link to="/admin/chatbot">Tin nhắn</Link></div>
                  </div>
                </div>

                <div className={location.pathname.includes('/admin/comments') ? 'active' : ''}>
                  <a
                    href="#"
                    className={`admin_dh-dropdown-toggle ${isDropdownActive('comments') ? 'show' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown('comments');
                    }}
                    data-title="Bình luận"
                  >
                    <i className="bi bi-chat-dots" style={{ color: '#ff9f0a' }} />
                    <span>Bình luận</span>
                    <i className={`bi bi-caret-${isDropdownActive('comments') ? 'down' : 'right'}-fill`} style={{ marginLeft: '8px' }}></i>
                  </a>
                  <div className={`admin_dh-submenu ${isDropdownActive('comments') ? 'show' : ''}`}>
                    <div><Link to="/admin/comments">Tất cả bình luận</Link></div>
                    <div><Link to="/admin/comments/pending">Chờ duyệt</Link></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '20px' }}></div>
          
          {/* Extra space for mobile view */}
          <div className="d-md-none" style={{ height: '60px' }}></div>
          
        </nav>
        {/* Page Content */}
        <div 
          id="admin_dh-content" 
          className={`${isSidebarCollapsed ? 'admin_dh-content-expanded' : ''} ${isSidebarActive ? 'admin_dh-content-dimmed admin_dh-content-active' : ''}`}
          onClick={handleContentClick}
        >
          {/* Top Navigation */}
          <nav className="admin_dh-navbar navbar-expand-lg">
            <div className="container-fluid">
              <div className="admin_dh-navbar-left" style={{ gap: 10, alignItems: 'center' }}>
                {/* Nút menu cho desktop - giống với mobile */}
                <button 
                  type="button" 
                  id="admin_dh-sidebarCollapse" 
                  className="btn admin_dh-btn d-none d-md-flex"
                  onClick={toggleSidebar}
                  ref={sidebarCollapseRef}
                  aria-label="Toggle sidebar"
                  style={{ backgroundColor: 'var(--admin_dh-primary)', color: 'white' }}
                ><i className="bi bi-layout-sidebar" /></button>
                {/* Nút menu cho mobile */}
                <button 
                  type="button" 
                  id="admin_dh-sidebarOpen" 
                  className="btn admin_dh-btn d-md-none"
                  onClick={toggleMobileSidebar}
                  ref={sidebarOpenRef}
                  style={{ backgroundColor: 'var(--admin_dh-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><i className="bi bi-layout-sidebar" /></button>
                <div className={`admin_dh-search-bar ${isSearchFocused ? 'focused' : ''}`}>
                  <i className="bi bi-search admin_dh-search-icon"></i>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search..." 
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>

              <div className="admin_dh-navbar-right">
                <button 
                  className="btn admin_dh-btn admin_dh-theme-toggle" 
                  onClick={toggleDarkMode}
                  title={isDarkMode ? "Light mode" : "Dark mode"}
                >
                  <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'}`}></i>
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
                      <i className="bi bi-bell" />
                      {showNotificationDot && (
                        <span className="position-absolute admin_dh-notification-badge rounded-pill">
                          {notificationCount}
                        </span>
                      )}
                    </a>
                    <div className="dropdown-menu dropdown-menu-end admin_dh-notification-dropdown">
                      <div className="dropdown-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Notifications</h6>
                        {notificationCount > 0 && (
                          <button 
                            className="btn btn-sm btn-link text-decoration-none" 
                            onClick={clearNotifications}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      <a className="dropdown-item admin_dh-notification-item" href="#">
                        <div className="d-flex">
                          <div className="admin_dh-notification-icon admin_dh-bg-success-soft">
                            <i className="bi bi-person-plus"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Người dùng mới đăng ký</p>
                            <small className="text-muted">5 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <a className="dropdown-item admin_dh-notification-item" href="#">
                        <div className="d-flex">
                          <div className="admin_dh-notification-icon admin_dh-bg-primary-soft">
                            <i className="bi bi-cart-check"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Đơn hàng mới</p>
                            <small className="text-muted">15 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <a className="dropdown-item admin_dh-notification-item" href="#">
                        <div className="d-flex">
                          <div className="admin_dh-notification-icon admin_dh-bg-warning-soft">
                            <i className="bi bi-exclamation-circle"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Cảnh báo hệ thống</p>
                            <small className="text-muted">30 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <div className="dropdown-divider" />
                      <a className="dropdown-item text-center small text-muted" href="#">View all notifications</a>
                    </div>
                  </div>
                </div>
                <div className="dropdown admin_dh-user-dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <div className="admin_dh-user-avatar">
                      <i className="bi bi-person"></i>
                    </div>
                    <i className="bi bi-caret-down-fill ms-2 text-muted"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end admin_dh-user-menu">
                    <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Hồ sơ</a></li>
                    <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Cài đặt</a></li>
                    <li><hr className="dropdown-divider" /></li>
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
            <Outlet/>
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
    </>
  )
}
export default Homeadmin;