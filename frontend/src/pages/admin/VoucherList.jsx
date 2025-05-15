import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/voucher.css';
import { Modal, Button } from 'react-bootstrap';

const VoucherList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVoucherId, setCurrentVoucherId] = useState(null);
  const [selectedVouchers, setSelectedVouchers] = useState([]);

  // Mock data for demo
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Generate more mock data for scrolling
      const mockVouchers = [];
      
      // Generate vouchers for demo purposes
      for (let i = 1; i <= 30; i++) {
        const statusOptions = ['active', 'expired', 'used'];
        const typeOptions = ['percent', 'fixed', 'shipping'];
        
        // Create random dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 10);
        
        const voucherType = typeOptions[Math.floor(Math.random() * typeOptions.length)];
        let value, minOrder;
        
        if (voucherType === 'percent') {
          value = Math.floor(Math.random() * 50) + 5; // 5-55% off
          minOrder = Math.floor(Math.random() * 2000000) + 100000; // 100k-2.1M VND
        } else if (voucherType === 'fixed') {
          value = Math.floor(Math.random() * 200000) + 50000; // 50k-250k VND
          minOrder = Math.floor(value * 2 + Math.random() * 500000);
        } else {
          value = Math.floor(Math.random() * 50000) + 10000; // 10k-60k VND shipping discount
          minOrder = Math.floor(Math.random() * 1000000) + 100000;
        }
        
        mockVouchers.push({
          id: i,
          code: `DHSHOP${i.toString().padStart(3, '0')}${Math.floor(Math.random() * 10000)}`,
          type: voucherType,
          value: value,
          minOrder: minOrder,
          status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
          usage: Math.floor(Math.random() * 100),
          limit: Math.floor(Math.random() * 200) + 100,
          startDate: startDate,
          endDate: endDate,
          description: `Giảm ${voucherType === 'percent' ? `${value}%` : formatCurrency(value)} cho đơn hàng từ ${formatCurrency(minOrder)}`
        });
      }
      
      setVouchers(mockVouchers);
      setLoading(false);
    }, 800);
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVouchers(vouchers.map(voucher => voucher.id));
    } else {
      setSelectedVouchers([]);
    }
  };

  const handleSelectVoucher = (voucherId) => {
    if (selectedVouchers.includes(voucherId)) {
      setSelectedVouchers(selectedVouchers.filter(id => id !== voucherId));
    } else {
      setSelectedVouchers([...selectedVouchers, voucherId]);
    }
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleShowDeleteModal = (voucherId) => {
    setCurrentVoucherId(voucherId);
    setShowDeleteModal(true);
  };

  const handleDeleteVoucher = () => {
    // In a real application, you would call an API to delete the voucher
    console.log(`Deleting voucher ${currentVoucherId}`);
    
    // Update the UI by removing the voucher
    setVouchers(vouchers.filter(voucher => voucher.id !== currentVoucherId));
    
    // Remove from selected vouchers if it was selected
    if (selectedVouchers.includes(currentVoucherId)) {
      setSelectedVouchers(selectedVouchers.filter(id => id !== currentVoucherId));
    }
    
    // Close the modal
    setShowDeleteModal(false);
  };

  const handleBulkDelete = () => {
    // In a real application, you would call an API to delete multiple vouchers
    console.log(`Deleting multiple vouchers: ${selectedVouchers.join(', ')}`);
    
    // Update the UI by removing the selected vouchers
    setVouchers(vouchers.filter(voucher => !selectedVouchers.includes(voucher.id)));
    
    // Clear selection
    setSelectedVouchers([]);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'expired':
        return 'Hết hạn';
      case 'used':
        return 'Đã sử dụng hết';
      default:
        return 'Không xác định';
    }
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'adminvoucher-status-active';
      case 'expired':
        return 'adminvoucher-status-expired';
      case 'used':
        return 'adminvoucher-status-used';
      default:
        return '';
    }
  };

  // Get type label in Vietnamese
  const getTypeLabel = (type) => {
    switch (type) {
      case 'percent':
        return 'Giảm theo %';
      case 'fixed':
        return 'Giảm số tiền cố định';
      case 'shipping':
        return 'Giảm phí vận chuyển';
      default:
        return 'Không xác định';
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    // Apply search filter
    if (searchTerm && 
        !voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !voucher.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply status filter
    if (filterStatus && voucher.status !== filterStatus) {
      return false;
    }
    
    // Apply type filter
    if (filterType && voucher.type !== filterType) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="adminvoucher-container">
      {/* Header Section */}
      <div className="adminvoucher-header">
        <div className="adminvoucher-title">
          <h1>Voucher khuyến mãi</h1>
          <p className="text-muted">Quản lý danh sách voucher và mã giảm giá</p>
        </div>
        <div className="adminvoucher-actions">
          <button className="adminvoucher-btn adminvoucher-btn-primary">
            <i className="bi bi-plus-circle"></i> Thêm voucher mới
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="adminvoucher-top-row">
        <div className="adminvoucher-search-box">
          <i className="bi bi-search adminvoucher-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="adminvoucher-search-input"
            placeholder="Tìm kiếm theo mã voucher, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="adminvoucher-filters">
          <button 
            className="adminvoucher-btn adminvoucher-btn-outline" 
            onClick={handleFilterToggle}
          >
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
          <button className="adminvoucher-btn adminvoucher-btn-outline">
            <i className="bi bi-sort-down" style={{ color: '#5ac8fa' }}></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="adminvoucher-filter-panel">
          <div className="adminvoucher-filter-row">
            <div className="adminvoucher-filter-column">
              <div className="adminvoucher-filter-group">
                <label className="adminvoucher-filter-label">Trạng thái</label>
                <select 
                  className="adminvoucher-filter-select" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="expired">Hết hạn</option>
                  <option value="used">Đã sử dụng hết</option>
                </select>
              </div>
            </div>
            <div className="adminvoucher-filter-column">
              <div className="adminvoucher-filter-group">
                <label className="adminvoucher-filter-label">Loại voucher</label>
                <select 
                  className="adminvoucher-filter-select" 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="percent">Giảm theo %</option>
                  <option value="fixed">Giảm số tiền cố định</option>
                  <option value="shipping">Giảm phí vận chuyển</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Actions */}
      {selectedVouchers.length > 0 && (
        <div className="adminvoucher-bulk-actions">
          <div className="adminvoucher-bulk-actions-info">{selectedVouchers.length} voucher đã chọn</div>
          <div className="adminvoucher-bulk-actions-buttons">
            <button 
              className="adminvoucher-btn adminvoucher-btn-outline"
              onClick={() => setSelectedVouchers([])}
            >
              <i className="bi bi-x-circle" style={{ color: '#5ac8fa' }}></i> Bỏ chọn
            </button>
            <button 
              className="adminvoucher-btn adminvoucher-btn-danger"
              onClick={handleBulkDelete}
            >
              <i className="bi bi-trash" style={{ color: '#ffffff' }}></i> Xóa đã chọn
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="adminvoucher-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="adminvoucher-list adminvoucher-scrollable">
          <table className="adminvoucher-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}>
                  <input
                    type="checkbox"
                    className="adminvoucher-checkbox"
                    onChange={handleSelectAll}
                    checked={selectedVouchers.length === vouchers.length && vouchers.length > 0}
                  />
                </th>
                <th style={{ width: '15%' }}>Mã voucher</th>
                <th style={{ width: '20%' }}>Mô tả</th>
                <th style={{ width: '10%' }}>Giá trị</th>
                <th className="adminvoucher-hide-sm" style={{ width: '15%' }}>Thời gian</th>
                <th style={{ width: '10%' }}>Sử dụng</th>
                <th style={{ width: '10%' }}>Trạng thái</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map(voucher => (
                  <tr key={voucher.id} className={selectedVouchers.includes(voucher.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="adminvoucher-checkbox"
                        checked={selectedVouchers.includes(voucher.id)}
                        onChange={() => handleSelectVoucher(voucher.id)}
                      />
                    </td>
                    <td>
                      <div className="adminvoucher-code">{voucher.code}</div>
                      <div className="adminvoucher-type">{getTypeLabel(voucher.type)}</div>
                    </td>
                    <td>
                      <div className="adminvoucher-description">{voucher.description}</div>
                    </td>
                    <td>
                      <div className="adminvoucher-value">
                        {voucher.type === 'percent' 
                          ? `${voucher.value}%` 
                          : formatCurrency(voucher.value)
                        }
                      </div>
                      <div className="adminvoucher-min-order">Đơn tối thiểu: {formatCurrency(voucher.minOrder)}</div>
                    </td>
                    <td className="adminvoucher-hide-sm">
                      <div>{format(voucher.startDate, 'dd/MM/yyyy', { locale: vi })}</div>
                      <div className="adminvoucher-date-separator">→</div>
                      <div>{format(voucher.endDate, 'dd/MM/yyyy', { locale: vi })}</div>
                    </td>
                    <td>
                      <div className="adminvoucher-usage-wrapper">
                        <div className="adminvoucher-usage">
                          <div className="adminvoucher-usage-bar">
                            <div 
                              className="adminvoucher-usage-progress" 
                              style={{ width: `${(voucher.usage / voucher.limit) * 100}%` }}
                            ></div>
                          </div>
                          <div className="adminvoucher-usage-text">
                            {voucher.usage}/{voucher.limit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`adminvoucher-status ${getStatusClass(voucher.status)}`}>
                        {getStatusLabel(voucher.status)}
                      </span>
                    </td>
                    <td>
                      <div className="adminvoucher-actions-col">
                        <button className="adminvoucher-action-btn adminvoucher-edit-btn" title="Sửa">
                          <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                        </button>
                        <button 
                          className="adminvoucher-action-btn adminvoucher-delete-btn" 
                          title="Xóa"
                          onClick={() => handleShowDeleteModal(voucher.id)}
                        >
                          <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="adminvoucher-empty">
                    <div>
                      <i className="bi bi-ticket-perforated" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                      <p>Không tìm thấy voucher nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Voucher count */}
      <div className="adminvoucher-count">
        Hiển thị {filteredVouchers.length} trong tổng số {vouchers.length} voucher
      </div>

      {/* Delete Voucher Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa voucher này?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteVoucher}>
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VoucherList; 