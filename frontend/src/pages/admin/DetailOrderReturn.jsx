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

  const getStatusMilestones = (returnStatus) => {
    if (returnStatus?.toLowerCase() === 'rejected' || returnStatus?.toLowerCase() === 'từ chối' || returnStatus?.toLowerCase() === 'đã từ chối') {
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
      case 'đã yêu cầu':
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
      isCompleted: milestone.priority < currentPriority,
      isActive: milestone.priority === currentPriority && currentPriority <= 4,
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
    const orderData = currentReturnOrder.order || currentReturnOrder;
    if (!orderData || !orderData.return_requests?.length) return;

    const currentStatus = orderData.return_requests[0].status;
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
          returnId: orderData.return_requests[0].return_id,
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
            dispatch(fetchReturnOrderById(returnId));
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

  // Cập nhật logic để kiểm tra có thể hủy đơn hay không
  const canCancelOrder = () => {
    const orderData = currentReturnOrder?.order || currentReturnOrder;
    if (!orderData || !orderData.return_requests?.length) return false;
    
    const currentStatus = orderData.return_requests[0].status;
    
    // Chỉ có thể hủy khi ở trạng thái ban đầu (chưa được chấp thuận)
    const cancelableStatuses = [
      'pending',
      'yêu cầu', 
      'đã yêu cầu',
      'yêu cầu hoàn hàng'
    ];
    
    return cancelableStatuses.some(status => 
      currentStatus?.toLowerCase().includes(status.toLowerCase())
    );
  };

  const handleCancelOrder = async () => {
    const orderData = currentReturnOrder?.order || currentReturnOrder;
    if (!orderData?.order_id) return;

    // Kiểm tra xem có thể hủy không
    if (!canCancelOrder()) {
      Swal.fire({
        icon: 'warning',
        title: 'Không thể hủy đơn',
        text: "Không thể hủy đơn hàng ở trạng thái hiện tại.",
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận từ chối yêu cầu',
      text: 'Bạn có chắc chắn muốn từ chối yêu cầu hoàn hàng này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      try {
        setProcessing(true);
        
        await dispatch(updateReturnOrderStatus({
          returnId: orderData.return_requests[0].return_id,
          status: "Đã từ chối", 
        })).unwrap();

        Swal.fire({
          icon: 'success',
          title: 'Từ chối thành công',
          text: 'Yêu cầu hoàn hàng đã được từ chối.',
          timer: 2000,
          showConfirmButton: false,
        });

        dispatch(fetchReturnOrderById(returnId)); 
      } catch (error) {
        console.error("Chi tiết lỗi API:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error?.message || 'Có lỗi xảy ra khi từ chối yêu cầu.',
        });
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!currentReturnOrder) return <div className="error">Không tìm thấy thông tin đơn hoàn hàng.</div>;

  // Extract data from the correct structure - API returns data inside 'order' key
  const orderData = currentReturnOrder.order || currentReturnOrder;
  const {
    order_code,
    customer,
    email,
    order_status,
    payment_status,
    payment_method_name,
    order_created_at,
    return_requests,
  } = orderData;

  // Get total amount and products from return_requests
  const totalAmount = return_requests?.[0]?.refund_amount || 0;
  const products = return_requests?.[0]?.returned_items || [];

  const currentReturnStatus = return_requests?.[0]?.status || 'pending';
  const statusMilestones = getStatusMilestones(currentReturnStatus);

  return (
    <div className="detail-order-return-container">
      {(processing || loading) && <Loading />}
      
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
              <div className="order-code">Mã đơn: <span className="fw-bold">{order_code}</span></div>
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
                <span className="info-label">Tổng tiền hoàn</span>
                <span className="info-value highlight">{formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label mb-2">Phương thức thanh toán</span>
                <div className="payment-method">
                  <span className="payment-icon">🇻🇳</span>
                  {payment_method_name}
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-label">Trạng thái thanh toán</span>
                <span className={`payment-status-badge ${
                  payment_status?.toLowerCase().includes('đã thanh toán') ? 'status-paid' :
                  payment_status?.toLowerCase().includes('chưa thanh toán') ? 'status-unpaid' :
                  payment_status?.toLowerCase().includes('đã hoàn tiền') ? 'status-refunded' :
                  'status-default'
                }`}>
                  {payment_status}
                </span>
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
              <div key={index} className="return-product-card">
                <div className="return-product-header">
                  <img 
                    src={product.product_image} 
                    alt={product.product_name}
                    className="return-product-image"
                  />
                  <div className="return-product-info">
                    <div className="return-product-name">{product.product_name}</div>
                    <div className="return-product-total">
                      {formatCurrency(product.subtotal)}
                    </div>
                  </div>
                </div>
                <div className="return-product-attributes">
                  <div className="return-attribute-row">
                    <div className="return-attribute-item">
                      <span className="return-attribute-icon">📱</span>
                      <span className="return-attribute-text">
                        Bộ nhớ: {product.variant_attributes?.find(attr => 
                          attr.attribute_name === 'Bộ nhớ'
                        )?.attribute_value || '128GB'}
                      </span>
                    </div>
                    <div className="return-attribute-item">
                      <span className="return-quantity-text">Số lượng: {product.quantity}</span>
                    </div>
                  </div>
                  <div className="return-attribute-row">
                    <div className="return-attribute-item">
                      <span className="return-attribute-icon">🎨</span>
                      <span className="return-attribute-text">
                        Màu sắc: {product.variant_attributes?.find(attr => 
                          attr.attribute_name === 'Màu sắc'
                        )?.attribute_value || 'White Titanium'}
                      </span>
                    </div>
                    <div className="return-attribute-item">
                      <span className="return-unit-price-text">Đơn giá: {formatCurrency(product.price)}</span>
                    </div>
                  </div>
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
                  <span className="request-number">#{request.return_id}</span>
                  <span className="request-date">{request.created_at}</span>
                </div>
                
                <div className="request-grid">
                  <div className="info-item">
                    <span className="info-label">Ngày yêu cầu</span>
                    <span className="info-value">{request.created_at}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Trạng thái</span>
                    <span className={`info-value return-status-badge ${
                      request.status?.toLowerCase().includes('đã yêu cầu') || request.status?.toLowerCase().includes('yêu cầu') ? 'status-requested' :
                      request.status?.toLowerCase().includes('đã chấp thuận') ? 'status-approved' :
                      request.status?.toLowerCase().includes('đang xử lý') ? 'status-processing' :
                      request.status?.toLowerCase().includes('đã hoàn lại') || request.status?.toLowerCase().includes('hoàn thành') ? 'status-completed' :
                      request.status?.toLowerCase().includes('đã từ chối') || request.status?.toLowerCase().includes('từ chối') ? 'status-rejected' :
                      'status-default'
                    }`}>{request.status}</span>
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
                {request.return_reason_other && (
                  <div className="request-reason">
                    📝 Mô tả thêm: {request.return_reason_other}
                  </div>
                )}

                {/* Hiển thị hình ảnh */}
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
                                src={request.upload_url } 
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
          {/* Processing History */}
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
                        Số tiền hoàn: {formatCurrency(totalAmount)}
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
              {/* Nút cập nhật trạng thái */}
              <button 
                className="action-button button-primary" 
                onClick={handleUpdateStatus}
                disabled={processing}
              >
                {processing ? 'Đang xử lý...' : 'Cập nhật trạng thái đơn hàng'}
              </button>

              {/* Nút hủy chỉ hiển thị khi có thể hủy */}
              {canCancelOrder() && (
                <button 
                  className="action-button button-danger" 
                  onClick={handleCancelOrder}
                  disabled={processing}
                  style={{
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    color: 'white'
                  }}
                >
                  {processing ? 'Đang xử lý...' : 'Từ chối yêu cầu'}
                </button>
              )}
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
                <span className="summary-label">Tổng sản phẩm trả:</span>
                <span className="summary-value">{products.length} sản phẩm</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Số tiền hoàn:</span>
                <span className="summary-value highlight">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="summary-row final">
                <span className="summary-label">Khách nhận:</span>
                <span className="summary-value highlight final-amount">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailOrderReturn;
