import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchorderdetails, updateOrderStatus } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import OrderStatusSteps from "../../components/AdminOrderDetail";

const ORDER_STATUS_OPTIONS = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Đã hủy"
];

const getNextStatus = (current) => {
  const idx = ORDER_STATUS_OPTIONS.indexOf(current);
  // Nếu đã là trạng thái cuối cùng hoặc không tìm thấy, không có trạng thái tiếp theo
  if (idx === -1 || idx === ORDER_STATUS_OPTIONS.length - 1) return null;
  // Nếu trạng thái hiện tại là "Đã hủy" thì không cho chuyển tiếp
  if (current === "Đã hủy") return null;
  // Chỉ cho phép cập nhật đến "Đã giao hàng"
  const next = ORDER_STATUS_OPTIONS[idx + 1];
  if (next === "Đã hủy") return null;
  return next;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useSelector((state) => state.adminOrder);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchorderdetails(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order && order.status) {
      setNewStatus(order.status);
    }
  }, [order]);

  if (error) return <p className="adminorderdetail-error">{error}</p>;
  if (!order) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const nextStatus = getNextStatus(order?.status);

  const handleUpdateStatus = async () => {
    if (!order || !order.order_id || !nextStatus || nextStatus === order.status) return;
    setUpdating(true);
    try {
      await dispatch(updateOrderStatus({ orderId: order.order_id, status: nextStatus })).unwrap();
    } catch (e) {
      // Có thể hiển thị thông báo lỗi nếu muốn
    }
    setUpdating(false);
  };

  // Thêm hàm huỷ đơn hàng
  const handleCancelOrder = async () => {
    if (!order || !order.order_id) return;
    const reason = window.prompt("Nhập lý do huỷ đơn hàng:");
    if (!reason) return;
    setUpdating(true);
    try {
      await dispatch(
        // Đảm bảo import cancelOrder từ slice
        require("../../slices/adminOrderSlice").cancelOrder({ orderId: order.order_id, cancel_reason: reason })
      ).unwrap();
    } catch (e) {
      // Có thể hiển thị thông báo lỗi nếu muốn
    }
    setUpdating(false);
  };

  return (
    <div className="adminorderdetail-container">
      <button
        className="adminorderdetail-back-btn"
        onClick={() => navigate("/admin/orders")}
      >
        ← Quay lại danh sách đơn hàng
      </button>
      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          marginBottom: 32,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 340,
            maxWidth: 500,
          }}
        >
          <h2 className="adminorderdetail-title">Thông tin đơn hàng</h2>
          <table
            className="adminorderdetail-table"
            style={{ width: "100%", fontSize: 16 }}
          >
            <tbody>
              <tr>
                <td>Mã đơn hàng</td>
                <td>{order.order_code}</td>
              </tr>
              <tr>
                <td>Ngày đặt</td>
                <td>{order.order_date}</td>
              </tr>
              <tr>
                <td>Phương thức thanh toán</td>
                <td>
                  <span style={{ background: "#e6f7ff", color: "#005fa3", padding: "2px 8px", borderRadius: 4 }}>
                    {order.payment_method.join(" - ")}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Trạng thái thanh toán</td>
                <td>
                  <span style={{ background: "#f0fff0", color: "#008000", padding: "2px 8px", borderRadius: 4 }}>
                    {order.payment_status}
                  </span>
                </td>
              </tr>
              {order.cancel_reason && (
                <tr>
                  <td>Lý do huỷ</td>
                  <td>
                    <span style={{ background: "#ffeaea", color: "#d8000c", padding: "2px 8px", borderRadius: 4 }}>
                      {order.cancel_reason}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 340,
            maxWidth: 500,
          }}
        >
          <h2 className="adminorderdetail-title">Thông tin người nhận</h2>
          <table
            className="adminorderdetail-table"
            style={{ width: "100%", fontSize: 16 }}
          >
            <tbody>
              <tr>
                <td>Người nhận</td>
                <td>{order.customer}</td>
              </tr>
              <tr>
                <td>Số điện thoại</td>
                <td>{order.phone || "Chưa cập nhật"}</td>
              </tr>
              <tr>
                <td>Địa chỉ</td>
                <td>{order.address || "Chưa cập nhật"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <OrderStatusSteps status={order.status} />

      {/* Đưa sang phải, bỏ khung ngoài */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        {nextStatus && (
          <button
            className="adminorderdetail-status-btn"
            disabled={updating || loading}
            onClick={handleUpdateStatus}
            style={{ marginRight: order.status === "Chờ xác nhận" ? 12 : 0 }}
          >
            {updating ? "Đang cập nhật..." : `Cập nhật sang "${nextStatus}"`}
          </button>
        )}
        {order.status === "Chờ xác nhận" && (
          <button
            className="adminorderdetail-cancel-btn"
            disabled={updating || loading}
            onClick={handleCancelOrder}
          >
            Huỷ đơn hàng
          </button>
        )}
      </div>

      <h3 className="adminorderdetail-subtitle">Chi tiết sản phẩm</h3>
      <table className="adminorderdetail-table product">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Màu sắc</th>
            <th>Phiên bản</th>
            <th>Đơn giá</th>
            <th>Tạm tính</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product, index) => {
            const storage = product.variant_attributes.find(
              (attr) => attr.attribute_name === "Bộ nhớ"
            );
            const color = product.variant_attributes.find(
              (attr) => attr.attribute_name === "Màu sắc"
            );

            return (
              <tr key={index}>
                <td>
                  <img
                    src={product.product_image}
                    alt={product.product_name}
                    className="adminorderdetail-thumb"
                  />
                </td>
                <td>{product.product_name}</td>
                <td>{product.quantity}</td>
                <td>{color?.attribute_value || "-"}</td>
                <td>{storage?.attribute_value || "-"}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>{formatCurrency(product.subtotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6" className="text-right font-semibold">
              Tổng cộng:
            </td>
            <td className="adminorderdetail-total" style={{ color: "red" }}>
              {formatCurrency(order.total_amount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;

