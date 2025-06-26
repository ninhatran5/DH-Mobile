import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchorderdetails } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import OrderStatusSteps from "../../components/AdminOrderDetail";

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading, error } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchorderdetails(orderId));
    }
  }, [dispatch, orderId]);

  if (error) return <p className="adminorderdetail-error">{error}</p>;
  if (!order) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="adminorderdetail-container">
      <button
        className="adminorderdetail-back-btn"
        onClick={() => navigate("/admin/orders")}
      >
        ← Quay lại danh sách đơn hàng
      </button>
      <h2 className="adminorderdetail-title">Thông tin đặt hàng</h2>
      <table className="adminorderdetail-table">
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
          <tr>
            <td>Phương thức thanh toán</td>
            <td>{order.payment_method.join(" - ")}</td>
          </tr>
          <tr>
            <td>Trạng thái thanh toán</td>
            <td>{order.payment_status}</td>
          </tr>
          {order.cancel_reason && (
            <tr>
              <td>Lý do huỷ</td>
              <td>{order.cancel_reason}</td>
            </tr>
          )}
        </tbody>
      </table>

      <OrderStatusSteps status={order.status} />

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
            <td className="adminorderdetail-total"
            style={{color: 'red'}}>
              {formatCurrency(order.total_amount)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;
