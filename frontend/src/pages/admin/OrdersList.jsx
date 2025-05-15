import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/order.css';
import { Modal, Button, Form } from 'react-bootstrap';

const OrdersList = () => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [customReason, setCustomReason] = useState('');

  // Mock data for demo
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Generate more mock data for scrolling
      const mockOrders = [];
      
      // Generate orders for demo purposes
      for (let i = 1; i <= 30; i++) {
        const statusOptions = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        const paymentOptions = ['COD', 'Banking', 'Momo', 'ZaloPay', 'VNPay'];
        
        // Create a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        mockOrders.push({
          id: i,
          orderCode: `DH-2023-${i.toString().padStart(4, '0')}`,
          customerName: `Khách hàng ${i}`,
          avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 30}.jpg`,
          email: `customer${i}@example.com`,
          phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
          totalAmount: Math.floor(1000000 + Math.random() * 15000000),
          status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
          paymentMethod: paymentOptions[Math.floor(Math.random() * paymentOptions.length)],
          items: Math.floor(1 + Math.random() * 5),
          date: date
        });
      }
      
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleShowCancelModal = (orderId) => {
    setCurrentOrderId(orderId);
    setShowCancelModal(true);
    setCancelReason('');
    setCustomReason('');
  };

  const handleCancelOrder = () => {
    // Get the final reason (either selected or custom)
    const finalReason = cancelReason === 'other' ? customReason : cancelReason;
    
    // In a real application, you would call an API to cancel the order
    console.log(`Cancelling order ${currentOrderId} with reason: ${finalReason}`);
    
    // Update the order status in the UI
    setOrders(orders.map(order => 
      order.id === currentOrderId ? {...order, status: 'cancelled'} : order
    ));
    
    // Close the modal
    setShowCancelModal(false);
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'admin_order-status-completed';
      case 'processing':
        return 'admin_order-status-processing';
      case 'shipped':
        return 'admin_order-status-shipped';
      case 'pending':
        return 'admin_order-status-pending';
      case 'cancelled':
        return 'admin_order-status-cancelled';
      default:
        return '';
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
    
    // Apply status filter
    if (filterStatus && getStatusLabel(order.status) !== filterStatus) {
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
          <h1>Đơn hàng</h1>
          <p className="text-muted">Quản lý danh sách đơn hàng</p>
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
                <label className="admin_order-filter-label">Trạng thái</label>
                <select 
                  className="admin_order-filter-select" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đang giao">Đang giao</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đã hủy">Đã hủy</option>
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

      {/* Selected Actions */}
      {selectedOrders.length > 0 && (
        <div className="admin_order-bulk-actions">
          <div className="admin_order-bulk-actions-info">{selectedOrders.length} đơn hàng đã chọn</div>
          <div className="admin_order-bulk-actions-buttons">
            <button className="admin_order-btn admin_order-btn-outline">
              <i className="bi bi-printer" style={{ color: '#5ac8fa' }}></i> In hóa đơn
            </button>
            <button className="admin_order-btn admin_order-btn-danger">
              <i className="bi bi-x-circle" style={{ color: '#ffffff' }}></i> Hủy đơn hàng
            </button>
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
                <th style={{ width: '30px' }}>
                  <input
                    type="checkbox"
                    className="admin_order-checkbox"
                    onChange={handleSelectAll}
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                  />
                </th>
                <th style={{ width: '40px' }}></th>
                <th style={{ width: '20%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày đặt</th>
                <th className="admin_order-hide-sm" style={{ width: '15%' }}>Tổng tiền</th>
                <th style={{ width: '15%' }}>Thanh toán</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="admin_order-checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
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
                      <span className="admin_order-payment">{order.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`admin_order-status ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin_order-actions-col">
                        <button className="admin_order-action-btn admin_order-edit-btn" title="Sửa">
                          <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                        </button>
                        <button className="admin_order-action-btn" title="Xem chi tiết">
                          <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                        </button>
                        <button 
                          className="admin_order-action-btn admin_order-delete-btn" 
                          title="Hủy đơn"
                          onClick={() => handleShowCancelModal(order.id)}
                          disabled={order.status === 'cancelled' || order.status === 'completed'}
                        >
                          <i className="bi bi-x-circle" style={{ color: '#ff3b30' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin_order-empty">
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
        Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
      </div>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn lý do hủy đơn hàng:</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="radio"
                id="reason-1"
                label="Khách hàng yêu cầu hủy"
                name="cancelReason"
                value="customer_request"
                checked={cancelReason === 'customer_request'}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Form.Check
                type="radio"
                id="reason-2"
                label="Sản phẩm hết hàng"
                name="cancelReason"
                value="out_of_stock"
                checked={cancelReason === 'out_of_stock'}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Form.Check
                type="radio"
                id="reason-3"
                label="Thông tin giao hàng không chính xác"
                name="cancelReason"
                value="incorrect_shipping_info"
                checked={cancelReason === 'incorrect_shipping_info'}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Form.Check
                type="radio"
                id="reason-4"
                label="Đơn hàng trùng lặp"
                name="cancelReason"
                value="duplicate_order"
                checked={cancelReason === 'duplicate_order'}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Form.Check
                type="radio"
                id="reason-5"
                label="Lý do khác"
                name="cancelReason"
                value="other"
                checked={cancelReason === 'other'}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              
              {cancelReason === 'other' && (
                <Form.Group className="mt-2">
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Nhập lý do hủy đơn hàng"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </Form.Group>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Đóng
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelOrder}
            disabled={!cancelReason || (cancelReason === 'other' && !customReason)}
          >
            Xác nhận hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersList; 