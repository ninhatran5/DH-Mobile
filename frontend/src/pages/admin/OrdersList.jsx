import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrdersList.css";
import { FiEdit, FiEye } from "react-icons/fi";

const OrdersList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, loading, error } = useSelector(
    (state) => state.adminOrder
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAdminOrders(currentPage));
  }, [dispatch, currentPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    if (pagination && page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  const handleEditOrder = (order) => {
    console.log("Sửa đơn hàng:", order);
    // TODO: mở modal chỉnh sửa hoặc điều hướng đến trang sửa
  };

  const handleViewOrder = (order) => {
    console.log("Xem chi tiết đơn hàng:", order);
    // TODO: mở modal hoặc chuyển hướng sang trang chi tiết đơn hàng
  };

  const current = pagination?.current_page || 1;
  const last = pagination?.last_page || 1;

  return (
    <div className="adminOrder-container">
      {/* Header + Search + Filter */}
      <div className="adminOrder-header">
        <div className="adminOrder-title">
          <h1>Danh sách đơn hàng</h1>
          <p className="text-muted">Quản lý tất cả các đơn hàng trong hệ thống</p>
        </div>
      </div>

      <div className="adminOrder-top-row">
        <div className="adminOrder-search-box">
          <i className="bi bi-search adminOrder-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adminOrder-search-input"
          />
        </div>
        <div className="adminOrder-filters">
          <select
            className="adminOrder-filter-select"
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

      {/* Loading / Error / Empty */}
      {loading && <p className="adminOrder-loading">Đang tải dữ liệu...</p>}
      {error && <p className="adminOrder-error">{error}</p>}
      {!loading && filteredOrders.length === 0 && (
        <p className="adminOrder-empty">Không có đơn hàng nào.</p>
      )}

      {/* Table */}
      {filteredOrders.length > 0 && (
        <div className="adminOrder-scrollable">
          <table className="adminOrder-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_code}</td>
                  <td>{order.customer}</td>
                  <td>{Number(order.total_amount).toLocaleString("vi-VN")} ₫</td>
                  <td>{order.payment_status}</td>
                  <td>{order.payment_method}</td>
                  <td>{order.status}</td>
                  <td>{order.created_at}</td>
                  <td>
                    <button
                      className="adminOrder-action-btn"
                      onClick={() => handleEditOrder(order)}
                      title="Sửa đơn hàng"
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="adminOrder-action-btn"
                      onClick={() => handleViewOrder(order)}
                      title="Xem chi tiết"
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="adminOrder-pagination">
          <button
            className="adminOrder-page-btn"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            Trang trước
          </button>
          <span className="adminOrder-page-info">
            {current} / {last}
          </span>
          <button
            className="adminOrder-page-btn"
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
