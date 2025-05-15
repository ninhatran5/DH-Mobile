import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/order.css';
import { Modal, Button } from 'react-bootstrap';

const OrdersCancelled = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Mock data for demo
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Generate more mock data for scrolling
      const mockOrders = [];
      
      // Generate orders for demo purposes
      for (let i = 1; i <= 30; i++) {
        // All orders are cancelled
        const paymentOptions = ['COD', 'Banking', 'Momo', 'ZaloPay', 'VNPay'];
        const reasonOptions = [
          'customer_request', 
          'out_of_stock', 
          'incorrect_shipping_info', 
          'duplicate_order', 
          'other'
        ];
        
        // Create a random date within the last 90 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        mockOrders.push({
          id: i,
          orderCode: `DH-2023-${i.toString().padStart(4, '0')}`,
          customerName: `Khách hàng ${i}`,
          avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 30}.jpg`,
          email: `customer${i}@example.com`,
          phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
          totalAmount: Math.floor(1000000 + Math.random() * 15000000),
          status: 'cancelled',
          cancelReason: reasonOptions[Math.floor(Math.random() * reasonOptions.length)],
          paymentMethod: paymentOptions[Math.floor(Math.random() * paymentOptions.length)],
          items: Math.floor(1 + Math.random() * 5),
          date: date
        });
      }
      
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleShowDeleteModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleDeleteOrder = () => {
    // In a real application, you would call an API to delete the order
    console.log(`Deleting order ${currentOrderId}`);
    
    // Update the UI by removing the order
    setOrders(orders.filter(order => order.id !== currentOrderId));
    
    // Close the modal
    setShowDeleteModal(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get reason label in Vietnamese
  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'customer_request':
        return 'Khách hàng yêu cầu hủy';
      case 'out_of_stock':
        return 'Sản phẩm hết hàng';
      case 'incorrect_shipping_info':
        return 'Thông tin giao hàng không chính xác';
      case 'duplicate_order':
        return 'Đơn hàng trùng lặp';
      case 'other':
        return 'Lý do khác';
      default:
        return 'Không xác định';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Apply search filter
    if (searchTerm && 
        !order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.phone.includes(searchTerm) &&
        !order.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply reason filter
    if (filterReason && order.cancelReason !== filterReason) {
      return false;
    }
    
    // Apply payment filter
    if (filterPayment && order.paymentMethod !== filterPayment) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="admin_order-container">
      {/* Header Section */}
      <div className="admin_order-header">
        <div className="admin_order-title">
          <h1>Đơn hàng đã hủy</h1>
          <p className="text-muted">Danh sách đơn hàng đã hủy</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="admin_order-top-row">
        <div className="admin_order-search-box">
          <i className="bi bi-search admin_order-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin_order-search-input"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
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
          <button className="admin_order-btn admin_order-btn-outline">
            <i className="bi bi-sort-down" style={{ color: '#5ac8fa' }}></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="admin_order-filter-panel">
          <div className="admin_order-filter-row">
            <div className="admin_order-filter-column">
              <div className="admin_order-filter-group">
                <label className="admin_order-filter-label">Lý do hủy đơn</label>
                <select 
                  className="admin_order-filter-select" 
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="customer_request">Khách hàng yêu cầu hủy</option>
                  <option value="out_of_stock">Sản phẩm hết hàng</option>
                  <option value="incorrect_shipping_info">Thông tin giao hàng không chính xác</option>
                  <option value="duplicate_order">Đơn hàng trùng lặp</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>
            </div>
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
                <th style={{ width: '40px' }}></th>
                <th style={{ width: '20%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày hủy</th>
                <th className="admin_order-hide-sm" style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '15%' }}>Lý do hủy</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div className="admin_order-avatar">
                        <img src={order.avatar} alt={order.customerName} />
                      </div>
                    </td>
                    <td>
                      <div className="admin_order-code">{order.orderCode}</div>
                      <div className="admin_order-customer">{order.customerName}</div>
                    </td>
                    <td>
                      <div>{format(order.date, 'dd/MM/yyyy', { locale: vi })}</div>
                      <div className="admin_order-time">{format(order.date, 'HH:mm')}</div>
                    </td>
                    <td className="admin_order-hide-sm">
                      <div className="admin_order-amount">{formatCurrency(order.totalAmount)}</div>
                      <div className="admin_order-items">{order.items} sản phẩm</div>
                    </td>
                    <td>
                      <span className="admin_order-reason">{getReasonLabel(order.cancelReason)}</span>
                    </td>
                    <td>
                      <span className="admin_order-status admin_order-status-cancelled">
                        Đã hủy
                      </span>
                    </td>
                    <td>
                      <div className="admin_order-actions-col">
                        <button className="admin_order-action-btn" title="Xem chi tiết">
                          <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                        </button>
                        <button 
                          className="admin_order-action-btn admin_order-delete-btn" 
                          title="Xóa đơn hàng"
                          onClick={() => handleShowDeleteModal(order.id)}
                        >
                          <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="admin_order-empty">
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
        Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng đã hủy
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