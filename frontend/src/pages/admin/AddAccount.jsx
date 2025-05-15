import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../assets/admin/AddAccount.module.css';

const AddAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    status: 'active',
    avatar: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        avatar: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') { // Don't send confirmPassword to server
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/accounts', {
        method: 'POST',
        body: formDataToSend // Using FormData to handle file upload
      });

      if (response.ok) {
        navigate('/admin/accounts');
      } else {
        const error = await response.json();
        alert(error.message || 'Không thể tạo tài khoản');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Lỗi khi thêm tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Thêm Tài Khoản Mới</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Row>
                  <Col md={6}>
                    {/* Username */}
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập tên đăng nhập"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Email */}
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập địa chỉ email"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    {/* Password */}
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập mật khẩu"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Confirm Password */}
                    <Form.Group className="mb-3">
                      <Form.Label>Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập lại mật khẩu"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    {/* First Name */}
                    <Form.Group className="mb-3">
                      <Form.Label>Tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Last Name */}
                    <Form.Group className="mb-3">
                      <Form.Label>Họ</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    {/* Phone */}
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Role */}
                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="user">Người dùng</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="editor">Biên tập viên</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Status */}
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="suspended">Tạm khóa</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                {/* Avatar */}
                <Form.Group className="mb-3">
                  <Form.Label>Ảnh đại diện</Form.Label>
                  <div className="image-upload-container">
                    <div className="image-preview-container mb-3">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '200px', width: 'auto' }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <i className="bi bi-person" style={{ fontSize: '2rem' }}></i>
                          <p>Chọn ảnh đại diện</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="mb-2"
                    />
                    <small className="text-muted">
                      Định dạng: JPG, PNG. Tối đa 2MB
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="secondary" 
                type="button"
                onClick={() => navigate('/admin/accounts')}
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="bi bi-arrow-repeat me-1 spinner"></i> Đang xử lý...
                  </>
                ) : (
                  'Thêm tài khoản'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddAccount; 