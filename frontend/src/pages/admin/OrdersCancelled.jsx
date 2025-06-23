import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/AdminReturnOrder.css';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturnOrders, updateReturnOrderStatus } from '../../slices/AdminReturnOrderSlice';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const OrdersCancelled = () => {
  const dispatch = useDispatch();
  const { returnOrders, loading, error, pagination, updateLoading } = useSelector((state) => state.adminReturnOrder);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const statusTabs = ['Tất cả', 'Đã yêu cầu', 'Đã chấp thuận', 'Đang xử lý', 'Đã hoàn lại', 'Đã từ chối'];
  
  // Status progression flow
  const statusFlow = [
    'Đã yêu cầu',
    'Đã chấp thuận',
    'Đang xử lý',
    'Đã hoàn lại'
  ];

  useEffect(() => {
    dispatch(fetchReturnOrders(currentPage));
  }, [dispatch, currentPage]);

  const handleShowDeleteModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowDeleteModal(true);
  };

  // Get the next status in the flow
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) {
      return null;
    }
    return statusFlow[currentIndex + 1];
  };

  const handleStatusUpdate = (order) => {
    const currentStatus = order.status;
    const nextStatus = getNextStatus(currentStatus);
    
    if (!nextStatus) return;
    
    // Show confirmation dialog
    Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      text: `Bạn muốn chuyển từ trạng thái "${currentStatus}" sang trạng thái "${nextStatus}" không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#007aff'
    }).then((result) => {
      if (result.isConfirmed) {
        setProcessingOrderId(order.return_id);
        
        // Determine if we're approving or rejecting the return request
        const isApproving = true; // Always approving when advancing to next step
        
        dispatch(updateReturnOrderStatus({ orderId: order.order_id, status: isApproving }))
          .unwrap()
          .then((response) => {
            Swal.fire({
              title: 'Thành công',
              text: 'Cập nhật trạng thái yêu cầu hoàn hàng thành công',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            setProcessingOrderId(null);
          })
          .catch((error) => {
            Swal.fire({
              title: 'Lỗi',
              text: error || 'Có lỗi xảy ra khi cập nhật trạng thái',
              icon: 'error'
            });
            setProcessingOrderId(null);
          });
      }
    });
  };

  const handleRejectReturn = (order) => {
    // Show confirmation dialog for rejection
    Swal.fire({
      title: 'Xác nhận từ chối',
      text: `Bạn muốn chuyển từ trạng thái "${order.status}" sang trạng thái "Đã từ chối" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        setProcessingOrderId(order.return_id);
        
        dispatch(updateReturnOrderStatus({ orderId: order.order_id, status: false }))
          .unwrap()
          .then((response) => {
            Swal.fire({
              title: 'Thành công',
              text: 'Đã từ chối yêu cầu hoàn hàng',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            setProcessingOrderId(null);
          })
          .catch((error) => {
            Swal.fire({
              title: 'Lỗi',
              text: error || 'Có lỗi xảy ra khi cập nhật trạng thái',
              icon: 'error'
            });
            setProcessingOrderId(null);
          });
      }
    });
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
    
    if (selectedStatus !== 'Tất cả' && order.status !== selectedStatus) {
      return false;
    }
    
    return true;
  });

  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination?.total_pages || 1;
    const currentPageNumber = pagination?.current_page || 1;

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

    if (currentPageNumber > 3) {
      items.push(
        <span key="dots-1" className="admin-return-order-pagination-dots">
          ...
        </span>
      );
    }

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

    if (currentPageNumber < totalPages - 2) {
      items.push(
        <span key="dots-2" className="admin-return-order-pagination-dots">
          ...
        </span>
      );
    }

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
      <div className="admin-return-order-header">
        <div className="admin-return-order-title">
          <h1>Đơn hàng hoàn trả</h1>
          <p className="text-muted">Danh sách đơn hàng đã hoàn trả</p>
        </div>
      </div>

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
                          {processingOrderId === order.return_id ? (
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Đang xử lý...</span>
                            </div>
                          ) : (
                            <>
                              {order.status !== 'Đã từ chối' && order.status !== 'Đã hoàn lại' && (
                                <>
                                  {/* Nút chuyển sang trạng thái tiếp theo */}
                                  {getNextStatus(order.status) && (
                                    <button
                                      className="admin-return-order-action-btn"
                                      onClick={() => handleStatusUpdate(order)}
                                      title={`Chuyển sang ${getNextStatus(order.status)}`}
                                    >
                                      <i className="bi bi-arrow-right-circle" style={{ color: '#007aff' }}></i>
                                    </button>
                                  )}
                                  
                                  {/* Nút từ chối chỉ hiển thị khi đơn đang ở trạng thái "Đã yêu cầu" */}
                                  {order.status === 'Đã yêu cầu' && (
                                    <button
                                      className="admin-return-order-action-btn"
                                      onClick={() => handleRejectReturn(order)}
                                      title="Từ chối yêu cầu"
                                    >
                                      <i className="bi bi-x-circle" style={{ color: '#dc3545' }}></i>
                                    </button>
                                  )}
                                </>
                              )}
                              <Link 
                                to={`/admin/return-request/${order.return_id}`} 
                                className="admin-return-order-action-btn" 
                                title="Xem chi tiết"
                              >
                                <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                              </Link>
                            </>
                          )}
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

      {/* Delete Modal */}
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