import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchorderdetails,
  updateOrderStatus,
  cancelOrder,
} from "../../slices/adminOrderSlice";
import "../../assets/admin/OrderDetail.css";
import Swal from "sweetalert2";

const ORDER_STATUS_OPTIONS = [
  "Chờ xác nhận",
  "Đã xác nhận", 
  "Đang vận chuyển",
  "Đã giao hàng",
  "Hoàn thành",
  "Đã hủy"
];

const getNextStatus = (current) => {
  const idx = ORDER_STATUS_OPTIONS.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_OPTIONS.length - 1) return null;
  if (current === "Đã hủy") return null;
  if (current === "Hoàn thành") return null;
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

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) return <p className="order-detail-error">{error}</p>;
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const nextStatus = getNextStatus(order?.status);

  const handleUpdateStatus = async () => {
    if (!order || !order.order_id || !nextStatus || nextStatus === order.status) return;
    setUpdating(true);
    try {
      await dispatch(updateOrderStatus({ orderId: order.order_id, status: nextStatus })).unwrap();
      Swal.fire("Thành công", `Đã cập nhật trạng thái sang "${nextStatus}"`, "success");
    } catch (e) {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái", "error");
    }
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

  // Timeline status steps - ĐÃ CẬP NHẬT để xử lý trạng thái hủy
  const getStatusMilestones = (currentStatus, cancelReason = null) => {
    // Kiểm tra nếu đơn hàng đã bị hủy
    if (currentStatus === "Đã hủy") {
      return [
        {
          key: 'cancelled',
          title: 'Đã hủy',
          icon: '❌',
          description: cancelReason ? `Đơn hàng đã bị hủy. Lý do: ${cancelReason}` : 'Đơn hàng đã bị hủy',
          priority: 1,
          isCompleted: true,
          isActive: false,
          isPending: false,
          isCancelled: true // Flag để nhận diện trạng thái hủy
        }
      ];
    }

    const normalMilestones = [
      {
        key: 'pending',
        title: 'Chờ xác nhận',
        icon: '📋',
        description: 'Đơn hàng đã được đặt',
        priority: 1
      },
      {
        key: 'confirmed',
        title: 'Đã xác nhận',
        icon: '✅',
        description: 'Xác nhận và chuẩn bị',
        priority: 2
      },
      {
        key: 'shipping',
        title: 'Đang vận chuyển',
        icon: '🚚',
        description: 'Đang giao hàng',
        priority: 3
      },
      {
        key: 'delivered',
        title: 'Đã giao hàng',
        icon: '📦',
        description: 'Giao thành công',
        priority: 4
      },
      {
        key: 'completed',
        title: 'Hoàn thành',
        icon: '🎉',
        description: 'Đơn hàng hoàn tất',
        priority: 5
      }
    ];

    let currentPriority = 1;
    switch (currentStatus?.toLowerCase()) {
      case 'chờ xác nhận':
        currentPriority = 1;
        break;
      case 'đã xác nhận':
        currentPriority = 2;
        break;
      case 'đang vận chuyển':
        currentPriority = 3;
        break;
      case 'đã giao hàng':
        currentPriority = 4;
        break;
      case 'hoàn thành':
        currentPriority = 6; // Đặt > 5 để tất cả milestone đều completed
        break;
      default:
        currentPriority = 1;
    }

    return normalMilestones.map(milestone => ({
      ...milestone,
      isCompleted: milestone.priority < currentPriority,
      isActive: milestone.priority === currentPriority && currentPriority <= 5,
      isPending: milestone.priority > currentPriority,
      isCancelled: false
    }));
  };

  // Gọi hàm với cancel_reason
  const statusMilestones = getStatusMilestones(order.status, order.cancel_reason);

  return (
    <div className="detail-order-return-container">
       <button className="back-button" onClick={() => navigate("/admin/orders")}>
          <svg width="24" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Quay lại danh sách đơn hàng
        </button>

      <div className="main-content">
        {/* Left Column */}
        <div className="left-column">
          {/* Order Information */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📋</span>
                <h2 className="card-title">Thông tin đơn hàng</h2>
              </div>
              <div className="order-code">Mã đơn: <span className="fw-bold">{order.order_code}</span></div>
            </div>
            
            <div className="order-info-grid">
              <div className="info-item">
                <span className="info-label">Khách hàng</span>
                <span className="info-value">{order.customer}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Ngày đặt hàng</span>
                <span className="info-value">{formatDate(order.order_date)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{order.email || "Chưa cập nhật"}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Số điện thoại</span>
                <span className="info-value">{order.phone || "Chưa cập nhật"}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Tổng tiền</span>
                <span className="info-value highlight">{formatCurrency(order.total_amount)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label mb-2">Phương thức thanh toán</span>
                <div className="payment-method">
                  <span className="payment-icon"></span>
                  {order.payment_method?.join(" - ") || "COD"}
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-label">Trạng thái đơn hàng</span>
                <span className="status-returned-text">{order.status}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Trạng thái thanh toán</span>
                <span className="status-returned-text">{order.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📍</span>
                <h2 className="card-title">Địa chỉ giao hàng</h2>
              </div>
            </div>
            <div className="address-content">
              <p>{order.address || "Chưa cập nhật"}</p>
            </div>
          </div>

          {/* Products */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📦</span>
                <h2 className="card-title">Sản phẩm đã đặt</h2>
              </div>
            </div>
            
            {order.products?.map((product, index) => {
              const storage = product.variant_attributes?.find((attr) => attr.attribute_name === "Bộ nhớ");
              const color = product.variant_attributes?.find((attr) => attr.attribute_name === "Màu sắc");
              
              return (
                <div key={index} className="product-card">
                  <img 
                    src={product.product_image} 
                    alt={product.product_name}
                    className="product-image"
                  />
                  <div className="product-details">
                    <div className="product-name">{product.product_name}</div>
                    <div className="productdetails1">
                    <div className="product-specs">
                      <span>📱 Bộ nhớ: {storage?.attribute_value || "128GB"}</span>
                      <span>🎨 Màu sắc: {color?.attribute_value || "White Titanium"}</span>
                    </div>
                    <div className="product-price-info">
                      <span className="product-quantity">Số lượng: {product.quantity}</span>
                      <span className="product-unit-price">Đơn giá: {formatCurrency(product.price)}</span>
                    </div>
                    </div>
                  </div>
                  <div className="product-total">
                    {formatCurrency(product.subtotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Processing History - ĐÃ CẬP NHẬT */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📝</span>
                <h2 className="card-title">Lịch sử cập nhật đơn hàng</h2>
              </div>
            </div>
            
            <div className="history-section">
              {statusMilestones.map((milestone, index) => (
                <div key={milestone.key} className={`history-item ${
                  milestone.isCancelled ? 'cancelled' :
                  milestone.isCompleted ? 'completed' : 
                  milestone.isActive ? 'active' : 'pending'
                }`}>
                  <div className="history-icon">
                    <span>
                      {milestone.isCompleted && !milestone.isCancelled ? '✓' : milestone.icon}
                    </span>
                  </div>
                  <div className="history-content">
                    <div className="history-title">{milestone.title}</div>
                    <div className="history-description">
                      {milestone.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Action Buttons */}
        <div className="info-card">
          <div className="card-header">
            <div className="header-left">
              <span className="card-icon">⚡</span>
              <h2 className="card-title">Thao tác nhanh</h2>
            </div>
          </div>
          
          <div className="action-buttons">
            {order.status === "Chờ xác nhận" && (
              <>
                <button 
                  className="action-button button-primary" 
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đã xác nhận"'}
                </button>
                
                <button 
                  className="action-button button-danger" 
                  onClick={handleCancelOrder}
                  disabled={updating}
                >
                  {updating ? 'Đang xử lý...' : 'Huỷ đơn hàng'}
                </button>
              </>
            )}

            {/* Trạng thái "Đã xác nhận" - CHỈ hiển thị button Cập nhật */}
            {order.status === "Đã xác nhận" && (
              <button 
                className="action-button button-primary" 
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đang vận chuyển"'}
              </button>
            )}

            {/* Trạng thái "Đang vận chuyển" - CHỈ hiển thị button Cập nhật */}
            {order.status === "Đang vận chuyển" && (
              <button 
                className="action-button button-primary" 
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật sang "Đã giao hàng"'}
              </button>
            )}

            {/* Trạng thái "Đã giao hàng" - Hiển thị thông báo thành công */}
            {order.status === "Đã giao hàng" && (
              <div className="success-message">
                <p>Giao hàng thành công</p>
              </div>
            )}

            {/* Trạng thái "Hoàn thành" - Hiển thị thông báo hoàn thành */}
            {order.status === "Hoàn thành" && (
              <div className="success-message">
                <p>Đơn hàng đã hoàn thành</p>
              </div>
            )}

            {order.status === "Đã hủy" && (
              <div className="cancelled-message">
                <p>Đơn hàng đã bị hủy</p>
              
              </div>
            )}

            {/* Fallback cho các trạng thái khác */}
            {!["Chờ xác nhận", "Đã xác nhận", "Đang vận chuyển", "Đã giao hàng", "Hoàn thành", "Đã hủy"].includes(order.status) && (
              <div className="no-actions">
                <p>Không có thao tác khả dụng cho trạng thái: {order.status}</p>
              </div>
            )}
          </div>
        </div>

          {/* Summary */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📊</span>
                <h2 className="card-title">Tổng kết đơn hàng</h2>
              </div>
            </div>
            
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{formatCurrency(order.total_amount)}</span>
              </div>
            
              <div className="summary-row final">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value highlight final-amount">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
