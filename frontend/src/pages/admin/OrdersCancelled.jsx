import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/AdminReturnOrder.css';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturnOrders } from '../../slices/AdminReturnOrderSlice';
import { Link } from 'react-router-dom';

const OrdersCancelled = () => {
  const dispatch = useDispatch();
  const { returnOrders, loading, error, pagination } = useSelector((state) => state.adminReturnOrder);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const statusTabs = ['Tất cả', 'Đã yêu cầu', 'Đã chấp thuận', 'Đang xử lý', 'Đã hoàn lại', 'Đã từ chối'];

  useEffect(() => {
    dispatch(fetchReturnOrders(currentPage));
  }, [dispatch, currentPage]);

  const handleShowDeleteModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    // Implement delete functionality here
    setShowDeleteModal(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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
    
    // Apply status filter
    if (selectedStatus !== 'Tất cả' && order.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination?.total_pages || 1;
    const currentPageNumber = pagination?.current_page || 1;

    // Previous button
    items.push(
      <button
        key="prev"
        className={`admin-return-order-pagination-button ${currentPageNumber === 1 ? 'disabled' : ''}`}
        onClick={() => currentPageNumber > 1 && handlePageChange(currentPageNumber - 1)}
        disabled={currentPageNumber === 1}
      >
        <i className="bi bi-chevron-left"></i>
      </button>
    );

    // First page
    items.push(
      <button
        key={1}
        className={`admin-return-order-pagination-button ${currentPageNumber === 1 ? 'active' : ''}`}
        onClick={() => handlePageChange(1)}
      >
        1
      </button>
    );

    // Dots before current page
    if (currentPageNumber > 3) {
      items.push(
        <span key="dots-1" className="admin-return-order-pagination-dots">
          ...
        </span>
      );
    }

    // Pages around current page
    for (let i = Math.max(2, currentPageNumber - 1); i <= Math.min(totalPages - 1, currentPageNumber + 1); i++) {
      if (i === 1 || i === totalPages) continue;
      items.push(
        <button
          key={i}
          className={`admin-return-order-pagination-button ${currentPageNumber === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Dots after current page
    if (currentPageNumber < totalPages - 2) {
      items.push(
        <span key="dots-2" className="admin-return-order-pagination-dots">
          ...
        </span>
      );
    }

    // Last page
    if (totalPages > 1) {
      items.push(
        <button
          key={totalPages}
          className={`admin-return-order-pagination-button ${currentPageNumber === totalPages ? 'active' : ''}`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    items.push(
      <button
        key="next"
        className={`admin-return-order-pagination-button ${currentPageNumber === totalPages ? 'disabled' : ''}`}
        onClick={() => currentPageNumber < totalPages && handlePageChange(currentPageNumber + 1)}
        disabled={currentPageNumber === totalPages}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    );

    return items;
  };

  return (
    <div className="admin-return-order-container">
      {/* Header Section */}
      <div className="admin-return-order-header">
        <div className="admin-return-order-title">
          <h1>Đơn hàng hoàn trả</h1>
          <p className="text-muted">Danh sách đơn hàng đã hoàn trả</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="admin-return-order-status-tabs">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`admin-return-order-status-tab ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
            {status !== 'Tất cả' && (
              <span className="admin-return-order-status-count">
                {returnOrders.filter(order => order.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter Section */}
      <div className="admin-return-order-top-row">
        <div className="admin-return-order-search-box">
          <i className="bi bi-search admin-return-order-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin-return-order-search-input"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-return-order-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="admin-return-order-list admin-return-order-scrollable">
            <table className="admin-return-order-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Mã đơn / Khách hàng</th>
                  <th style={{ width: '15%' }}>Ngày yêu cầu</th>
                  <th className="admin-return-order-hide-sm" style={{ width: '20%' }}>Số tiền hoàn trả</th>
                  <th style={{ width: '20%' }}>Lý do hoàn trả</th>
                  <th style={{ width: '15%' }}>Trạng thái</th>
                  <th style={{ width: '100px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.return_id}>
                      <td>
                        <div className="admin-return-order-code">{order.order_code}</div>
                        <div className="admin-return-order-customer">{order.customer}</div>
                        <div className="admin-return-order-email">{order.email}</div>
                      </td>
                      <td>
                        <div>{order.created_at}</div>
                      </td>
                      <td className="admin-return-order-hide-sm">
                        <div className="admin-return-order-amount">{formatCurrency(order.refund_amount)}</div>
                      </td>
                      <td>
                        <div className="admin-return-order-reason">{order.reason}</div>
                      </td>
                      <td>
                        <span className={`admin-return-order-status admin-return-order-status-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-return-order-actions-col">
                          <Link 
                            to={`/admin/return-request/${order.return_id}`} 
                            className="admin-return-order-action-btn" 
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
                    <td colSpan="6" className="admin-return-order-empty">
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

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="admin-return-order-pagination">
              <div className="admin-return-order-pagination-info">
                Hiển thị {pagination?.per_page || 10} / {pagination?.total || 0} đơn hàng
              </div>
              <div className="admin-return-order-pagination-buttons">
                {renderPaginationItems()}
              </div>
            </div>
          )}
        </>
      )}

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