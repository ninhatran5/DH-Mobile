import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrdersList.css";
import { FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAdminOrders(currentPage));
  }, [dispatch, currentPage]);

  const normalizeString = (str) =>
    str
      ?.toLowerCase()
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
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

  const current = pagination?.current_page || 1;
  const last = pagination?.last_page || 1;

  return (
    <div className="ordersList-container">
      <div className="ordersList-header">
        <div className="ordersList-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>

      <div className="ordersList-top-row">
        <div className="ordersList-search-box">
          <i
            className="bi bi-search ordersList-search-icon"
            style={{ color: "#0071e3" }}
          ></i>
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ordersList-search-input"
          />
        </div>
        <div className="ordersList-filters">
          <select
            className="ordersList-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao hàng">Đang giao hàng</option>
            <option value="Đã Giao hàng">Đã Giao hàng</option>
          </select>
        </div>
      </div>

      {loading && <p className="ordersList-loading">Đang tải dữ liệu...</p>}
      {error && <p className="ordersList-error">{error}</p>}
      {!loading && filteredOrders.length === 0 && (
        <p className="ordersList-empty">Không có đơn hàng nào.</p>
      )}

      {filteredOrders.length > 0 && (
        <div className="ordersList-scrollable">
          <table className="ordersList-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày đặt hàng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusClass = normalizeString(order.status);
                return (
                  <tr key={order.order_id}>
                    <td className="ordersList-code">{order.order_code}</td>
                    <td className="ordersList-customer">{order.customer}</td>
                    <td className="ordersList-total">
  <span>
    {Number(order.total_amount).toLocaleString("vi-VN")}₫
  </span>
</td>

                    <td className="ordersList-payment-status">
                      {order.payment_status}
                    </td>
                    <td className="ordersList-method">{order.payment_method}</td>
                    <td
                      className={`ordersList-status ordersList-status-${statusClass}`}
                    >
                      {order.status}
                    </td>

                    <td className="ordersList-date">{order.created_at}</td>
                    <td className="ordersList-actions">
                      <button
                        className="ordersList-icon-btn"
                        onClick={() => handleEditOrder(order)}
                        title="Sửa đơn hàng"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="ordersList-icon-btn"
                        onClick={() => handleViewOrder(order)}
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="ordersList-pagination">
          <button
            className="ordersList-page-btn"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            Trang trước
          </button>
          <span className="ordersList-page-info">
            {current} / {last}
          </span>
          <button
            className="ordersList-page-btn"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === last}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
