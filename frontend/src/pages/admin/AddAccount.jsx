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
    status: '',
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
    // Validate realtime
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_url: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    // Validate tất cả trường
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
    <Container fluid className="admin-add-account-container">
      <Card className="admin-add-account-shadow">
        <Card.Header className="admin-add-account-bg-white">
          <h4 className="admin-add-account-title">Thêm Tài Khoản Mới</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit} className="admin-add-account-form">
            <Row>
              <Col md={8} className="admin-add-account-left">
                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Tên đăng nhập <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đăng nhập"
                        className="admin-add-account-input"
                      />
                      {formErrors.username && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.username}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Email <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email hợp lệ, ví dụ: example@gmail.com"
                        className="admin-add-account-input"
                      />
                      {formErrors.email && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.email}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Mật khẩu <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <div className="input-group admin-add-account-input-group">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Nhập mật khẩu"
                          className="form-control-lg admin-add-account-input"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          className="btn-lg admin-add-account-btn-eye"
                          style={{ borderLeft: 'none' }}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </Button>
                      </div>
                      {formErrors.password && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.password}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Họ tên <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        className="admin-add-account-input"
                      />
                      {formErrors.full_name && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.full_name}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Số điện thoại <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        className="admin-add-account-input"
                      />
                      {formErrors.phone && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.phone}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Địa chỉ <span className="admin-add-account-required text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ chi tiết"
                        className="admin-add-account-input"
                      />
                      {formErrors.address && (
                        <div style={{ color: 'red', fontSize: '0.95em', marginTop: 2 }}>{formErrors.address}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Tỉnh/Thành phố</Form.Label>
                      <Form.Select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="admin-add-account-select"
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Quận/Huyện</Form.Label>
                      <Form.Select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedProvince}
                        className="admin-add-account-select"
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(district => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Phường/Xã</Form.Label>
                      <Form.Select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
                        className="admin-add-account-select"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Vai trò</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="form-select-lg admin-add-account-select"
                      >
                        <option value="">Chọn vai trò</option>
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="sale">Nhân viên bán hàng</option>
                        <option value="shipper">Nhân viên giao hàng</option>
                        <option value="checker">Nhân viên kiểm hàng</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="admin-add-account-col">
                    <Form.Group className="admin-add-account-group mb-3">
                      <Form.Label className="admin-add-account-label">Trạng thái</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="admin-add-account-select"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="suspended">Tạm khóa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={4} className="admin-add-account-right">
                <Form.Group className="admin-add-account-group mb-3">
                  <Form.Label className="admin-add-account-label">Ảnh đại diện</Form.Label>
                  <div className="admin-add-account-image-upload-container">
                    <div className="admin-add-account-image-preview-container mb-3">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-thumbnail admin-add-account-img-thumbnail"
                          style={{ maxHeight: '200px', width: 'auto' }}
                        />
                      ) : (
                        <div className="admin-add-account-image-placeholder">
                          <i className="bi bi-person" style={{ fontSize: '2rem' }}></i>
                          <p>Chọn ảnh đại diện</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="mb-2 admin-add-account-input-file"
                    />
                    <small className="text-muted">Định dạng: JPG, PNG. Tối đa 2MB</small>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 admin-add-account-actions">
              <Button variant="secondary" type="button" onClick={() => navigate('/admin/accounts')} className="admin-add-account-cancel-btn">
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="admin-add-account-submit-btn">
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
