import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/banner.css';

const ListBanner = () => {
  // State for banners data
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [confirmLockModal, setConfirmLockModal] = useState(false);
  const [bannerToLock, setBannerToLock] = useState(null);

  // Mock data for banners
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockBanners = [
        {
          id: 1,
          title: 'Summer Sale 2023',
          image: 'https://via.placeholder.com/800x200',
          url: '/collections/summer-sale',
          position: 'Home Top',
          startDate: '2023-06-01',
          endDate: '2023-08-31',
          status: 'active',
          views: 2451,
          clicks: 312,
          createdAt: '2023-05-20'
        },
        {
          id: 2,
          title: 'New Arrivals',
          image: 'https://via.placeholder.com/800x200',
          url: '/collections/new-arrivals',
          position: 'Home Middle',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          status: 'active',
          views: 5230,
          clicks: 684,
          createdAt: '2023-01-01'
        },
        {
          id: 3,
          title: 'Clearance Sale',
          image: 'https://via.placeholder.com/800x200',
          url: '/collections/clearance',
          position: 'Category Top',
          startDate: '2023-05-15',
          endDate: '2023-06-15',
          status: 'inactive',
          views: 1874,
          clicks: 203,
          createdAt: '2023-05-10'
        },
        {
          id: 4,
          title: 'Holiday Special',
          image: 'https://via.placeholder.com/800x200',
          url: '/collections/holiday',
          position: 'Home Bottom',
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          status: 'scheduled',
          views: 0,
          clicks: 0,
          createdAt: '2023-11-15'
        },
        {
          id: 5,
          title: 'Back to School',
          image: 'https://via.placeholder.com/800x200',
          url: '/collections/school',
          position: 'Category Bottom',
          startDate: '2023-08-15',
          endDate: '2023-09-15',
          status: 'active',
          views: 1245,
          clicks: 178,
          createdAt: '2023-08-01'
        }
      ];
      
      setBanners(mockBanners);
      setLoading(false);
    }, 800);
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedBanners = React.useMemo(() => {
    let sortableBanners = [...banners];
    if (sortConfig.key) {
      sortableBanners.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBanners;
  }, [banners, sortConfig]);

  // Filter by search term
  const filteredBanners = sortedBanners.filter(banner => 
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle edit banner
  const handleEditClick = (banner) => {
    setCurrentBanner({...banner});
    setShowEditModal(true);
  };

  // Handle save banner
  const handleSaveBanner = (e) => {
    e.preventDefault();
    
    // Update banner in the list
    const updatedBanners = banners.map(banner => 
      banner.id === currentBanner.id ? currentBanner : banner
    );
    
    setBanners(updatedBanners);
    setShowEditModal(false);
    
    // Here you would typically make an API call to update the banner
    alert('Banner updated successfully!');
  };

  // Handle lock/unlock banner
  const handleLockClick = (banner) => {
    setBannerToLock(banner);
    setConfirmLockModal(true);
  };

  const confirmLockBanner = () => {
    // Update banner status
    const updatedBanners = banners.map(banner => 
      banner.id === bannerToLock.id ? 
        { ...banner, status: banner.status === 'active' ? 'inactive' : 'active' } : 
        banner
    );
    
    setBanners(updatedBanners);
    setConfirmLockModal(false);
    
    // Here you would typically make an API call to update the banner status
    alert(`Banner ${bannerToLock.status === 'active' ? 'deactivated' : 'activated'} successfully!`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'adminbanner-badge-success';
      case 'inactive':
        return 'adminbanner-badge-secondary';
      case 'scheduled':
        return 'adminbanner-badge-info';
      default:
        return 'adminbanner-badge-secondary';
    }
  };

  return (
    <div className="adminbanner-container">
      {/* Header */}
      <div className="adminbanner-header">
        <div className="adminbanner-title">
          <h1>Quản lý Banner</h1>
          <p className="text-muted">Quản lý tất cả các banner quảng cáo trên website</p>
        </div>
        <div className="adminbanner-actions">
          <Link to="/admin/add-banner" className="adminbanner-btn adminbanner-btn-primary">
            <i className="bi bi-plus-circle"></i> Thêm Banner Mới
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="adminbanner-filters">
        <div className="adminbanner-search">
          <i className="bi bi-search adminbanner-search-icon"></i>
          <input
            type="text"
            className="adminbanner-search-input"
            placeholder="Tìm kiếm banner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Banners table */}
      <div className="adminbanner-table-container">
        {loading ? (
          <div className="adminbanner-loading">
            <i className="bi bi-arrow-repeat adminbanner-spinner"></i>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {filteredBanners.length === 0 ? (
              <div className="adminbanner-empty-state">
                <i className="bi bi-image"></i>
                <p>Không tìm thấy banner nào</p>
              </div>
            ) : (
              <table className="adminbanner-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('id')}>
                      #ID
                      {sortConfig.key === 'id' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th>Hình ảnh</th>
                    <th onClick={() => requestSort('title')}>
                      Tiêu đề
                      {sortConfig.key === 'title' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('position')}>
                      Vị trí
                      {sortConfig.key === 'position' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('startDate')}>
                      Ngày bắt đầu
                      {sortConfig.key === 'startDate' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('endDate')}>
                      Ngày kết thúc
                      {sortConfig.key === 'endDate' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('status')}>
                      Trạng thái
                      {sortConfig.key === 'status' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('views')}>
                      Lượt xem
                      {sortConfig.key === 'views' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th onClick={() => requestSort('clicks')}>
                      Lượt click
                      {sortConfig.key === 'clicks' && (
                        <i className={`bi bi-caret-${sortConfig.direction === 'ascending' ? 'up' : 'down'}-fill`}></i>
                      )}
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((banner) => (
                    <tr key={banner.id}>
                      <td>{banner.id}</td>
                      <td>
                        <div className="adminbanner-thumbnail">
                          <img src={banner.image} alt={banner.title} />
                        </div>
                      </td>
                      <td>
                        <div className="adminbanner-banner-title">
                          <span>{banner.title}</span>
                          <small className="adminbanner-banner-url">{banner.url}</small>
                        </div>
                      </td>
                      <td>{banner.position}</td>
                      <td>{new Date(banner.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(banner.endDate).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`adminbanner-badge ${getStatusBadgeClass(banner.status)}`}>
                          {banner.status === 'active' ? 'Hoạt động' : 
                           banner.status === 'inactive' ? 'Không hoạt động' : 
                           banner.status === 'scheduled' ? 'Đã lên lịch' : banner.status}
                        </span>
                      </td>
                      <td>{banner.views.toLocaleString()}</td>
                      <td>{banner.clicks.toLocaleString()}</td>
                      <td>
                        <div className="adminbanner-actions-cell">
                          <button 
                            className="adminbanner-btn adminbanner-btn-icon adminbanner-btn-edit"
                            onClick={() => handleEditClick(banner)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className={`adminbanner-btn adminbanner-btn-icon ${banner.status === 'active' ? 'adminbanner-btn-lock' : 'adminbanner-btn-unlock'}`}
                            onClick={() => handleLockClick(banner)}
                            title={banner.status === 'active' ? 'Khóa banner' : 'Mở khóa banner'}
                          >
                            <i className={`bi bi-${banner.status === 'active' ? 'lock' : 'unlock'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && currentBanner && (
        <div className="adminbanner-modal-overlay">
          <div className="adminbanner-modal">
            <div className="adminbanner-modal-header">
              <h2>Chỉnh sửa Banner</h2>
              <button className="adminbanner-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="adminbanner-modal-body">
              <form onSubmit={handleSaveBanner}>
                <div className="adminbanner-form-group">
                  <label className="adminbanner-label">Tiêu đề</label>
                  <input
                    type="text"
                    className="adminbanner-input"
                    value={currentBanner.title}
                    onChange={(e) => setCurrentBanner({...currentBanner, title: e.target.value})}
                    required
                  />
                </div>

                <div className="adminbanner-form-group">
                  <label className="adminbanner-label">URL đích</label>
                  <input
                    type="text"
                    className="adminbanner-input"
                    value={currentBanner.url}
                    onChange={(e) => setCurrentBanner({...currentBanner, url: e.target.value})}
                    required
                  />
                </div>

                <div className="adminbanner-form-row">
                  <div className="adminbanner-form-group">
                    <label className="adminbanner-label">Vị trí hiển thị</label>
                    <select
                      className="adminbanner-select"
                      value={currentBanner.position}
                      onChange={(e) => setCurrentBanner({...currentBanner, position: e.target.value})}
                      required
                    >
                      <option value="Home Top">Trang chủ - Trên cùng</option>
                      <option value="Home Middle">Trang chủ - Giữa trang</option>
                      <option value="Home Bottom">Trang chủ - Dưới cùng</option>
                      <option value="Category Top">Trang danh mục - Trên cùng</option>
                      <option value="Category Bottom">Trang danh mục - Dưới cùng</option>
                    </select>
                  </div>

                  <div className="adminbanner-form-group">
                    <label className="adminbanner-label">Trạng thái</label>
                    <select
                      className="adminbanner-select"
                      value={currentBanner.status}
                      onChange={(e) => setCurrentBanner({...currentBanner, status: e.target.value})}
                      required
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="scheduled">Đã lên lịch</option>
                    </select>
                  </div>
                </div>

                <div className="adminbanner-form-row">
                  <div className="adminbanner-form-group">
                    <label className="adminbanner-label">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="adminbanner-input"
                      value={currentBanner.startDate}
                      onChange={(e) => setCurrentBanner({...currentBanner, startDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="adminbanner-form-group">
                    <label className="adminbanner-label">Ngày kết thúc</label>
                    <input
                      type="date"
                      className="adminbanner-input"
                      value={currentBanner.endDate}
                      onChange={(e) => setCurrentBanner({...currentBanner, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="adminbanner-form-group">
                  <label className="adminbanner-label">Hình ảnh hiện tại</label>
                  <div className="adminbanner-current-image">
                    <img src={currentBanner.image} alt={currentBanner.title} />
                  </div>
                </div>

                <div className="adminbanner-form-group">
                  <label className="adminbanner-label">Thay đổi hình ảnh (tùy chọn)</label>
                  <input
                    type="file"
                    className="adminbanner-input adminbanner-file-input"
                    accept="image/*"
                  />
                  <div className="adminbanner-hint">
                    Kích thước khuyến nghị: 1200x300 pixel, định dạng JPG, PNG
                  </div>
                </div>

                <div className="adminbanner-modal-footer">
                  <button type="button" className="adminbanner-btn adminbanner-btn-outline" onClick={() => setShowEditModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="adminbanner-btn adminbanner-btn-primary">
                    <i className="bi bi-check-lg"></i> Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Lock/Unlock Modal */}
      {confirmLockModal && bannerToLock && (
        <div className="adminbanner-modal-overlay">
          <div className="adminbanner-modal adminbanner-modal-sm">
            <div className="adminbanner-modal-header">
              <h2>{bannerToLock.status === 'active' ? 'Khóa Banner' : 'Mở khóa Banner'}</h2>
              <button className="adminbanner-modal-close" onClick={() => setConfirmLockModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="adminbanner-modal-body">
              <p className="adminbanner-confirm-message">
                {bannerToLock.status === 'active' 
                  ? `Bạn có chắc chắn muốn khóa banner "${bannerToLock.title}"? Banner sẽ không hiển thị trên website sau khi bị khóa.`
                  : `Bạn có chắc chắn muốn mở khóa banner "${bannerToLock.title}"? Banner sẽ được hiển thị lại trên website.`}
              </p>
            </div>
            <div className="adminbanner-modal-footer">
              <button type="button" className="adminbanner-btn adminbanner-btn-outline" onClick={() => setConfirmLockModal(false)}>
                Hủy
              </button>
              <button 
                type="button" 
                className={`adminbanner-btn ${bannerToLock.status === 'active' ? 'adminbanner-btn-danger' : 'adminbanner-btn-success'}`}
                onClick={confirmLockBanner}
              >
                <i className={`bi bi-${bannerToLock.status === 'active' ? 'lock' : 'unlock'}`}></i>
                {bannerToLock.status === 'active' ? ' Khóa Banner' : ' Mở khóa Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBanner; 