import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/addvoucher.css';

const AddVoucher = () => {
  const [voucherType, setVoucherType] = useState('percent');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherValue, setVoucherValue] = useState('');
  const [voucherDescription, setVoucherDescription] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)));
  const [isPublic, setIsPublic] = useState(true);
  const [isLimitPerUser, setIsLimitPerUser] = useState(false);
  const [limitPerUser, setLimitPerUser] = useState('1');
  const [errors, setErrors] = useState({});
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleVoucherTypeChange = (e) => {
    setVoucherType(e.target.value);
    
    // Reset voucher value when changing type
    setVoucherValue('');
  };

  const handleValueChange = (e) => {
    let value = e.target.value;
    
    if (voucherType === 'percent') {
      // Only allow numbers between 0-100 for percent
      if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
        setVoucherValue(value);
      }
    } else {
      // Only allow positive numbers for fixed and shipping
      if (value === '' || parseFloat(value) >= 0) {
        setVoucherValue(value);
      }
    }
  };

  const generateRandomCode = () => {
    setIsGeneratingCode(true);
    
    // Simulate API call to validate the code is unique
    setTimeout(() => {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let result = 'DH';
      
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      setVoucherCode(result);
      setIsGeneratingCode(false);
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!voucherCode.trim()) {
      newErrors.code = 'Vui lòng nhập mã voucher';
    } else if (voucherCode.length < 4) {
      newErrors.code = 'Mã voucher phải có ít nhất 4 ký tự';
    }
    
    if (!voucherValue) {
      newErrors.value = 'Vui lòng nhập giá trị voucher';
    } else if (voucherType === 'percent' && (parseFloat(voucherValue) <= 0 || parseFloat(voucherValue) > 100)) {
      newErrors.value = 'Giá trị phần trăm phải từ 1% đến 100%';
    } else if ((voucherType === 'fixed' || voucherType === 'shipping') && parseFloat(voucherValue) <= 0) {
      newErrors.value = 'Giá trị voucher phải lớn hơn 0';
    }
    
    if (!minOrder) {
      newErrors.minOrder = 'Vui lòng nhập giá trị đơn hàng tối thiểu';
    } else if (parseFloat(minOrder) < 0) {
      newErrors.minOrder = 'Giá trị đơn hàng tối thiểu không được âm';
    }
    
    if (!usageLimit) {
      newErrors.usageLimit = 'Vui lòng nhập giới hạn sử dụng';
    } else if (parseInt(usageLimit) <= 0) {
      newErrors.usageLimit = 'Giới hạn sử dụng phải lớn hơn 0';
    }
    
    if (isLimitPerUser && (!limitPerUser || parseInt(limitPerUser) <= 0)) {
      newErrors.limitPerUser = 'Giới hạn mỗi người dùng phải lớn hơn 0';
    }
    
    if (endDate <= startDate) {
      newErrors.dateRange = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (!voucherDescription.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả voucher';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format data for API submission
      const voucherData = {
        code: voucherCode,
        type: voucherType,
        value: parseFloat(voucherValue),
        description: voucherDescription,
        minOrder: parseFloat(minOrder),
        usageLimit: parseInt(usageLimit),
        startDate: startDate,
        endDate: endDate,
        isPublic: isPublic,
        isLimitPerUser: isLimitPerUser,
        limitPerUser: isLimitPerUser ? parseInt(limitPerUser) : null
      };
      
      console.log('Submitting voucher data:', voucherData);
      // Here you would typically call an API to save the voucher
      alert('Voucher đã được tạo thành công!');
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Preview of what the voucher will look like
  const voucherPreviewValue = voucherType === 'percent' 
    ? `${voucherValue || 0}%` 
    : formatCurrency(voucherValue || 0);
  
  const voucherPreviewDescription = `Giảm ${voucherPreviewValue} cho đơn hàng từ ${formatCurrency(minOrder || 0)}`;

  return (
    <div className="adminaddvoucher-container">
      <div className="adminaddvoucher-header">
        <div className="adminaddvoucher-title">
          <h1>Thêm Voucher Mới</h1>
          <p className="text-muted">Tạo mã giảm giá mới cho cửa hàng</p>
        </div>
        <div className="adminaddvoucher-actions">
          <Link to="/admin/vouchers" className="adminaddvoucher-btn adminaddvoucher-btn-outline">
            <i className="bi bi-arrow-left"></i> Quay lại
          </Link>
        </div>
      </div>

      <div className="adminaddvoucher-content">
        <div className="adminaddvoucher-form-container">
          <form onSubmit={handleSubmit} className="adminaddvoucher-form">
            <div className="adminaddvoucher-section">
              <h2 className="adminaddvoucher-section-title">Thông tin cơ bản</h2>
              
              <div className="adminaddvoucher-form-group">
                <label className="adminaddvoucher-label">Loại voucher</label>
                <div className="adminaddvoucher-radio-group">
                  <label className={`adminaddvoucher-radio-card ${voucherType === 'percent' ? 'active' : ''}`}>
                    <input 
                      type="radio"
                      name="voucherType"
                      value="percent"
                      checked={voucherType === 'percent'}
                      onChange={handleVoucherTypeChange}
                    />
                    <div className="adminaddvoucher-radio-content">
                      <i className="bi bi-percent"></i>
                      <span>Giảm theo %</span>
                    </div>
                  </label>
                  
                  <label className={`adminaddvoucher-radio-card ${voucherType === 'fixed' ? 'active' : ''}`}>
                    <input 
                      type="radio"
                      name="voucherType"
                      value="fixed"
                      checked={voucherType === 'fixed'}
                      onChange={handleVoucherTypeChange}
                    />
                    <div className="adminaddvoucher-radio-content">
                      <i className="bi bi-cash"></i>
                      <span>Giảm số tiền cố định</span>
                    </div>
                  </label>
                  
                  <label className={`adminaddvoucher-radio-card ${voucherType === 'shipping' ? 'active' : ''}`}>
                    <input 
                      type="radio"
                      name="voucherType"
                      value="shipping"
                      checked={voucherType === 'shipping'}
                      onChange={handleVoucherTypeChange}
                    />
                    <div className="adminaddvoucher-radio-content">
                      <i className="bi bi-truck"></i>
                      <span>Giảm phí vận chuyển</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="adminaddvoucher-form-row">
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">Mã voucher</label>
                  <div className="adminaddvoucher-input-group">
                    <input 
                      type="text"
                      className={`adminaddvoucher-input ${errors.code ? 'adminaddvoucher-input-error' : ''}`}
                      placeholder="VD: SUMMER2023"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      type="button" 
                      className="adminaddvoucher-btn adminaddvoucher-btn-secondary adminaddvoucher-generate-btn"
                      onClick={generateRandomCode}
                      disabled={isGeneratingCode}
                    >
                      {isGeneratingCode ? (
                        <><i className="bi bi-arrow-repeat adminaddvoucher-spinner"></i> Đang tạo...</>
                      ) : (
                        <><i className="bi bi-magic"></i> Tạo mã</>
                      )}
                    </button>
                  </div>
                  {errors.code && <div className="adminaddvoucher-error">{errors.code}</div>}
                  <div className="adminaddvoucher-hint">
                    Mã voucher nên viết liền, không dấu, chỉ dùng chữ và số
                  </div>
                </div>
                
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">
                    {voucherType === 'percent' ? 'Phần trăm giảm giá (%)' : 
                     voucherType === 'fixed' ? 'Số tiền giảm giá (VND)' : 
                     'Giảm phí vận chuyển (VND)'}
                  </label>
                  <div className="adminaddvoucher-input-wrapper">
                    <input 
                      type="number"
                      className={`adminaddvoucher-input ${errors.value ? 'adminaddvoucher-input-error' : ''}`}
                      placeholder={voucherType === 'percent' ? 'VD: 10' : 'VD: 50000'}
                      value={voucherValue}
                      onChange={handleValueChange}
                      min={voucherType === 'percent' ? "0" : "1000"}
                      max={voucherType === 'percent' ? "100" : ""}
                      step={voucherType === 'percent' ? "1" : "1000"}
                    />
                    {voucherType === 'percent' && (
                      <div className="adminaddvoucher-input-suffix">%</div>
                    )}
                    {voucherType !== 'percent' && (
                      <div className="adminaddvoucher-input-suffix">₫</div>
                    )}
                  </div>
                  {errors.value && <div className="adminaddvoucher-error">{errors.value}</div>}
                </div>
              </div>
              
              <div className="adminaddvoucher-form-row">
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">Đơn hàng tối thiểu (VND)</label>
                  <div className="adminaddvoucher-input-wrapper">
                    <input 
                      type="number"
                      className={`adminaddvoucher-input ${errors.minOrder ? 'adminaddvoucher-input-error' : ''}`}
                      placeholder="VD: 100000"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      min="0"
                      step="10000"
                    />
                    <div className="adminaddvoucher-input-suffix">₫</div>
                  </div>
                  {errors.minOrder && <div className="adminaddvoucher-error">{errors.minOrder}</div>}
                </div>
                
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">Số lượng voucher</label>
                  <input 
                    type="number"
                    className={`adminaddvoucher-input ${errors.usageLimit ? 'adminaddvoucher-input-error' : ''}`}
                    placeholder="VD: 100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min="1"
                  />
                  {errors.usageLimit && <div className="adminaddvoucher-error">{errors.usageLimit}</div>}
                </div>
              </div>
            </div>
            
            <div className="adminaddvoucher-section">
              <h2 className="adminaddvoucher-section-title">Thời gian hiệu lực</h2>
              
              <div className="adminaddvoucher-form-row">
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">Ngày bắt đầu</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                    className="adminaddvoucher-input adminaddvoucher-date-input"
                  />
                </div>
                
                <div className="adminaddvoucher-form-group">
                  <label className="adminaddvoucher-label">Ngày kết thúc</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="dd/MM/yyyy"
                    className={`adminaddvoucher-input adminaddvoucher-date-input ${errors.dateRange ? 'adminaddvoucher-input-error' : ''}`}
                  />
                  {errors.dateRange && <div className="adminaddvoucher-error">{errors.dateRange}</div>}
                </div>
              </div>
            </div>
            
            <div className="adminaddvoucher-section">
              <h2 className="adminaddvoucher-section-title">Hạn chế sử dụng</h2>
              
              <div className="adminaddvoucher-form-group">
                <div className="adminaddvoucher-switch-group">
                  <label className="adminaddvoucher-switch">
                    <input 
                      type="checkbox" 
                      checked={isPublic} 
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <span className="adminaddvoucher-switch-slider"></span>
                  </label>
                  <span className="adminaddvoucher-switch-label">
                    Hiển thị công khai cho tất cả khách hàng
                  </span>
                </div>
                <div className="adminaddvoucher-hint">
                  Nếu tắt, voucher sẽ không hiển thị trong danh sách voucher công khai
                </div>
              </div>
              
              <div className="adminaddvoucher-form-group">
                <div className="adminaddvoucher-switch-group">
                  <label className="adminaddvoucher-switch">
                    <input 
                      type="checkbox" 
                      checked={isLimitPerUser} 
                      onChange={(e) => setIsLimitPerUser(e.target.checked)}
                    />
                    <span className="adminaddvoucher-switch-slider"></span>
                  </label>
                  <span className="adminaddvoucher-switch-label">
                    Giới hạn số lần sử dụng cho mỗi khách hàng
                  </span>
                </div>
                
                {isLimitPerUser && (
                  <div className="adminaddvoucher-indented-form">
                    <div className="adminaddvoucher-form-group">
                      <label className="adminaddvoucher-label">Số lần tối đa mỗi khách hàng</label>
                      <input 
                        type="number"
                        className={`adminaddvoucher-input ${errors.limitPerUser ? 'adminaddvoucher-input-error' : ''}`}
                        placeholder="VD: 1"
                        value={limitPerUser}
                        onChange={(e) => setLimitPerUser(e.target.value)}
                        min="1"
                      />
                      {errors.limitPerUser && <div className="adminaddvoucher-error">{errors.limitPerUser}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="adminaddvoucher-section">
              <h2 className="adminaddvoucher-section-title">Mô tả voucher</h2>
              
              <div className="adminaddvoucher-form-group">
                <label className="adminaddvoucher-label">Mô tả hiển thị cho khách hàng</label>
                <textarea 
                  className={`adminaddvoucher-textarea ${errors.description ? 'adminaddvoucher-input-error' : ''}`}
                  placeholder="VD: Giảm 10% cho đơn hàng từ 500,000đ"
                  value={voucherDescription}
                  onChange={(e) => setVoucherDescription(e.target.value)}
                  rows="3"
                ></textarea>
                {errors.description && <div className="adminaddvoucher-error">{errors.description}</div>}
              </div>
            </div>
            
            <div className="adminaddvoucher-form-actions">
              <button type="button" className="adminaddvoucher-btn adminaddvoucher-btn-outline">
                Hủy
              </button>
              <button type="submit" className="adminaddvoucher-btn adminaddvoucher-btn-primary">
                <i className="bi bi-plus-circle"></i> Tạo voucher
              </button>
            </div>
          </form>
        </div>
        
        <div className="adminaddvoucher-preview-container">
          <div className="adminaddvoucher-preview-title">
            <h3>Xem trước voucher</h3>
          </div>
          
          <div className="adminaddvoucher-preview">
            <div className="adminaddvoucher-voucher-card">
              <div className="adminaddvoucher-voucher-top">
                <div className="adminaddvoucher-voucher-logo">
                  <i className="bi bi-gift"></i>
                </div>
                <div className="adminaddvoucher-voucher-info">
                  <div className="adminaddvoucher-voucher-value">{voucherPreviewValue}</div>
                  <div className="adminaddvoucher-voucher-type">
                    {voucherType === 'percent' ? 'GIẢM GIÁ' : 
                     voucherType === 'fixed' ? 'GIẢM TIỀN' : 
                     'GIẢM VẬN CHUYỂN'}
                  </div>
                </div>
              </div>
              
              <div className="adminaddvoucher-voucher-middle">
                <div className="adminaddvoucher-voucher-code">{voucherCode || 'VOUCHER'}</div>
                <div className="adminaddvoucher-voucher-description">
                  {voucherDescription || voucherPreviewDescription}
                </div>
              </div>
              
              <div className="adminaddvoucher-voucher-bottom">
                <div className="adminaddvoucher-voucher-validity">
                  Hiệu lực: {startDate.toLocaleDateString('vi-VN')} - {endDate.toLocaleDateString('vi-VN')}
                </div>
                <div className="adminaddvoucher-voucher-usage">
                  {isLimitPerUser ? `Mỗi khách hàng sử dụng tối đa ${limitPerUser} lần` : 'Không giới hạn lần sử dụng/khách hàng'}
                </div>
              </div>
              
              {!isPublic && (
                <div className="adminaddvoucher-voucher-private">
                  <i className="bi bi-eye-slash"></i> Không công khai
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVoucher; 