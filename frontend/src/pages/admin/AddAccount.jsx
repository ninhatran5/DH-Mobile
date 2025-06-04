import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addUser } from '../../slices/adminuserSlice';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

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

  // Fetch provinces on component mount
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

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
          setDistricts(response.data.districts);
          setSelectedDistrict("");
          setWards([]);
          setSelectedWard("");
          // Update formData with selected province name
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

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          setWards(response.data.wards);
          setSelectedWard("");
          // Update formData with selected district name
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

  // Update ward in formData when ward is selected
  useEffect(() => {
    if (selectedWard) {
      const wardName = wards.find(w => w.code === Number(selectedWard))?.name || '';
      setFormData(prev => ({ ...prev, ward: wardName }));
    } else {
      setFormData(prev => ({ ...prev, ward: '' }));
    }
  }, [selectedWard, wards]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] === null || formData[key] === undefined) {
          formDataToSend.append(key, '');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      console.log('Dữ liệu gửi lên server:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const resultAction = await dispatch(addUser(formDataToSend));

      if (addUser.fulfilled.match(resultAction)) {
        toast.success('Tạo tài khoản thành công!');
        navigate('/admin/accounts');
      } else {
        console.error('Lỗi từ server:', resultAction.payload);
        toast.error(resultAction.payload || 'Không thể tạo tài khoản');
      }
    } catch (error) {
      console.error('Lỗi submit:', error);
      toast.error('Lỗi khi tạo tài khoản');
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
                {/* Các trường form */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        
                        placeholder="Nhập tên đăng nhập"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        
                        placeholder="Nhập email"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Thêm trường mật khẩu */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Nhập mật khẩu"
                          className="form-control-lg"
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          className="btn-lg"
                          style={{ borderLeft: 'none' }}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập số nhà, tên đường"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tỉnh/Thành phố</Form.Label>
                      <Form.Select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quận/Huyện</Form.Label>
                      <Form.Select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedProvince}
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phường/Xã</Form.Label>
                      <Form.Select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedDistrict}
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="form-select-lg"
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
                  <Col md={6}>
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
                </Row>
              </Col>

              <Col md={4}>
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
                    <small className="text-muted">Định dạng: JPG, PNG. Tối đa 2MB</small>
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
