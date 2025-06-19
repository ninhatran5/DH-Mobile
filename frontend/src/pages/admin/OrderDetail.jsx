import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchorderdetails } from "../../slices/adminOrderSlice"; 

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { order, loading, error } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchorderdetails(orderId));
    }
  }, [dispatch, orderId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>

      <div className="mb-6">
        <p><strong>Mã đơn hàng:</strong> {order.order_code}</p>
        <p><strong>Ngày đặt:</strong> {order.order_date}</p>
        <p><strong>Khách hàng:</strong> {order.customer}</p>
        <p><strong>SĐT:</strong> {order.phone}</p>
        <p><strong>Địa chỉ:</strong> {order.address}</p>
        <p><strong>Trạng thái:</strong> {order.status}</p>
        <p><strong>Thanh toán:</strong> {order.payment_status}</p>
        <p><strong>Phương thức:</strong> {order.payment_method.join(" - ")}</p>
        <p><strong>Tổng tiền:</strong> {Number(order.total_amount).toLocaleString()}₫</p>
        {order.cancel_reason && (
          <p><strong>Lý do huỷ:</strong> {order.cancel_reason}</p>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-2">Sản phẩm</h3>
      {order.products.map((product, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 border rounded-lg mb-4"
        >
          <img
            src={product.product_image}
            alt={product.product_name}
            className="w-24 h-24 object-cover rounded"
          />
          <div>
            <p className="font-medium">{product.product_name}</p>
            <p>Số lượng: {product.quantity}</p>
            <p>Giá: {Number(product.price).toLocaleString()}₫</p>
            <p>Tạm tính: {Number(product.subtotal).toLocaleString()}₫</p>
            {product.variant_attributes.map((attr, i) => (
              <p key={i}>
                {attr.attribute_name}: {attr.attribute_value}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;
