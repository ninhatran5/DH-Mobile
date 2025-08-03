import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUser, fetchUserById } from "../slices/adminuserSlice"; 
import "../assets/admin/EditAccount.css";
import { toast } from 'react-toastify';
import { FaEdit } from "react-icons/fa";

const EditAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { loading, error, selectedUser } = useSelector(state => state.adminuser);

  // State cho form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (id) {
        try {
          setIsLoading(true);
          await dispatch(fetchUserById(id)).unwrap();
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu user:', err);
          setErrors({ general: 'Không thể tải thông tin user. Vui lòng thử lại!' });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        full_name: selectedUser.full_name || '',
        phone: selectedUser.phone || '',
        address: selectedUser.address || '',
        ward: selectedUser.ward || '',
        district: selectedUser.district || '',
        city: selectedUser.city || '',
      });
      
      if (selectedUser.image_url) {
        setImagePreview(selectedUser.image_url);
      }
    }
  }, [selectedUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Kích thước file không được vượt quá 5MB'
        }));
        return;
      }

      setImageFile(file);
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ tên không được để trống';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) { 
        submitData.append(key, formData[key]);
      }
    });

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      await dispatch(updateUser({ 
        id: id,
        updatedData: submitData 
      })).unwrap();
      
      toast.success('Cập nhật thông tin thành công!');
      navigate(`/admin/detailacccount/${id}`);
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      if (typeof err === 'object' && err.message) {
        setErrors({ general: err.message });
      } else if (typeof err === 'string') {
        setErrors({ general: err });
      } else {
        setErrors({ general: 'Có lỗi xảy ra khi cập nhật thông tin' });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isLoading) {
    return (
      <div className="edit-account-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin user...</p>
        </div>
      </div>
    );
  }

  if (!selectedUser && !isLoading) {
    return (
      <div className="edit-account-container">
        <div className="error-container">
          <h2>Không tìm thấy thông tin user</h2>
          <button onClick={() => navigate('/admin/users')}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-account-container">
      <div className="edit-account-card">
        <h2 className="edit-account-title">
          Chỉnh Sửa Thông Tin 
        </h2>
        
        <form onSubmit={handleSubmit} className="edit-account-form">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <img 
                src={imagePreview || '/default-avatar.png'} 
                alt="Avatar" 
                className="avatar-image"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <label htmlFor="imageInput" className="avatar-upload-btn">
                <FaEdit style={{ color: "#ffffff"}} />
              </label>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="avatar-input"
              />
            </div>
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* Form Fields */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">
                Username <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
                placeholder="Nhập username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Nhập email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="full_name">
                Họ và tên <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={errors.full_name ? 'error' : ''}
                placeholder="Nhập họ và tên"
              />
              {errors.full_name && <span className="error-message">{errors.full_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Số điện thoại <span className="required-star">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ward">Phường/Xã</label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="Nhập phường/xã"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">Quận/Huyện</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Nhập quận/huyện"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="city">Tỉnh/Thành phố</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nhập tỉnh/thành phố"
              />
            </div>
          </div>

          {/* Error Message */}
          {(error || errors.general) && (
            <div className="error-message global-error">
              {errors.general || error}
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate(`/admin/detailacccount/${id}`)}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccount;
