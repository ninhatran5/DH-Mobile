import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, updateOrderStatus } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrdersList.css";
import { FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { fetchUsers } from "../../slices/adminuserSlice";
const MySwal = withReactContent(Swal);

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        statusFilter === "all"
          ? true
          : normalizeString(order.status) === normalizeString(statusFilter);

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    if (pagination && page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  const handleEditOrder = (order) => {
    navigate(`/admin/editorder/${order.order_id}`);
  };

  const handleViewOrder = (order) => {
    console.log("Xem chi tiết đơn hàng:", order);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    MySwal.fire({
      title: "Xác nhận cập nhật",
      text: `Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${newStatus}" không?`,
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

  const current = pagination?.current_page || 1;
  const last = pagination?.last_page || 1;

  return (
    <div className="adminorder-container">
      <div className="adminorder-header">
        <div className="adminorder-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>

      <div className="adminorder-top-row">
        <div className="adminorder-search-box">
          <i className="bi bi-search adminorder-search-icon" style={{ color: "#0071e3" }}></i>
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adminorder-search-input"
          />
        </div>
        <div className="adminorder-filters">
          <select
            className="adminorder-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
             <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Chờ lấy hàng">Chờ lấy hàng</option>
                      <option value="Đang vận chuyển">Đang vận chuyển</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Đã Giao hàng">Đã Giao hàng</option>
          </select>
        </div>
      </div>

      {loading && <p className="adminorder-loading">Đang tải dữ liệu...</p>}
      {error && <p className="adminorder-error">{error}</p>}
      {!loading && filteredOrders.length === 0 && (
        <p className="adminorder-empty">Không có đơn hàng nào.</p>
      )}

      {filteredOrders.length > 0 && (
        <>
          <div className="adminorder-scrollable">
            <table className="adminorder-table">
              <thead>
                <tr>
                  <th className="adminorder-stt-col">STT</th>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Phương thức</th>
                  <th className="adminorder-status-col">Trạng thái</th>
                  <th>Ngày đặt hàng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const statusClass = normalizeString(order.status);
                  const stt = (current - 1) * (pagination?.per_page || 15) + idx + 1;
                  return (
                    <tr key={order.order_id}>
                      <td className="adminorder-stt-col">{stt}</td>
                      <td>{order.order_code}</td>
                      <td>{order.customer}</td>
                      <td>{Number(order.total_amount).toLocaleString("vi-VN")}₫</td>
                      <td>{order.payment_status}</td>
                      <td>{order.payment_method}</td>
                      <td className={`adminorder-status-${statusClass} adminorder-status-col`}>
                        {order.status}
                      </td>
                      <td>{order.created_at}</td>
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
                })}
              </tbody>
            </table>
          </div>

          <div className="adminorder-pagination">
            <button
              className="adminorder-page-btn"
              onClick={() => handlePageChange(current - 1)}
              disabled={current === 1}
            >
              Trang trước
            </button>
            <span className="adminorder-page-info">
              {current} / {last}
            </span>
            <button
              className="adminorder-page-btn"
              onClick={() => handlePageChange(current + 1)}
              disabled={current === last}
            >
              Trang sau
            </button>
          </div>
        </>
      )}

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
                <tr><td><strong>Khách hàng :</strong></td><td>{selectedOrder.user_id}</td></tr>
                <tr><td><strong>Phương thức:</strong></td><td>{selectedOrder.method_id}</td></tr>
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
                      <option value="Đã Giao hàng">Đã Giao hàng</option>
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
