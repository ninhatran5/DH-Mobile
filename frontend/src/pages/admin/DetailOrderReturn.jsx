import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReturnOrderById, updateReturnOrderStatus } from "../../slices/AdminReturnOrderSlice";
import Loading from "../../components/Loading";
import "../../assets/admin/DetailOrderReturn.css";
import Swal from 'sweetalert2';
const DetailOrderReturn = () => {
  const { returnId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentReturnOrder, loading, error } = useSelector(
    (state) => state.adminReturnOrder
  );

  useEffect(() => {
    dispatch(fetchReturnOrderById(returnId));
  }, [dispatch, returnId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Function to get timeline based on status - FIXED
const getStatusMilestones = (returnStatus) => {
  // If rejected, only show rejection milestone
  if (returnStatus?.toLowerCase() === 'rejected' || returnStatus?.toLowerCase() === 'từ chối') {
    return [{
      key: 'rejected',
      title: 'Đã từ chối',
      icon: '❌',
      description: 'Yêu cầu hoàn hàng đã bị từ chối',
      isCompleted: true,
      isActive: false
    }];
  }

  // Normal flow - 4 milestones
  const normalMilestones = [
    {
      key: 'requested',
      title: 'Yêu cầu hoàn hàng',
      icon: '📋',
      description: 'Khách hàng đã gửi yêu cầu hoàn hàng',
      priority: 1
    },
    {
      key: 'approved',
      title: 'Đã chấp thuận',
      icon: '✅',
      description: 'Yêu cầu hoàn hàng đã được phê duyệt',
      priority: 2
    },
    {
      key: 'processing',
      title: 'Đang xử lý',
      icon: '⚙️',
      description: 'Đang xử lý hoàn hàng',
      priority: 3
    },
    {
      key: 'returned',
      title: 'Đã trả hàng',
      icon: '📦',
      description: 'Hàng hóa đã được trả về',
      priority: 4
    }
  ];

  // Determine current priority based on status
  let currentPriority = 1;
  switch (returnStatus?.toLowerCase()) {
    case 'pending':
    case 'yêu cầu':
      currentPriority = 1;
      break;
    case 'approved':
    case 'đã chấp thuận':
      currentPriority = 2;
      break;
    case 'processing':
    case 'đang xử lý':
      currentPriority = 3;
      break;
    case 'returned':
    case 'completed':
    case 'đã trả hàng':
    case 'đã hoàn lại':
      currentPriority = 5; 
      break;
    default:
      currentPriority = 1;
  }

  return normalMilestones.map(milestone => ({
    ...milestone,
    isCompleted: milestone.priority < currentPriority, // Tất cả các bước nhỏ hơn currentPriority
    isActive: milestone.priority === currentPriority && currentPriority <= 4, // Chỉ active khi chưa hoàn thành hết
    isPending: milestone.priority > currentPriority
  }));
};

const [processing, setProcessing] = React.useState(false);

const getNextStatus = (currentStatus) => {
  const statusFlow = [
    'Đã yêu cầu',      // Requested
    'Đã chấp thuận',  // Approved
    'Đang xử lý',     // Processing
    'Đã hoàn lại'     // Returned
  ];
  const currentIndex = statusFlow.indexOf(currentStatus);
  if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) {
    return null;
  }
  return statusFlow[currentIndex + 1];
};

const handleUpdateStatus = () => {
  if (!currentReturnOrder || !currentReturnOrder.return_requests?.length) return;

  const currentStatus = currentReturnOrder.return_requests[0].status;
  const nextStatus = getNextStatus(currentStatus);

  if (!nextStatus) {
    Swal.fire({
      icon: 'info',
      title: 'Thông báo',
      text: 'Không còn trạng thái tiếp theo để cập nhật.',
    });
    return;
  }

  Swal.fire({
    title: 'Xác nhận thay đổi trạng thái',
    text: `Bạn muốn chuyển từ trạng thái "${currentStatus}" sang trạng thái "${nextStatus}" không?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#007aff',
    cancelButtonColor: '#dc3545'
  }).then((result) => {
    if (result.isConfirmed) {
      setProcessing(true);

      dispatch(updateReturnOrderStatus({
        orderId: currentReturnOrder.order_id,
        status: nextStatus
      }))
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Cập nhật trạng thái yêu cầu hoàn hàng thành công',
            timer: 2000,
            showConfirmButton: false
          });
          dispatch(fetchReturnOrderById(returnId)); // Load lại dữ liệu mới
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error || 'Có lỗi xảy ra khi cập nhật trạng thái',
          });
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  });
};


  const handleCancelOrder = async () => {
    if (!currentReturnOrder?.order_id) return;

 if (currentReturnOrder?.order_status !== "Đã chấp thuận") {
      alert("Chỉ có thể hủy đơn hàng khi trạng thái là 'Đã chấp thuận'.");
      return;
    }

    try {
      await dispatch(updateReturnOrderStatus({
        orderId: currentReturnOrder.order_id,
        status: "rejected",
      })).unwrap();
      alert("Đơn hàng đã được hủy thành công.");
      dispatch(fetchReturnOrderById(returnId)); // Refresh data
    } catch (error) {
      console.error("Chi tiết lỗi API:", error);
      alert("Lỗi khi hủy đơn hàng: " + (error.message || "Không xác định"));
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!currentReturnOrder) return <div className="error">Không tìm thấy thông tin đơn hoàn hàng.</div>;

  const {
    order_code,
    customer,
    email,
    total_amount,
    order_status,
    payment_status,
    payment_method_name,
    payment_method_description,
    order_created_at,
    products,
    return_requests,
  } = currentReturnOrder;

  const currentReturnStatus = return_requests?.[0]?.status || 'pending';
  
  const statusMilestones = getStatusMilestones(currentReturnStatus);

  return (
    <div className="detail-order-return-container">
      {/* Header */}
      <div className="header-section">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Quay lại
        </button>
      </div>

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
              <div className="order-code">Mã đơn: {order_code}</div>
            </div>
            
            <div className="order-info-grid">
              <div className="info-item">
                <span className="info-label">Khách hàng</span>
                <span className="info-value">{customer}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Ngày đặt hàng</span>
                <span className="info-value">{order_created_at}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{email}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Tổng tiền</span>
                <span className="info-value highlight">{formatCurrency(total_amount)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Phương thức thanh toán</span>
                <div className="payment-method">
                  <span className="payment-icon">🇻🇳</span>
                  {payment_method_name}( {payment_method_description })
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-label">Trạng thái đơn hàng</span>
                <span className="status-returned-text">{order_status}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📦</span>
                <h2 className="card-title">Sản phẩm đã trả</h2>
              </div>
            </div>
            
            {products && products.map((product, index) => (
              <div key={index} className="product-card">
                <img 
                  src={product.product_image} 
                  alt={product.product_name}
                  className="product-image"
                />
                <div className="product-details">
                  <div className="product-name">{product.product_name}</div>
                  <div className="product-specs">
                    <span>📱 Bộ nhớ: {
                      product.variant_attributes?.find(attr => 
                        attr.attribute_name?.toLowerCase().includes('memory') || 
                        attr.attribute_name?.toLowerCase().includes('storage')
                      )?.attribute_value || '128GB'
                    }</span>
                    <span>🎨 Màu sắc: {
                      product.variant_attributes?.find(attr => 
                        attr.attribute_name?.toLowerCase().includes('color') || 
                        attr.attribute_name?.toLowerCase().includes('màu')
                      )?.attribute_value || 'White Titanium'
                    }</span>
                  </div>
                  <div className="product-price-info">
                    <span className="product-quantity">Số lượng: {product.quantity}</span>
                    <span className="product-unit-price">Đơn giá: {formatCurrency(product.price)}</span>
                  </div>
                </div>
                <div className="product-total">
                  {formatCurrency(product.subtotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Return Request Details */}
        <div className="info-card">
  <div className="card-header">
    <div className="header-left">
      <span className="card-icon">🔄</span>
      <h2 className="card-title">Chi tiết yêu cầu trả hàng</h2>
    </div>
  </div>
  
  {return_requests && return_requests.map((request, index) => (
    <div key={index} className="return-request-card">
      <div className="request-header">
        <span className="request-number">#{index + 3}</span>
        <span className="request-date">{request.created_at}</span>
      </div>
      
      <div className="request-grid">
        <div className="info-item">
          <span className="info-label">Ngày yêu cầu</span>
          <span className="info-value">{request.created_at}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Số tiền hoàn lại</span>
          <span className="info-value refund-amount">{formatCurrency(request.refund_amount)}</span>
        </div>
      </div>
      
      <div className="request-reason">
        <span className="reason-icon">⚠️</span>
        Lý do: {request.reason}
      </div>
      <div className="request-reason">
        <span className="reason-icon">⚠️</span>
        Lý do: {request.return_reason_other}
      </div>
      {/* Hiển thị hình ảnh - FIXED */}
      {request.upload_url && (
        <div className="request-images">
          <div className="images-label">
            <span className="images-icon">📸</span>
            Hình ảnh đính kèm:
          </div>
          <div className="images-grid">
            {(() => {
              try {
                // Nếu upload_url là JSON string
                if (typeof request.upload_url === 'string') {
                  const urls = JSON.parse(request.upload_url);
                  return Array.isArray(urls) ? urls.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Hình ảnh hoàn hàng ${idx + 1}`}
                      className="return-image"
                      onClick={() => window.open(url, '_blank')}
                    />
                  )) : (
                    <img 
                      src={urls} 
                      alt="Hình ảnh hoàn hàng"
                      className="return-image"
                      onClick={() => window.open(urls, '_blank')}
                    />
                  );
                }
                // Nếu upload_url là array
                else if (Array.isArray(request.upload_url)) {
                  return request.upload_url.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt={`Hình ảnh hoàn hàng ${idx + 1}`}
                      className="return-image"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ));
                }
                // Nếu upload_url là string URL đơn
                else {
                  return (
                    <img 
                      src={request.upload_url} 
                      alt="Hình ảnh hoàn hàng"
                      className="return-image"
                      onClick={() => window.open(request.upload_url, '_blank')}
                    />
                  );
                }
              } catch (error) {
                console.error('Error parsing upload_url:', error);
                return <div className="error-message">Không thể tải hình ảnh</div>;
              }
            })()}
          </div>
        </div>
      )}
      
      
    </div>
  ))}
</div>

        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Processing History - Updated logic */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📝</span>
                <h2 className="card-title">Lịch sử xử lý</h2>
              </div>
            </div>
            
           <div className="history-section">
  {statusMilestones.map((milestone, index) => (
    <div key={milestone.key} className={`history-item ${
      milestone.isCompleted ? 'completed' : 
      milestone.isActive ? 'active' : 'pending'
    } ${milestone.key === 'rejected' ? 'rejected' : ''}`}>
      <div className="history-icon">
        <span>
          {milestone.isCompleted ? '✓' : milestone.icon}
        </span>
      </div>
      <div className="history-content">
        <div className="history-title">{milestone.title}</div>
        <div className="history-time">
          
        </div>
        <div className="history-description">
          {milestone.description}
        </div>
        {milestone.key === 'returned' && milestone.isCompleted && (
          <div className="history-amount">
            Số tiền hoàn: {formatCurrency(total_amount)}
          </div>
        )}
        {milestone.key === 'rejected' && return_requests?.[0]?.reason && (
          <div className="history-reason">
            Lý do từ chối: {return_requests[0].reason}
          </div>
        )}
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
              <button className="action-button button-primary" onClick={handleUpdateStatus}>
                Cập nhật trạng thái đơn hàng a
              </button>
              <button className="action-button button-success" onClick={handleCancelOrder}>
                Huỷ đơn hàng
              </button>
              
            </div>
          </div>

          {/* Summary */}
          <div className="info-card">
            <div className="card-header">
              <div className="header-left">
                <span className="card-icon">📊</span>
                <h2 className="card-title">Tóm tắt</h2>
              </div>
            </div>
            
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">Tổng đơn hàng:</span>
                <span className="summary-value">{formatCurrency(total_amount)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Số tiền hoàn:</span>
                <span className="summary-value highlight">{formatCurrency(total_amount)}</span>
              </div>
              <div className="summary-row final">
                <span className="summary-label">Thực nhận:</span>
                <span className="summary-value highlight final-amount">{formatCurrency(total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailOrderReturn;
