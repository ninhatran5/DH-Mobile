import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/order.css';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturnOrders } from '../../slices/adminOrderSlice';
import { Link } from 'react-router-dom';

const OrdersCancelled = () => {
  const dispatch = useDispatch();
  const { returnOrders, loading, error } = useSelector((state) => state.adminOrder);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const statusTabs = ['Tất cả', 'Đã yêu cầu', 'Đã chấp thuận', 'Đang xử lý', 'Đã hoàn lại', 'Đã từ chối'];

  useEffect(() => {
    dispatch(fetchReturnOrders(currentPage));
  }, [dispatch, currentPage]);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleShowDeleteModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    // Implement delete functionality here
    setShowDeleteModal(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Đã yêu cầu': 'pending',
      'Đã chấp thuận': 'approved',
      'Đã từ chối': 'rejected',
      'Đang xử lý': 'processing',
      'Đã hoàn lại': 'refunded',
      'Đã hủy': 'cancelled'
    };
    return statusColors[status] || 'default';
  };

  const filteredOrders = returnOrders.filter(order => {
    // Apply search filter
    if (searchTerm && 
        !order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply payment filter
    if (filterPayment && order.payment_method !== filterPayment) {
      return false;
    }

    // Apply status filter
    if (selectedStatus !== 'Tất cả' && order.return_status !== selectedStatus) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="admin_order-container">
      {/* Header Section */}
      <div className="admin_order-header">
        <div className="admin_order-title">
          <h1>Đơn hàng hoàn trả</h1>
          <p className="text-muted">Danh sách đơn hàng đã hoàn trả</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="admin_order-status-tabs">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`admin_order-status-tab ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
            {status !== 'Tất cả' && (
              <span className="admin_order-status-count">
                {returnOrders.filter(order => order.return_status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Section */}
      <div className="admin_order-top-row">
        <div className="admin_order-search-box">
          <i className="bi bi-search admin_order-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin_order-search-input"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin_order-filters">
          <button 
            className="admin_order-btn admin_order-btn-outline" 
            onClick={handleFilterToggle}
          >
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="admin_order-filter-panel">
          <div className="admin_order-filter-row">
            <div className="admin_order-filter-column">
              <div className="admin_order-filter-group">
                <label className="admin_order-filter-label">Phương thức thanh toán</label>
                <select 
                  className="admin_order-filter-select" 
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="COD">COD</option>
                  <option value="Banking">Banking</option>
                  <option value="Momo">Momo</option>
                  <option value="ZaloPay">ZaloPay</option>
                  <option value="VNPay">VNPay</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin_order-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="admin_order-list admin_order-scrollable">
          <table className="admin_order-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày hoàn trả</th>
                <th className="admin_order-hide-sm" style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '15%' }}>Trạng thái hoàn trả</th>
                <th style={{ width: '15%' }}>Trạng thái hoàn tiền</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>
                      <div className="admin_order-code">{order.order_code}</div>
                      <div className="admin_order-customer">{order.customer}</div>
                      <div className="admin_order-email">{order.email}</div>
                    </td>
                    <td>
                      <div>{order.latest_return_request?.created_at}</div>
                    </td>
                    <td className="admin_order-hide-sm">
                      <div className="admin_order-amount">{formatCurrency(order.total_amount)}</div>
                    </td>
                    <td>
                      <span className={`admin_order-status admin_order-status-${getStatusColor(order.return_status)}`}>
                        {order.return_status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin_order-status admin_order-status-${order.payment_status === 'Đã hoàn tiền' ? 'refunded' : 'processing'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <div className="admin_order-actions-col">
                        <Link 
                          to={`/admin/orderdetail/${order.order_id}`} 
                          className="admin_order-action-btn" 
                          title="Xem chi tiết"
                        >
                          <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin_order-empty">
                    <div>
                      <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                      <p>Không tìm thấy đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order count */}
      <div className="admin_order-count">
        Hiển thị {filteredOrders.length} đơn hàng hoàn trả
      </div>

      {/* Delete Order Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa đơn hàng này?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteOrder}>
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersCancelled; 