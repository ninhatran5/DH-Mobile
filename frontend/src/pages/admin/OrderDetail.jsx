import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchorderdetails } from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import OrderStatusSteps from "../../components/AdminOrderDetail";
const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { order, loading, error } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchorderdetails(orderId));
    }
  }, [dispatch, orderId]);

  if (error) return <p className="adminorderdetail-error">{error}</p>;
  if (!order) return null;

  return (
    <div className="adminorderdetail-container">
      <h2 className="adminorderdetail-title">Thông tin đặt hàng</h2>
      <table className="adminorderdetail-table">
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
            <td>{order.address || ", , ,"}</td>
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
            const colorAttr = product.variant_attributes.find(attr =>
              attr.attribute_name.toLowerCase().includes("Màu sắc")
            );
            const versionAttr = product.variant_attributes.find(attr =>
              attr.attribute_name.toLowerCase().includes("Bộ nhớ")
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
                <td>{colorAttr?.attribute_value || "-"}</td>
                <td>{versionAttr?.attribute_value || "không có"}</td>
                <td>{Number(product.price).toLocaleString()}₫</td>
                <td>{Number(product.subtotal).toLocaleString()}₫</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6" className="text-right font-semibold">Tổng cộng:</td>
            <td className="adminorderdetail-total">
              {Number(order.total_amount).toLocaleString()}₫
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;
