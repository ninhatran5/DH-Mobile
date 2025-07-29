import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReturnOrderById } from "../../slices/AdminReturnOrderSlice";
import Loading from "../../components/Loading";
import "../../assets/admin/DetailOrderReturn.css";

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

  if (loading) return <Loading />;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!currentReturnOrder) return <div className="error">Không tìm thấy thông tin đơn hoàn hàng.</div>;

  const {
    order_code,
    customer,
    email,
    total_amount,
    order_status,
   payment_method_description,
   payment_method_name,
    order_created_at,
    products,
    return_requests,
  } = currentReturnOrder;

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
                <span className="info-label">Tổng tiền</span>
                <span className="info-value highlight">{formatCurrency(total_amount)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label mb-2">Phương thức thanh toán</span>
                <div className="payment-method">
                 {payment_method_name} - {payment_method_description}
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
                  <span className="request-date">{formatDate(request.created_at)}</span>
                </div>
                
                <div className="request-grid">
                  <div className="info-item">
                    <span className="info-label">Ngày yêu cầu</span>
                    <span className="info-value">{formatDate(request.created_at)}</span>
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
                
                <div className="request-status">
                  <span className="status-completed">
                    <span className="status-icon">✅</span>
                    Đã hoàn lại
                  </span>
                </div>
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
              <div className="history-item completed">
                <div className="history-icon">
                  <span>✓</span>
                </div>
                <div className="history-content">
                  <div className="history-title">{return_requests?.[0]?.status}</div>
                  <div className="history-time">{order_created_at}</div>
                  <div className="history-amount">Số tiền: {formatCurrency(total_amount)}</div>
                </div>
              </div>
              
              <div className="history-item completed">
                <div className="history-icon">
                  <span>✓</span>
                </div>
                <div className="history-content">
                  <div className="history-title">Đã trả hàng</div>
                  <div className="history-time">{order_created_at}</div>
                  <div className="history-reason">
                    Lý do: {return_requests?.[0]?.reason}
                  </div>
                </div>
              </div>
              
              <div className="history-item pending">
                <div className="history-icon">
                  <span>📋</span>
                </div>
                <div className="history-content">
                  <div className="history-title">Đặt hàng thành công</div>
                  <div className="history-time">{order_created_at}</div>
                  <div className="history-order-code">Mã đơn: {order_code}</div>
                </div>
              </div>
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
               <button className="action-button button-orange">
                Liên hệ hỗ trợ
              </button>
              <button className="action-button button-orange">
                Liên hệ hỗ trợ
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
