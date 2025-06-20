import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, updateOrderStatus } from "../../slices/adminOrderSlice";
import "../../assets/admin/HomeAdmin.css";
import "../../assets/admin/order.css";
import "../../assets/admin/OrdersList.css";
import { FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAdminOrders(currentPage));
  }, [dispatch, currentPage]);

  const normalizeString = (str) =>
    str?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") || "";

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        !statusFilter || normalizeString(order.status) === normalizeString(statusFilter);
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Pagination client-side
  const ORDERS_PER_PAGE = 10;
  const totalOrders = filteredOrders.length;
  const lastPage = Math.ceil(totalOrders / ORDERS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  const handleEditOrder = (order) => {
    navigate(`/admin/editorder/${order.order_id}`);
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/orderdetail/${order.order_id}`, {
      state: { order },
    });
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    MySwal.fire({
      title: "Xác nhận cập nhật",
      text: `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang \"${newStatus}\" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#007aff",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(updateOrderStatus({ orderId, status: newStatus }));
        setSelectedOrder(null);
        Swal.fire("Thành công", "Trạng thái đơn hàng đã được cập nhật.", "success");
      }
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  // Toggle filter panel
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="admin_order-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header Section */}
      <div className="admin_order-header">
        <div className="admin_order-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>
      {/* Filter/Search Section */}
      <div className="admin_order-top-row" style={{ display: 'flex', width: '100%', maxWidth: 1200, margin: '0 auto', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: Search */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="admin_order-search-box">
            <i className="bi bi-search admin_order-search-icon" style={{ color: "#0071e3" }}></i>
            <input
              type="text"
              className="admin_order-search-input"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Right: Filter */}
        <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <button 
            className="admin_order-btn admin_order-btn-outline" 
            onClick={handleFilterToggle}
            style={{ marginBottom: 12 }}
          >
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
          {showFilters && (
            <div className="admin_order-filter-panel" style={{ minWidth: 220 }}>
              <div className="admin_order-filter-row">
                <div className="admin_order-filter-column">
                  <div className="admin_order-filter-group">
                    <label className="admin_order-filter-label">Trạng thái đơn hàng</label>
                    <select 
                      className="admin_order-filter-select" 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Chờ lấy hàng">Chờ lấy hàng</option>
                      <option value="Đang vận chuyển">Đang vận chuyển</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Đã giao hàng">Đã Giao hàng</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Danh sách đơn hàng */}
      {loading ? (
        <div className="admin_order-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="admin_order-list" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginTop: 16 }}>
          <table className="admin_order-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th style={{ width: '20%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày đặt</th>
                <th className="admin_order-hide-sm" style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '15%' }}>Thanh toán</th>
                <th style={{ width: '15%' }}>Trạng thái</th>
                <th style={{ width: '80px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, idx) => {
                  const stt = (currentPage - 1) * ORDERS_PER_PAGE + idx + 1;
                  return (
                    <tr key={order.order_id}>
                      <td>
                        <div className="admin_order-avatar">
                          <img src={order.user?.image_url || '/default-avatar.png'} alt={order.customer} />
                        </div>
                      </td>
                      <td>
                        <div className="admin_order-code">{order.order_code}</div>
                        <div className="admin_order-customer">{order.customer}</div>
                      </td>
                      <td>
                        <div>{order.created_at}</div>
                      </td>
                      <td className="admin_order-hide-sm">
                        <div className="admin_order-amount">{formatCurrency(order.total_amount)}</div>
                        <div className="admin_order-items">{order.items_count || 0} sản phẩm</div>
                      </td>
                      <td>
                        <span className="admin_order-payment">{order.payment_method}</span>
                      </td>
                      <td>
                        <span className={`admin_order-status admin_order-status-${normalizeString(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="adminorder-action-group">
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="Sửa trạng thái"
                          >
                            <FiEdit size={24} />
                          </button>
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                          >
                            <FiEye size={24} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
      {/* Pagination */}
      <div className="admin_order-count">
        Hiển thị {paginatedOrders.length} trong tổng số {filteredOrders.length} đơn hàng
      </div>
      <div className="adminorder-pagination">
        <button
          className="adminorder-page-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trang trước
        </button>
        <span className="adminorder-page-info">
          {currentPage} / {lastPage}
        </span>
        <button
          className="adminorder-page-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          Trang sau
        </button>
      </div>
      {/* Modal giữ nguyên */}
      {selectedOrder && (
        <div className="adminorder-modal-backdrop">
          <div className="adminorder-modal">
            <h2>Chi tiết đơn hàng</h2>
            {/* Thông tin khách hàng */}
            {selectedOrder.user && (
              <div className="adminorder-customer-box">
                <div className="adminorder-customer-avatar">
                  <img src={selectedOrder.user.image_url} alt={selectedOrder.user.full_name} />
                </div>
                <div className="adminorder-customer-info">
                  <div><strong>Họ tên:</strong> {selectedOrder.user.full_name}</div>
                  <div><strong>Username:</strong> {selectedOrder.user.username}</div>
                  <div><strong>Email:</strong> {selectedOrder.user.email}</div>
                  <div><strong>SĐT:</strong> {selectedOrder.user.phone}</div>
                  <div><strong>Địa chỉ:</strong> {selectedOrder.user.address}
                    {selectedOrder.user.ward ? `, ${selectedOrder.user.ward}` : ''}
                    {selectedOrder.user.district ? `, ${selectedOrder.user.district}` : ''}
                    {selectedOrder.user.city ? `, ${selectedOrder.user.city}` : ''}
                  </div>
                  <div><strong>Vai trò:</strong> {selectedOrder.user.role}</div>
                </div>
              </div>
            )}
            <table className="adminorder-details-table">
              <tbody>
                <tr><td><strong>Mã đơn:</strong></td><td>{selectedOrder.order_code}</td></tr>
                <tr><td><strong>Khách hàng :</strong></td><td>{selectedOrder.customer}</td></tr>
                <tr><td><strong>Phương thức:</strong></td><td>{selectedOrder.payment_method}</td></tr>
                <tr><td><strong>Tổng tiền:</strong></td><td>{Number(selectedOrder.total_amount).toLocaleString("vi-VN")}₫</td></tr>
                <tr>
                  <td><strong>Trạng thái:</strong></td>
                  <td>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, status: e.target.value })
                      }
                      className="adminorder-status-select"
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Chờ lấy hàng">Chờ lấy hàng</option>
                      <option value="Đang vận chuyển">Đang vận chuyển</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Đã giao hàng">Đã giao hàng</option>
                    </select>
                  </td>
                </tr>
                <tr><td><strong>Thanh toán:</strong></td><td>{selectedOrder.payment_status}</td></tr>
                <tr><td><strong>Voucher:</strong></td><td>{selectedOrder.voucher_id || "Không có"}</td></tr>
                <tr><td><strong>Ngày tạo:</strong></td><td>{selectedOrder.created_at}</td></tr>
              </tbody>
            </table>

            <div className="adminorder-modal-actions">
              <button
                className="adminorder-btn-submit"
                onClick={() =>
                  handleStatusUpdate(selectedOrder.order_id, selectedOrder.status)
                }
              >
                Cập nhật
              </button>
              <button
                className="adminorder-btn-cancel"
                onClick={() => setSelectedOrder(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
