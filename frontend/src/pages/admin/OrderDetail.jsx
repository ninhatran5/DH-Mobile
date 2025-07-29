import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchorderdetails,
  updateOrderStatus,
  cancelOrder,
} from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import OrderStatusSteps from "../../components/AdminOrderDetail";
import Swal from "sweetalert2";

const ORDER_STATUS_OPTIONS = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang vận chuyển",
  "Đã giao hàng",
  "Đã hủy"
];

const getNextStatus = (current) => {
  const idx = ORDER_STATUS_OPTIONS.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_OPTIONS.length - 1) return null;
  if (current === "Đã hủy") return null;
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
    } catch (e) {}
    setUpdating(false);
  };

  const handleCancelOrder = async () => {
    if (!order || !order.order_id) return;

    const { value: reason } = await Swal.fire({
      title: "Nhập lý do huỷ đơn hàng:",
      input: "text",
      inputPlaceholder: "Nhập lý do...",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (!reason) return;

    setUpdating(true);
    try {
      await dispatch(cancelOrder({ orderId: order.order_id, cancel_reason: reason })).unwrap();
      Swal.fire("Thành công", "Đơn hàng đã được huỷ.", "success");
    } catch (e) {
      Swal.fire("Lỗi", "Không thể huỷ đơn hàng.", "error");
    }
    setUpdating(false);
  };

  return (
    <div className="adminorderdetail-container container-fluid">
      <button
        className="adminorderdetail-back-btn mb-2"
        onClick={() => navigate("/admin/orders")}
      >
        ← Quay lại danh sách đơn hàng
      </button>

      <div className="orderdetail-tong">
        <div className="col-md-6">
          <h2 className="adminorderdetail-title">Thông tin đơn hàng</h2>
          <div className="table-responsive">
            <table className="adminorderdetail-table w-100">
              <tbody>
                <tr><td>Mã đơn hàng</td><td>{order.order_code}</td></tr>
                <tr><td>Ngày đặt</td><td>{order.order_date}</td></tr>
                <tr>
                  <td>Phương thức thanh toán</td>
                  <td><span className="badge bg-info text-dark">{order.payment_method.join(" - ")}</span></td>
                </tr>
                <tr>
                  <td>Trạng thái thanh toán</td>
                  <td><span className="badge bg-success">{order.payment_status}</span></td>
                </tr>
                {order.cancel_reason && (
                  <tr>
                    <td>Lý do huỷ</td>
                    <td><span className="badge bg-danger">{order.cancel_reason}</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-10">
          <h2 className="adminorderdetail-title">Thông tin người nhận</h2>
          <div className="table-responsive">
            <table className="adminorderdetail-table">
              <tbody>
                <tr><td>Người nhận</td><td>{order.customer}</td></tr>
                <tr><td>Số điện thoại</td><td>{order.phone || "Chưa cập nhật"}</td></tr>
                <tr><td>Email</td><td>{order.email || "Chưa cập nhật"}</td></tr>
                <tr>
                  <td>Địa chỉ</td>
                  <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {order.address || "Chưa cập nhật"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="my-4">
        <OrderStatusSteps status={order.status} />
      </div>

      <div className="d-flex flex-wrap gap-3 justify-content-end mb-4">
        {nextStatus && (
          <button
            className="btn btn-primary"
            disabled={updating || loading}
            onClick={handleUpdateStatus}
          >
            {updating ? "Đang cập nhật..." : `Cập nhật sang "${nextStatus}"`}
          </button>
        )}
        {order.status === "Chờ xác nhận" && (
          <button
            className="btn btn-danger"
            disabled={updating || loading}
            onClick={handleCancelOrder}
          >
            Huỷ đơn hàng
          </button>
        )}
      </div>

      <h3 className="adminorderdetail-subtitle">Chi tiết sản phẩm</h3>
      <div className="table-responsive">
        <table className="adminorderdetail-table product table table-bordered">
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
              const storage = product.variant_attributes.find((attr) => attr.attribute_name === "Bộ nhớ");
              const color = product.variant_attributes.find((attr) => attr.attribute_name === "Màu sắc");
              return (
                <tr key={index}>
                  <td data-label="Hình ảnh">
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="img-fluid adminorderdetail-thumb"
                    />
                  </td>
                  <td data-label="Tên sản phẩm">{product.product_name}</td>
                  <td data-label="Số lượng">{product.quantity}</td>
                  <td data-label="Màu sắc">{color?.attribute_value || "-"}</td>
                  <td data-label="Phiên bản">{storage?.attribute_value || "-"}</td>
                  <td data-label="Đơn giá">{formatCurrency(product.price)}</td>
                  <td data-label="Tạm tính">{formatCurrency(product.subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" className="text-end fw-bold">Tổng cộng:</td>
              <td className="text-danger fw-bold rderdetail">{formatCurrency(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;
