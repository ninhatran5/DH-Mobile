import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, updateOrderStatus, cancelOrder } from "../../slices/adminOrderSlice";
import "../../assets/admin/HomeAdmin.css";
import "../../assets/admin/order.css";
import "../../assets/admin/OrdersList.css";
import { FiEdit, FiEye, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
import DefaultImage from "../../assets/images/adminacccount.jpg";
import Loading from "../../components/Loading";

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
  const [selectedStatusTab, setSelectedStatusTab] = useState("Tất cả");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAdminOrders(currentPage));
  }, [dispatch, currentPage]);

  const normalizeString = (str) =>
    str?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-") || "";

  const statusTabs = [
    "Tất cả",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang vận chuyển",
    "Đã giao hàng",
    "Hoàn thành",
    "Đã huỷ"
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        !statusFilter || normalizeString(order.status) === normalizeString(statusFilter);
      const matchTab =
        selectedStatusTab === "Tất cả" ||
        normalizeString(order.status) === normalizeString(selectedStatusTab);
      return matchSearch && matchStatus && matchTab;
    });
  }, [orders, searchTerm, statusFilter, selectedStatusTab]);

  // Pagination client-side
  const ORDERS_PER_PAGE = 15;
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
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsUpdatingStatus(true);
        dispatch(updateOrderStatus({ orderId, status: newStatus }))
          .then(() => {
            setSelectedOrder(null);
            Swal.fire("Thành công", "Trạng thái đơn hàng đã được cập nhật.", "success");
            dispatch(fetchAdminOrders(currentPage));
          })
          .finally(() => {
            setIsUpdatingStatus(false);
          });
      }
    });
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = () => {
    if (!cancelReason.trim()) {
      Swal.fire("Lý do huỷ không được để trống", "", "warning");
      return;
    }
    setIsUpdatingStatus(true);
    dispatch(cancelOrder({ orderId: orderToCancel.order_id, cancel_reason: cancelReason }))
      .then(() => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        Swal.fire("Đã huỷ đơn hàng", "Đơn hàng đã được huỷ thành công.", "success");
        dispatch(fetchAdminOrders(currentPage));
      })
      .finally(() => {
        setIsUpdatingStatus(false);
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

  // Get color class for status
  const getStatusColorClass = (status) => {
    const normalized = normalizeString(status);
    return `admin_order-status-${normalized}`;
  };

  return (
    <div className="admin_order-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isUpdatingStatus && <Loading />}
      <div className="admin_order-header">
        <div className="admin_order-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>
      {/* Thanh tìm kiếm sát trái và kéo dài */}
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', marginBottom: 16 }}>
        <div className="admin_order-search-box" style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <i
            className="bi bi-search admin_order-search-icon"
            style={{
              color: "#0071e3",
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none"
            }}
          ></i>
          <input
            type="text"
            className="admin_order-search-input"
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: 36 }}
          />
        </div>
      </div>
      {/* Thêm tabs filter trạng thái */}
      <div className="admin_order-status-tabs" style={{ margin: '16px 0', width: '100%', maxWidth: 1200 }}>
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`admin_order-status-tab${selectedStatusTab === status ? ' active' : ''}`}
            onClick={() => setSelectedStatusTab(status)}
            style={{
              marginRight: 8,
              padding: '6px 16px',
              border: 'none',
              borderRadius: 16,
              background: selectedStatusTab === status ? '#007aff' : '#f1f1f1',
              color: selectedStatusTab === status ? '#fff' : '#222',
              fontWeight: selectedStatusTab === status ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            {status}
            {status !== "Tất cả" && (
              <span
                className="admin_order-status-count"
                style={{
                  marginLeft: 6,
                  background: '#fff',
                  color: '#007aff',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                {orders.filter(order => normalizeString(order.status) === normalizeString(status)).length}
              </span>
            )}
          </button>
        ))}
      </div>
     

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
                <th style={{ width: '40px' }}>STT</th>
                <th style={{ width: '40px' }}>Ảnh</th>
                <th style={{ width: '15%' }}>Mã đơn / Khách hàng</th>
                <th style={{ width: '15%' }}>Ngày đặt</th>
                <th className="admin_order-hide-sm" style={{ width: '20%' }}>Tổng tiền</th>
                <th style={{ width: '20%' }}>Thanh toán</th>
                <th style={{ width: '30%' }}>Trạng thái thanh toán</th>
                <th style={{ width: '25%' }}>Trạng thái</th>
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
                        <div className="admin_order-stt">{stt}</div>
                      </td>
                      <td>
                        <div className="admin_order-avatar">
                          <img src={order.image_url || DefaultImage} alt={order.customer} />
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
                        <div className="admin_order-items">{order.totalProduct || 0} sản phẩm</div>
                      </td>
                      <td>
                        <span className="admin_order-payment">{order.payment_method}</span>
                      </td>
                  <td><span className="admin_order-payment1">{order.payment_status}</span></td>

                      <td>
                        <span className={`admin_order-status admin_order-status-${normalizeString(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div
                          className="adminorder-action-group"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0px',
                            justifyContent: 'center',
                            minWidth: 90
                          }}
                        >
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => setSelectedOrder(order)}
                            title="Sửa trạng thái"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#007aff',
                              padding: 0,
                              margin: '0 6px',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              transition: 'background 0.2s'
                            }}
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            className="adminorder-icon-btn"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#007aff',
                              padding: 0,
                              margin: '0 6px',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              transition: 'background 0.2s'
                            }}
                          >
                            <FiEye size={18} />
                          </button>
                          {normalizeString(order.status) === normalizeString("Chờ xác nhận") && (
                            <button
                              className="adminorder-icon-btn"
                              onClick={() => handleCancelOrder(order)}
                              title="Huỷ đơn hàng"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#d33',
                                padding: 0,
                                margin: '0 6px',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background 0.2s'
                              }}
                            >
                              <FiX size={18} />
                            </button>
                          )}
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
            <table className="adminorder-details-table">
              <tbody>
                <tr><td><strong>Mã đơn:</strong></td><td>{selectedOrder.order_code}</td></tr>
                <tr><td><strong>Khách hàng:</strong></td><td>{selectedOrder.customer}</td></tr>
                <tr><td><strong>Phương thức:</strong></td><td>{selectedOrder.payment_method}</td></tr>
                <tr><td><strong>Tổng tiền:</strong></td><td>{formatCurrency(selectedOrder.total_amount)}</td></tr>
                <tr>
                  <td><strong>Trạng thái:</strong></td>
                  <td>
                    <div className="adminorder-status-wrapper">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) =>
                          setSelectedOrder({ ...selectedOrder, status: e.target.value })
                        }
                        className="adminorder-status-select"
                        disabled={isUpdatingStatus}
                      >
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang vận chuyển">Đang vận chuyển</option>
                        <option value="Đã giao hàng">Đã giao hàng</option>
                        <option value="Đã huỷ">Đã huỷ</option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Trạng thái thanh toán:</strong></td>
                  <td><span className="admin_order-payment">{selectedOrder.payment_status}</span></td>
                </tr>
                <tr><td><strong>Số lượng sản phẩm:</strong></td><td>{selectedOrder.totalProduct} sản phẩm</td></tr>
                <tr><td><strong>Ngày tạo:</strong></td><td>{selectedOrder.created_at}</td></tr>
                {selectedOrder.cancel_reason && (
                  <tr><td><strong>Lý do hủy:</strong></td><td>{selectedOrder.cancel_reason}</td></tr>
                )}
              </tbody>
            </table>
            <div className="adminorder-modal-actions">
              <button
                className="adminorder-btn-cancel"
                onClick={() => setSelectedOrder(null)}
                disabled={isUpdatingStatus}
              >
                Hủy
              </button>
              <button
                className="adminorder-btn-submit"
                onClick={() =>
                  handleStatusUpdate(selectedOrder.order_id, selectedOrder.status)
                }
                disabled={isUpdatingStatus}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal huỷ đơn hàng */}
      {showCancelModal && (
        <div className="adminorder-modal-backdrop">
          <div className="adminorder-modal">
            <h2>Huỷ đơn hàng</h2>
            <p>Bạn có chắc chắn muốn huỷ đơn hàng <b>{orderToCancel?.order_code}</b>?</p>
            <div style={{ margin: "12px 0" }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                Lý do huỷ đơn hàng:
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="adminorder-cancel-reason-textarea"
                disabled={isUpdatingStatus}
              />
            </div>
            <div className="adminorder-modal-actions">
              <button
                className="adminorder-btn-cancel"
                onClick={() => setShowCancelModal(false)}
                disabled={isUpdatingStatus}
              >
                Đóng
              </button>
              <button
                className="adminorder-btn-submit"
                onClick={handleConfirmCancelOrder}
                disabled={isUpdatingStatus}
                style={{ background: "#d33" }}
              >
                Xác nhận huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
