import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders, updateOrderStatus } from "../../slices/adminOrderSlice";
import { fetchUsers } from "../../slices/adminuserSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/admin/EditOrder.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const EditOrder = () => {
  const { order_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, loading, error } = useSelector((state) => state.adminOrder || {});
  const { users = [], loading: userLoading } = useSelector((state) => state.adminuser || {});

  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);

  const order = orders?.find((o) => String(o.order_id) === String(order_id));
  const customer = order ? users.find((u) => String(u.user_id) === String(order.user_id)) : null;

  // Debug log
  useEffect(() => {
    console.log(">>> order_id from URL:", order_id);
    console.log(">>> orders:", orders);
    console.log(">>> matched order:", order);
    console.log(">>> users:", users);
    console.log(">>> matched customer:", customer);
    console.log(">>> order.user_id:", order?.user_id);
  }, [orders, users, order]);

  // Fetch data
  useEffect(() => {
    if (!order && !isFetchingOrder) {
      setIsFetchingOrder(true);
      dispatch(fetchAdminOrders())
        .unwrap()
        .finally(() => setIsFetchingOrder(false));
    }

    if (users.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, order, isFetchingOrder, users.length]);

  // Update trạng thái khi order đã có
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleUpdate = () => {
    if (selectedStatus && order) {
      dispatch(updateOrderStatus({ orderId: order.order_id, status: selectedStatus }))
        .unwrap()
        .then(() => {
          toast.success("Cập nhật trạng thái thành công!");
          dispatch(fetchAdminOrders());
          setTimeout(() => {
            navigate("/admin/orders");
          }, 1500);
        })
        .catch((err) => {
          toast.error("Lỗi: " + err);
        });
    } else {
      toast.warn("Vui lòng chọn trạng thái mới");
    }
  };

  if (loading || isFetchingOrder || userLoading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  return (
    <>
      <div className="edit-order-page">
        <h2 className="edit-order-title">Chỉnh sửa đơn hàng #{order.order_code}</h2>

        <div className="edit-order-info">
          <p><strong>Tổng tiền:</strong> {Number(order.total_amount).toLocaleString()} VND</p>
          <p><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
          <p><strong>Trạng thái hiện tại:</strong> {order.status}</p>
          <p><strong>Trạng thái thanh toán:</strong> {order.payment_status}</p>
          <p>
            <strong>Ngày đặt hàng:</strong>{" "}
            {dayjs(order.created_at, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss DD/MM/YYYY")}
          </p>
        </div>

        {customer ? (
          <div className="edit-order-customer">
            <h3>Thông tin khách hàng</h3>
            <div className="customer-info-box">
              {customer.image_url && (
                <img
                  src={customer.image_url}
                  alt="Avatar"
                  className="customer-avatar"
                />
              )}
              <div className="customer-details">
                <p><strong>Họ tên:</strong> {customer.full_name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Số điện thoại:</strong> {customer.phone}</p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {[
                    customer.address,
                    customer.ward,
                    customer.district,
                    customer.city
                  ].filter(Boolean).join(", ")}
                </p>
                <p><strong>Vai trò:</strong> {customer.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "gray" }}>
            Không tìm thấy thông tin người dùng với user_id: {order.user_id}
          </p>
        )}

        <div className="edit-order-status-select">
          <label>
            Trạng thái mới:
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">-- Chọn trạng thái --</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đang vận chuyển/ Đang giao hàng">Đang vận chuyển/ Đang giao hàng</option>
              <option value="Đã Giao hàng">Đã Giao hàng</option>
              <option value="Đã huỷ">Đã huỷ</option>
            </select>
          </label>
          <button className="edit-order-update-btn" onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default EditOrder;
