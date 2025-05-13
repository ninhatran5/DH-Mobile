import React, { useState, useEffect } from "react"
import '../../assets/admin/HomeAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, Outlet } from "react-router-dom";
import logo from "../../assets/images/logo2.png";

const Homeadmin =()=>{
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleSidebar = () => {
    // Check if we're on mobile by checking window width
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
            aria-label="Đóng menu"
            onClick={toggleSidebar}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <ul className="dh-list-unstyled dh-components">
          {/* Thống kê */}
          <li>
            <Link to="/admin" className="dh-nav-link">
              <i className="bi bi-bar-chart-line" />
              <span>Thống kê</span>
            </Link>
          </li>

          {/* Quản lý danh mục */}
          <li>
            <a href="#danhMucSubmenu" data-bs-toggle="collapse" className="dh-dropdown-toggle">
              <i className="bi bi-ui-checks-grid" />
              <span>Quản lý danh mục</span>
            </a>
            <ul className="collapse dh-list-unstyled" id="danhMucSubmenu">
              <li><Link to="/admin/categories" className="dh-nav-link">Danh sách danh mục</Link></li>
              <li><Link to="/admin/categories/add" className="dh-nav-link">Thêm danh mục</Link></li>
            </ul>
          </li>

          {/* Quản lý sản phẩm */}
          <li>
            <a href="#sanPhamSubmenu" data-bs-toggle="collapse" className="dh-dropdown-toggle">
              <i className="bi bi-box-seam" />
              <span>Quản lý sản phẩm</span>
            </a>
            <ul className="collapse dh-list-unstyled" id="sanPhamSubmenu">
              <li><Link to="/admin/product" className="dh-nav-link">Danh sách sản phẩm</Link></li>
              <li><Link to="/admin/addproduct" className="dh-nav-link">Thêm sản phẩm</Link></li>
            </ul>
          </li>

          <li>
            <Link to="/admin/accounts" className="dh-nav-link">
              <i className="bi bi-person-lines-fill" />
              <span>Quản lý tài khoản</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/orders" className="dh-nav-link">
              <i className="bi bi-bag-check" />
              <span>Quản lý đơn hàng</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/vouchers" className="dh-nav-link">
              <i className="bi bi-ticket-perforated" />
              <span>Quản lý voucher</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/banners" className="dh-nav-link">
              <i className="bi bi-image" />
              <span>Quản lý banner</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/chatbot" className="dh-nav-link">
              <i className="bi bi-robot" />
              <span>Quản lý chatbot</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/comments" className="dh-nav-link">
              <i className="bi bi-chat-dots" />
              <span>Quản lý bình luận</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/news" className="dh-nav-link">
              <i className="bi bi-newspaper" />
              <span>Quản lý tin tức</span>
            </Link>
          </li>

          <li>
            <Link to="/admin/trash" className="dh-nav-link">
              <i className="bi bi-trash3" />
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
        <Outlet/>
      </div>
    </div>
  </>
)
}
export default Homeadmin;