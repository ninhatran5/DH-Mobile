import React, { useState, useEffect } from "react"
import '../../assets/admin/HomeAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo2.png";

const Homeadmin =()=>{
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState('');
  const location = useLocation();

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
    // Close sidebar on mobile when route changes
    if (window.innerWidth <= 768) {
      setIsSidebarActive(false);
    }
  }, [location]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarActive(!isSidebarActive);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleContentClick = () => {
    if (window.innerWidth <= 768 && isSidebarActive) {
      setIsSidebarActive(false);
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? '' : menu);
  };

  const isDropdownActive = (menu) => activeDropdown === menu;

  return(
    <>
      <div className="dh-wrapper">
        <nav id="dh-sidebar" className={`${isSidebarCollapsed ? 'dh-sidebar-collapsed' : ''} ${isSidebarActive ? 'dh-sidebar-active' : ''}`}>
          <div className="dh-sidebar-header d-flex justify-content-between align-items-center">
            <div className="dh-logo-container">
              <Link to="/">
                <img 
                  src={logo} 
                  alt="admin-logo" 
                  className="dh-admin-logo" 
                  style={{ 
                    height: '40px',
                    width: 'auto',
                    transition: 'all 0.3s ease'
                  }} 
                />
              </Link>
            </div>
            <button 
              type="button" 
              id="dh-sidebarClose" 
              className="btn d-md-none" 
              onClick={toggleSidebar}
              aria-label="Đóng menu"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <ul className="dh-list-unstyled dh-components">
            <li className={location.pathname === '/admin' ? 'active' : ''}>
              <Link to="/admin" className="dh-nav-link">
                <i className="bi bi-bar-chart-line text-primary" />
                <span>Thống kê</span>
              </Link>
            </li>

            <li className={location.pathname.includes('/admin/categories') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('categories') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('categories');
                }}
              >
                <i className="bi bi-ui-checks-grid" style={{ color: '#28a745' }} /> 
                <span>Quản lý danh mục</span>
                <i className={`bi bi-chevron-${isDropdownActive('categories') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu ${isDropdownActive('categories') ? 'show' : ''}`}>
                <li><Link to="/admin/categories">Danh sách danh mục</Link></li>
                <li><Link to="/admin/Addcategories">Thêm danh mục</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/product') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('products') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('products');
                }}
              >
                <i className="bi bi-box-seam" style={{ color: '#17a2b8' }} /> 
                <span>Quản lý sản phẩm</span>
                <i className={`bi bi-chevron-${isDropdownActive('products') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu ${isDropdownActive('products') ? 'show' : ''}`}>
                <li><Link to="/admin/product">Danh sách sản phẩm</Link></li>
                <li><Link to="/admin/addproduct">Thêm sản phẩm</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/accounts') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('accounts') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('accounts');
                }}
              >
                <i className="bi bi-person-lines-fill" style={{ color: '#6f42c1' }} />
                <span>Quản lý tài khoản</span>
                <i className={`bi bi-chevron-${isDropdownActive('accounts') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu account-submenu ${isDropdownActive('accounts') ? 'show' : ''}`}>
                <li><Link to="/admin/accounts">Danh sách tài khoản</Link></li>
                <li><Link to="/admin/accounts/roles">Phân quyền</Link></li>
                <li><Link to="/admin/accounts/activity">Lịch sử hoạt động</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('orders') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('orders');
                }}
              >
                <i className="bi bi-bag-check text-success" />
                <span>Quản lý đơn hàng</span>
                <i className={`bi bi-chevron-${isDropdownActive('orders') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu order-submenu ${isDropdownActive('orders') ? 'show' : ''}`}>
                <li><Link to="/admin/orders">Tất cả đơn hàng</Link></li>
                <li><Link to="/admin/orders/pending">Đơn chờ xử lý</Link></li>
                <li><Link to="/admin/orders/shipping">Đơn đang giao</Link></li>
                <li><Link to="/admin/orders/completed">Đơn đã hoàn thành</Link></li>
                <li><Link to="/admin/orders/cancelled">Đơn đã hủy</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/vouchers') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('vouchers') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('vouchers');
                }}
              >
                <i className="bi bi-ticket-perforated" style={{ color: '#fd7e14' }} />
                <span>Quản lý voucher</span>
                <i className={`bi bi-chevron-${isDropdownActive('vouchers') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu voucher-submenu ${isDropdownActive('vouchers') ? 'show' : ''}`}>
                <li><Link to="/admin/vouchers">Danh sách voucher</Link></li>
                <li><Link to="/admin/vouchers/add">Thêm voucher</Link></li>
                <li><Link to="/admin/vouchers/reports">Báo cáo sử dụng</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/banners') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('banners') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('banners');
                }}
              >
                <i className="bi bi-image text-primary" />
                <span>Quản lý banner</span>
                <i className={`bi bi-chevron-${isDropdownActive('banners') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu banner-submenu ${isDropdownActive('banners') ? 'show' : ''}`}>
                <li><Link to="/admin/banners">Danh sách banner</Link></li>
                <li><Link to="/admin/banners/add">Thêm banner</Link></li>
                <li><Link to="/admin/banners/schedule">Lịch hiển thị</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/chatbot') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('chatbot') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('chatbot');
                }}
              >
                <i className="bi bi-robot text-primary" />
                <span>Quản lý chatbot</span>
                <i className={`bi bi-chevron-${isDropdownActive('chatbot') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu chatbot-submenu ${isDropdownActive('chatbot') ? 'show' : ''}`}>
                <li><Link to="/admin/chatbot">Cấu hình chatbot</Link></li>
                <li><Link to="/admin/chatbot/responses">Câu trả lời</Link></li>
                <li><Link to="/admin/chatbot/analytics">Thống kê</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/comments') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('comments') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('comments');
                }}
              >
                <i className="bi bi-chat-dots" style={{ color: '#ffc107' }} />
                <span>Quản lý bình luận</span>
                <i className={`bi bi-chevron-${isDropdownActive('comments') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu comment-submenu ${isDropdownActive('comments') ? 'show' : ''}`}>
                <li><Link to="/admin/comments">Tất cả bình luận</Link></li>
                <li><Link to="/admin/comments/pending">Chờ duyệt</Link></li>
                <li><Link to="/admin/comments/reported">Bị báo cáo</Link></li>
              </ul>
            </li>

            <li className={location.pathname.includes('/admin/news') ? 'active' : ''}>
              <a
                href="#"
                className={`dh-dropdown-toggle ${isDropdownActive('news') ? 'show' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  toggleDropdown('news');
                }}
              >
                <i className="bi bi-newspaper text-success" />
                <span>Quản lý tin tức</span>
                <i className={`bi bi-chevron-${isDropdownActive('news') ? 'down' : 'right'} ms-auto`}></i>
              </a>
              <ul className={`dh-submenu news-submenu ${isDropdownActive('news') ? 'show' : ''}`}>
                <li><Link to="/admin/news">Danh sách tin tức</Link></li>
                <li><Link to="/admin/news/add">Thêm tin tức</Link></li>
                <li><Link to="/admin/news/categories">Danh mục tin</Link></li>
              </ul>
            </li>

            <li className={location.pathname === '/admin/trash' ? 'active' : ''}>
              <Link to="/admin/trash" className="dh-nav-link">
                <i className="bi bi-trash3" style={{ color: '#dc3545' }} />
                <span>Thùng rác</span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Page Content */}
        <div 
          id="dh-content" 
          className={`${isSidebarCollapsed ? 'dh-content-expanded' : ''} ${isSidebarActive ? 'dh-content-dimmed dh-content-active' : ''}`}
          onClick={handleContentClick}
        >
          {/* Top Navigation */}
          <nav className="dh-navbar navbar-expand-lg">
            <div className="container-fluid">
              <div className="dh-navbar-left">
                {/* Nút menu cho desktop */}
                <button 
                  type="button" 
                  id="dh-sidebarCollapse" 
                  className="btn d-none d-md-block"
                  onClick={toggleSidebar}
                >
                  <i className={`bi ${isSidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} />
                </button>
                {/* Nút menu cho mobile */}
                <button 
                  type="button" 
                  id="dh-sidebarOpen" 
                  className="btn d-md-none"
                  onClick={toggleSidebar}
                >
                  <i className="bi bi-list" />
                </button>
                <div className="search-bar">
                  <input type="text" className="form-control" placeholder="Tìm kiếm..." />
                </div>
              </div>

              <div className="dh-navbar-right">
                <div className="notifications-nav">
                  <div className="dropdown">
                    <a className="nav-link position-relative" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-bell" />
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill">
                        3
                        <span className="visually-hidden">thông báo chưa đọc</span>
                      </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end notification-dropdown">
                      <h6 className="dropdown-header">Thông Báo</h6>
                      <a className="dropdown-item notification-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <i className="bi bi-person-plus text-success" />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Người dùng mới đăng ký</p>
                            <small className="text-muted">5 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <a className="dropdown-item notification-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <i className="bi bi-cart-check text-primary" />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Đơn hàng mới</p>
                            <small className="text-muted">15 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <a className="dropdown-item notification-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <i className="bi bi-exclamation-circle text-warning" />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <p className="mb-0">Cảnh báo hệ thống</p>
                            <small className="text-muted">30 phút trước</small>
                          </div>
                        </div>
                      </a>
                      <div className="dropdown-divider" />
                      <a className="dropdown-item text-center small text-muted" href="#">Xem tất cả thông báo</a>
                    </div>
                  </div>
                </div>
                <div className="dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="#">Hồ sơ</a></li>
                    <li><a className="dropdown-item" href="#">Cài đặt</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#">Đăng xuất</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          {/* Main Content */}
          <div className="dh-main-content">
            <Outlet/>
          </div>
        </div>
      </div>
    </>
  )
}
export default Homeadmin;