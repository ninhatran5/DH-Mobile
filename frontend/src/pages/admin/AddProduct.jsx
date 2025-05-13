import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import '../../assets/admin/AddProduct.css';
const AddProduct = () => {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    image: null,
    parentCategory: '',
    displayOrder: 0,
    status: 'SHOW' 
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]); 

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
  };
  useEffect(() => {
    const mockCategories = [
      { id: 1, name: 'Phụ kiện' },
      { id: 2, name: 'Điện thoại' },
      { id: 3, name: 'Máy tính' }
    ];
    setCategories(mockCategories);
  }, []);

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Thêm Sản Phẩm Mới</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                {/* Tên danh mục */}
                <Form.Group className="mb-3">
                  <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên danh mục"
                  />
                </Form.Group>

                {/* Mô tả */}
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả danh mục"
                  />
                </Form.Group>

                {/* Danh mục cha */}
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục cha</Form.Label>
                  <Form.Select
                    name="parentCategory"
                    value={formData.parentCategory}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Chọn danh mục cha --</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Thứ tự hiển thị */}
                <Form.Group className="mb-3">
                  <Form.Label>Thứ tự hiển thị <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Nhập thứ tự hiển thị"
                  />
                </Form.Group>

                {/* Trạng thái */}
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="SHOW">Hiển thị</option>
                    <option value="HIDE">Ẩn</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                {/* Hình ảnh */}
                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh danh mục</Form.Label>
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
                          <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                          <p>Chọn hình ảnh</p>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <small className="text-muted">
                      Định dạng: JPG, PNG. Tối đa 2MB
                    </small>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" type="button">
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm danh mục
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddProduct; 