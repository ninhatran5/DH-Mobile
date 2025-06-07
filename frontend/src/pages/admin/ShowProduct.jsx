import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaPen, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { fetchAdminProductVariants } from '../../slices/AdminProductVariants';
import { fetchAdminProducts } from '../../slices/adminproductsSlice';
import { fetchAdminProductSpecifications } from '../../slices/adminProductSpecificationsSlice';



const ShowProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Get data from Redux store
  const { productVariants, loading: variantsLoading, error: variantsError } = useSelector(
    (state) => state.adminProductVariants
  );
  const { adminproducts, loading: productsLoading, error: productsError } = useSelector(
    (state) => state.adminproduct
  );
  const { productSpecifications, loading: specsLoading, error: specsError } = useSelector(
    (state) => state.adminProductSpecifications
  );

  // Filter data for current product
  const currentProduct = adminproducts.find(p => p.product_id === parseInt(id));
  const currentProductVariants = productVariants.filter(
    (variant) => variant.product_id === parseInt(id)
  );
  const currentProductSpecs = productSpecifications.filter(
    (spec) => spec.product_id === parseInt(id)
  );

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminProductVariants());
    dispatch(fetchAdminProductSpecifications());
  }, [dispatch]);

  // Loading state
  if (productsLoading || variantsLoading || specsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  // Error state
  if (productsError || variantsError || specsError) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Lỗi</Alert.Heading>
        <p>{productsError || variantsError || specsError}</p>
        <Link to="/admin/product" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Quay lại danh sách sản phẩm
        </Link>
      </Alert>
    );
  }

  // Not found state
  if (!currentProduct) {
    return (
      <Alert variant="warning" className="my-4">
        <Alert.Heading>Không tìm thấy sản phẩm</Alert.Heading>
        <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/admin/product" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Quay lại danh sách sản phẩm
        </Link>
      </Alert>
    );
  }

  // Format helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Chi tiết sản phẩm</h2>
        <div>
          <Link to="/admin/product" className="btn btn-outline-secondary me-2" 
            style={{ 
              borderRadius: '8px', 
              padding: '8px 16px', 
              fontWeight: '500',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
            }}
          >
            <FaArrowLeft className="me-2" /> Quay lại
          </Link>
        </div>
      </div>

      <Row>
        <Col lg={4} md={12} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin_dh-border)' }}>
            <Card.Header className="bg-white py-3" style={{ borderBottom: '1px solid var(--admin_dh-border)' }}>
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Hình ảnh sản phẩm</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="product-main-image position-relative" style={{ backgroundColor: '#f8f9fa', padding: '15px' }}>
                <img 
                  src={currentProduct.image_url} 
                  alt={currentProduct.name} 
                  className="img-fluid w-100"
                  style={{ 
                    height: '280px', 
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={12} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin_dh-border)' }}>
            <Card.Header className="bg-white py-3" style={{ borderBottom: '1px solid var(--admin_dh-border)' }}>
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Thông tin cơ bản</h5>
            </Card.Header>
            <Card.Body style={{ padding: '20px' }}>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h3 className="product-title" style={{ fontWeight: '700', color: 'var(--admin_dh-text)', marginBottom: '12px' }}>
                      {currentProduct.name}
                    </h3>
                    <div className="d-flex align-items-center mb-2">
                      <h4 className="text-primary me-2 mb-0" style={{ fontWeight: '700' }}>
                        {formatCurrency(currentProduct.price)}
                      </h4>
                      {currentProduct.price_original && (
                        <h6 className="text-muted mb-0">
                          <del>{formatCurrency(currentProduct.price_original)}</del>
                        </h6>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Danh mục:</span> {currentProduct.category?.name}
                    </p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>ID Sản phẩm:</span> {currentProduct.product_id}
                    </p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Ngày tạo:</span> {formatDate(currentProduct.created_at)}
                    </p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Cập nhật lần cuối:</span> {formatDate(currentProduct.updated_at)}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="mb-1" style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Mô tả:</p>
                    <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.5', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                      {currentProduct.description}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin_dh-border)' }}>
            <Card.Header className="bg-white py-3" style={{ borderBottom: '1px solid var(--admin_dh-border)' }}>
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Thông số kỹ thuật</h5>
            </Card.Header>
            <Card.Body style={{ padding: '10px' }}>
              {currentProductSpecs && currentProductSpecs.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', fontWeight: '600', width: '40%' }}>Thông số</th>
                        <th style={{ padding: '8px', fontWeight: '600' }}>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProductSpecs.map((spec) => (
                        <tr key={spec.spec_id}>
                          <td style={{ padding: '8px', fontWeight: '500' }}>{spec.spec_name}</td>
                          <td style={{ padding: '8px' }}>{spec.spec_value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">Không có thông số kỹ thuật</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin_dh-border)' }}>
            <Card.Header className="bg-white py-3" style={{ borderBottom: '1px solid var(--admin_dh-border)' }}>
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Phiên bản sản phẩm</h5>
            </Card.Header>
            <Card.Body style={{ padding: '10px' }}>
              {currentProductVariants && currentProductVariants.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0" style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '8px', fontWeight: '600' }}>SKU</th>
                        <th style={{ padding: '8px', fontWeight: '600' }}>Giá bán</th>
                        <th style={{ padding: '8px', fontWeight: '600' }}>Giá gốc</th>
                        <th style={{ padding: '8px', fontWeight: '600' }}>Tồn kho</th>
                        <th style={{ padding: '8px', fontWeight: '600' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProductVariants.map((variant) => (
                        <tr key={variant.variant_id}>
                          <td style={{ padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {variant.image_url && (
                                <img 
                                  src={variant.image_url} 
                                  alt={variant.sku}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                              <span style={{ fontSize: '0.85rem' }}>{variant.sku}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px', color: 'var(--admin_dh-primary)', fontWeight: '600' }}>
                            {formatCurrency(variant.price)}
                          </td>
                          <td style={{ padding: '8px', textDecoration: 'line-through', color: '#666' }}>
                            {variant.price_original && formatCurrency(variant.price_original)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {variant.stock}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            {variant.stock > 0 ? (
                              <Badge bg="success" style={{ borderRadius: '4px', padding: '4px 8px' }}>
                                <FaCheck className="me-1" style={{ fontSize: '0.7rem' }} /> Còn hàng
                              </Badge>
                            ) : (
                              <Badge bg="danger" style={{ borderRadius: '4px', padding: '4px 8px' }}>
                                <FaTimes className="me-1" style={{ fontSize: '0.7rem' }} /> Hết hàng
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">Không có phiên bản sản phẩm</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShowProduct; 