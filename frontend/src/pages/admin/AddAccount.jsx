/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addUser } from '../../slices/adminuserSlice';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/admin/AddAccount.css';

const AddAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    role: '',
    status: 'active',
    image_url: null,
    password: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Các useEffect và functions validation giống như cũ...
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        toast.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
          setDistricts(response.data.districts);
          setSelectedDistrict("");
          setWards([]);
          setSelectedWard("");
          const provinceName = provinces.find(p => p.code === Number(selectedProvince))?.name || '';
          setFormData(prev => ({ ...prev, city: provinceName }));
        } catch (error) {
          console.error('Error fetching districts:', error);
          toast.error('Không thể tải danh sách quận/huyện');
        }
      } else {
        setDistricts([]);
        setSelectedDistrict("");
        setWards([]);
        setSelectedWard("");
        setFormData(prev => ({ ...prev, city: '' }));
      }
    };
    fetchDistricts();
  }, [selectedProvince, provinces]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          setWards(response.data.wards);
          setSelectedWard("");
          const districtName = districts.find(d => d.code === Number(selectedDistrict))?.name || '';
          setFormData(prev => ({ ...prev, district: districtName }));
        } catch (error) {
          console.error('Error fetching wards:', error);
          toast.error('Không thể tải danh sách phường/xã');
        }
      } else {
        setWards([]);
        setSelectedWard("");
        setFormData(prev => ({ ...prev, district: '' }));
      }
    };
    fetchWards();
  }, [selectedDistrict, districts]);

  useEffect(() => {
    if (selectedWard) {
      const wardName = wards.find(w => w.code === Number(selectedWard))?.name || '';
      setFormData(prev => ({ ...prev, ward: wardName }));
    } else {
      setFormData(prev => ({ ...prev, ward: '' }));
    }
  }, [selectedWard, wards]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'username') {
      if (!value.trim()) error = 'Tên đăng nhập là bắt buộc';
      else if (value.length < 4) error = 'Tên đăng nhập phải từ 4 ký tự trở lên';
    }
    if (name === 'full_name') {
      if (!value.trim()) error = 'Họ tên là bắt buộc';
      else if (value.length < 2) error = 'Họ tên phải từ 2 ký tự trở lên';
    }
    if (name === 'phone') {
      if (!value.trim()) error = 'Số điện thoại là bắt buộc';
      else if (!/^\d{9,11}$/.test(value)) error = 'Số điện thoại phải từ 9-11 số';
    }
    if (name === 'address') {
      if (!value.trim()) error = 'Địa chỉ là bắt buộc';
    }
    if (name === 'email') {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!value.trim()) error = 'Email là bắt buộc';
      else if (!emailRegex.test(value)) error = 'Email không hợp lệ!';
    }
    if (name === 'password') {
      const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
      if (!value) error = 'Mật khẩu là bắt buộc';
      else if (!passwordRegex.test(value)) error = 'Mật khẩu phải từ 8-16 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng!';
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_url: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData((prev) => ({ ...prev, image_url: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key] ?? '');
      });
      const resultAction = await dispatch(addUser(formDataToSend));
      if (addUser.fulfilled.match(resultAction)) {
        toast.success('Tạo tài khoản thành công!');
        navigate('/admin/accounts');
      } else {
        toast.error(resultAction.payload || 'Không thể tạo tài khoản');
      }
    } catch (error) {
      toast.error('Lỗi khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-account-wrapper">
      <div className="add-account-container">
        {/* Header */}
        <div className="add-account-header">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="header-title">Thêm Tài Khoản Mới</h1>
          <p className="header-subtitle">Điền thông tin để tạo tài khoản người dùng mới</p>
        </div>

        {/* Main Form Card */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload Section - Centered */}
            
            <div className="avatar-section">
              <div className="avatar-preview2">
                {imagePreview ? (
                  <div className="avatar-preview" onClick={() => document.getElementById('avatar-input').click()}>
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" onClick={(e) => {
                      e.stopPropagation(); // Ngăn event bubble
                      removeAvatar();
                    }} className="remove-btn">×</button>
                  </div>
                ) : (
                  <div className="avatar-placeholder" onClick={() => document.getElementById('avatar-input').click()}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                <label htmlFor="avatar-input" className="add-btn">+</label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <p className="avatar-text">Nhấp để tải ảnh đại diện</p>
            </div>

            {/* Form Fields - Two Columns */}
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                    </svg>
                    Tên đăng nhập <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập"
                    className={`form-input ${formErrors.username ? 'error' : ''}`}
                  />
                  {formErrors.username && <span className="error-text">{formErrors.username}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="m2 7 10 6 10-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên đầy đủ"
                    className={`form-input ${formErrors.full_name ? 'error' : ''}`}
                  />
                  {formErrors.full_name && <span className="error-text">{formErrors.full_name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="m2 7 10 6 10-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className={`form-input ${formErrors.email ? 'error' : ''}`}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    className={`form-input ${formErrors.phone ? 'error' : ''}`}
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Mật khẩu <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu"
                      className={`form-input ${formErrors.password ? 'error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      👁️
                    </button>
                  </div>
                  {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                      <path d="m17 11l2 2 4-4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Vai trò <span className="required">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="staff">Nhân viên</option>
                  </select>
                </div>
              </div>

              {/* Location Section */}
              <div className="location-section">
                <h3 className="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Thông tin địa chỉ
                </h3>

                <div className="location-row">
                  <div className="form-group">
                    <label className="form-label">Tỉnh/Thành phố</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quận/Huyện</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                      className="form-select"
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phường/Xã</label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                      className="form-select"
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Địa chỉ chi tiết</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập số nhà, tên đường..."
                    className={`form-textarea ${formErrors.address ? 'error' : ''}`}
                    rows="3"
                  />
                  {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                </div>
              </div>

              {/* Status Section */}
              <div className="status-section">
                <h3 className="section-title">Trạng thái tài khoản</h3>
                <div className="status-toggle">
                  <label className="toggle-label">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    Hoạt động
                  </label>
                  <label className="toggle-label">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-custom"></span>
                    Tạm khóa
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    username: '',
                    full_name: '',
                    email: '',
                    phone: '',
                    address: '',
                    ward: '',
                    district: '',
                    city: '',
                    role: '',
                    status: 'active',
                    image_url: null,
                    password: ''
                  });
                  setImagePreview(null);
                  setSelectedProvince('');
                  setSelectedDistrict('');
                  setSelectedWard('');
                  setFormErrors({});
                }}
                className="reset-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 16H3v5" stroke="currentColor" strokeWidth="2" />
                </svg>
                Đặt lại
              </button>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Tạo tài khoản
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;
