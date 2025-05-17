import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaPen, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

// Dữ liệu mẫu sản phẩm - đặt ở ngoài component để không bị tạo lại khi render
const mockProducts = [
  {
    id: "1",
    name: 'iPhone 16 Pro Max',
    price: 24000000,
    originalPrice: 24500000,
    discount: 2,
    description: 'iPhone 16 Pro Max mang đến thiết kế sang trọng với khung thép không gỉ và mặt lưng kính cường lực. Màn hình Super Retina XDR với công nghệ ProMotion cung cấp trải nghiệm hình ảnh mượt mà.',
    category: 'Điện thoại',
    subcategory: 'Apple',
    status: 'available',
    stock: 128,
    sold: 42,
    createdAt: '2023-10-15T08:30:00.000Z',
    updatedAt: '2023-11-05T15:45:00.000Z',
    specifications: [
      { name: 'Màn hình', value: 'OLED 6.7 inches, Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'RAM', value: '8GB' },
      { name: 'Bộ nhớ trong', value: '256GB' },
      { name: 'Camera sau', value: 'Hệ thống 3 camera 48MP' },
      { name: 'Camera trước', value: '12MP, Face ID' },
      { name: 'Pin', value: '4.422 mAh' },
      { name: 'Hệ điều hành', value: 'iOS 17' }
    ],
    variants: [
      { id: 1, name: '128GB', color: 'Titan đen', price: 24000000, stock: 45 },
      { id: 2, name: '256GB', color: 'Titan đen', price: 26000000, stock: 30 },
      { id: 3, name: '128GB', color: 'Titan tự nhiên', price: 24000000, stock: 38 },
      { id: 4, name: '256GB', color: 'Titan tự nhiên', price: 26000000, stock: 15 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/42/303937/iphone-16-pro-max-den-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/303937/iphone-16-pro-max-den-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/303937/iphone-16-pro-max-den-3.jpg'
    ],
    rating: 4.8,
    reviewCount: 75
  },
  {
    id: "3",
    name: 'Samsung Galaxy S24 Ultra',
    price: 22990000,
    originalPrice: 23990000,
    discount: 4,
    description: 'Samsung Galaxy S24 Ultra kết hợp thiết kế cao cấp với hiệu suất mạnh mẽ. Màn hình Dynamic AMOLED 2X với độ phân giải QHD+ mang đến hình ảnh sắc nét và sống động.',
    category: 'Điện thoại',
    subcategory: 'Samsung',
    status: 'available',
    stock: 95,
    sold: 67,
    createdAt: '2023-11-10T10:15:00.000Z',
    updatedAt: '2023-12-05T14:30:00.000Z',
    specifications: [
      { name: 'Màn hình', value: 'Dynamic AMOLED 2X 6.8 inches, QHD+' },
      { name: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { name: 'RAM', value: '12GB' },
      { name: 'Bộ nhớ trong', value: '256GB' },
      { name: 'Camera sau', value: 'Hệ thống 4 camera 200MP' },
      { name: 'Camera trước', value: '12MP' },
      { name: 'Pin', value: '5.000 mAh' },
      { name: 'Hệ điều hành', value: 'Android 14, One UI 6.1' }
    ],
    variants: [
      { id: 1, name: '256GB', color: 'Đen', price: 22990000, stock: 40 },
      { id: 2, name: '512GB', color: 'Đen', price: 24990000, stock: 25 },
      { id: 3, name: '256GB', color: 'Xám titan', price: 22990000, stock: 30 },
      { id: 4, name: '512GB', color: 'Xám titan', price: 24990000, stock: 0 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/42/317981/samsung-galaxy-s24-ultra-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/317981/samsung-galaxy-s24-ultra-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/317981/samsung-galaxy-s24-ultra-3.jpg'
    ],
    rating: 4.9,
    reviewCount: 52
  },
  {
    id: "4",
    name: 'MacBook Pro 14-inch',
    price: 45990000,
    originalPrice: 47990000,
    discount: 4,
    description: 'MacBook Pro 14-inch với chip M3 Pro mang đến hiệu suất ấn tượng dành cho người dùng chuyên nghiệp. Màn hình Liquid Retina XDR cung cấp độ sáng và màu sắc vượt trội.',
    category: 'Laptop',
    subcategory: 'Apple',
    status: 'available',
    stock: 32,
    sold: 18,
    createdAt: '2023-12-01T09:45:00.000Z',
    updatedAt: '2024-01-15T11:20:00.000Z',
    specifications: [
      { name: 'Màn hình', value: '14.2 inches, Liquid Retina XDR' },
      { name: 'Chip', value: 'Apple M3 Pro' },
      { name: 'RAM', value: '16GB' },
      { name: 'Bộ nhớ trong', value: '512GB SSD' },
      { name: 'Card đồ họa', value: 'GPU 16 nhân' },
      { name: 'Pin', value: 'Lên đến 12 giờ' },
      { name: 'Hệ điều hành', value: 'macOS Sonoma' }
    ],
    variants: [
      { id: 1, name: 'M3 Pro/16GB/512GB', color: 'Xám', price: 45990000, stock: 15 },
      { id: 2, name: 'M3 Pro/16GB/1TB', color: 'Xám', price: 49990000, stock: 10 },
      { id: 3, name: 'M3 Pro/16GB/512GB', color: 'Bạc', price: 45990000, stock: 7 },
      { id: 4, name: 'M3 Pro/16GB/1TB', color: 'Bạc', price: 49990000, stock: 0 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/44/282885/macbook-pro-14-m3-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/44/282885/macbook-pro-14-m3-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/44/282885/macbook-pro-14-m3-3.jpg'
    ],
    rating: 4.7,
    reviewCount: 23
  },
  {
    id: "5",
    name: 'iPad Pro M2',
    price: 28990000,
    originalPrice: 29990000,
    discount: 3,
    description: 'iPad Pro với chip M2 mang đến hiệu suất vượt trội trong thân máy mỏng nhẹ. Màn hình Liquid Retina XDR cung cấp độ tương phản và màu sắc chân thực.',
    category: 'Máy tính bảng',
    subcategory: 'Apple',
    status: 'available',
    stock: 47,
    sold: 29,
    createdAt: '2023-09-20T13:25:00.000Z',
    updatedAt: '2024-02-10T16:40:00.000Z',
    specifications: [
      { name: 'Màn hình', value: '12.9 inches, Liquid Retina XDR' },
      { name: 'Chip', value: 'Apple M2' },
      { name: 'RAM', value: '8GB' },
      { name: 'Bộ nhớ trong', value: '256GB' },
      { name: 'Camera sau', value: '12MP + 10MP Ultra Wide' },
      { name: 'Camera trước', value: '12MP Ultra Wide' },
      { name: 'Pin', value: 'Lên đến 10 giờ' },
      { name: 'Hệ điều hành', value: 'iPadOS 17' }
    ],
    variants: [
      { id: 1, name: '256GB', color: 'Xám', price: 28990000, stock: 20 },
      { id: 2, name: '512GB', color: 'Xám', price: 32990000, stock: 15 },
      { id: 3, name: '256GB', color: 'Bạc', price: 28990000, stock: 12 },
      { id: 4, name: '512GB', color: 'Bạc', price: 32990000, stock: 0 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/522/294104/ipad-pro-m2-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/522/294104/ipad-pro-m2-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/522/294104/ipad-pro-m2-3.jpg'
    ],
    rating: 4.6,
    reviewCount: 31
  },
  {
    id: "7",
    name: 'Xiaomi 14 Ultra',
    price: 19990000,
    originalPrice: 20990000,
    discount: 5,
    description: 'Xiaomi 14 Ultra được trang bị hệ thống camera Leica tiên tiến và màn hình AMOLED với tốc độ làm mới cao. Hiệu năng mạnh mẽ với chip Snapdragon 8 Gen 3.',
    category: 'Điện thoại',
    subcategory: 'Xiaomi',
    status: 'available',
    stock: 50,
    sold: 25,
    createdAt: '2023-12-05T10:30:00.000Z',
    updatedAt: '2024-01-20T15:15:00.000Z',
    specifications: [
      { name: 'Màn hình', value: 'AMOLED 6.73 inches, QHD+' },
      { name: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { name: 'RAM', value: '12GB' },
      { name: 'Bộ nhớ trong', value: '256GB' },
      { name: 'Camera sau', value: 'Hệ thống 4 camera Leica 50MP' },
      { name: 'Camera trước', value: '32MP' },
      { name: 'Pin', value: '5.000 mAh' },
      { name: 'Hệ điều hành', value: 'Android 14, HyperOS' }
    ],
    variants: [
      { id: 1, name: '256GB', color: 'Đen', price: 19990000, stock: 20 },
      { id: 2, name: '512GB', color: 'Đen', price: 21990000, stock: 10 },
      { id: 3, name: '256GB', color: 'Trắng', price: 19990000, stock: 15 },
      { id: 4, name: '512GB', color: 'Trắng', price: 21990000, stock: 5 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/42/315915/xiaomi-14-ultra-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/315915/xiaomi-14-ultra-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/42/315915/xiaomi-14-ultra-3.jpg'
    ],
    rating: 4.5,
    reviewCount: 18
  },
  {
    id: "8",
    name: 'Asus ROG Strix G16',
    price: 32990000,
    originalPrice: 34990000,
    discount: 6,
    description: 'Laptop gaming Asus ROG Strix G16 được trang bị CPU Intel Core i9 và GPU NVIDIA GeForce RTX 4060, mang đến hiệu suất mạnh mẽ cho việc chơi game và sáng tạo nội dung.',
    category: 'Laptop',
    subcategory: 'Asus',
    status: 'available',
    stock: 18,
    sold: 12,
    createdAt: '2023-11-15T14:20:00.000Z',
    updatedAt: '2024-02-05T17:30:00.000Z',
    specifications: [
      { name: 'Màn hình', value: '16 inches, ROG Nebula, 240Hz' },
      { name: 'CPU', value: 'Intel Core i9-14900H' },
      { name: 'RAM', value: '16GB DDR5' },
      { name: 'Bộ nhớ trong', value: '1TB SSD NVMe' },
      { name: 'Card đồ họa', value: 'NVIDIA GeForce RTX 4060 8GB' },
      { name: 'Pin', value: '90Wh' },
      { name: 'Hệ điều hành', value: 'Windows 11 Home' }
    ],
    variants: [
      { id: 1, name: 'RTX 4060/16GB/1TB', color: 'Đen', price: 32990000, stock: 10 },
      { id: 2, name: 'RTX 4070/32GB/1TB', color: 'Đen', price: 39990000, stock: 5 },
      { id: 3, name: 'RTX 4060/16GB/2TB', color: 'Đen', price: 34990000, stock: 3 },
      { id: 4, name: 'RTX 4070/32GB/2TB', color: 'Đen', price: 42990000, stock: 0 }
    ],
    images: [
      'https://cdn.tgdd.vn/Products/Images/44/319655/asus-rog-strix-g16-1.jpg',
      'https://cdn.tgdd.vn/Products/Images/44/319655/asus-rog-strix-g16-2.jpg',
      'https://cdn.tgdd.vn/Products/Images/44/319655/asus-rog-strix-g16-3.jpg'
    ],
    rating: 4.7,
    reviewCount: 14
  }
];

const ShowProduct = () => {
  // Lấy ID sản phẩm từ URL params
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Chỉ tải dữ liệu mẫu, không gọi API
  useEffect(() => {
    // Mô phỏng việc tải dữ liệu
    setTimeout(() => {
      // Tìm sản phẩm theo ID
      const foundProduct = mockProducts.find(p => p.id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
        setError(null);
      } else {
        setError(`Không tìm thấy sản phẩm với ID: ${id}`);
      }
      
      setLoading(false);
    }, 500); // Giảm thời gian tải xuống còn 500ms
  }, [id]);

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Lỗi</Alert.Heading>
        <p>{error}</p>
        <Link to="/admin/product" className="btn btn-outline-secondary">
          <FaArrowLeft className="me-2" /> Quay lại danh sách sản phẩm
        </Link>
      </Alert>
    );
  }

  // Trường hợp không tìm thấy sản phẩm
  if (!product) {
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

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Định dạng ngày tháng
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
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="img-fluid w-100"
                    style={{ 
                      height: '280px', 
                      objectFit: 'contain',
                      transition: 'all 0.3s ease',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>Không có hình ảnh</p>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="product-thumbnails d-flex overflow-auto p-2" style={{ gap: '8px', borderTop: '1px solid var(--admin_dh-border)' }}>
                  {product.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`thumbnail-wrapper ${index === activeImageIndex ? 'border border-primary' : 'border'}`}
                      onClick={() => setActiveImageIndex(index)}
                      style={{ 
                        cursor: 'pointer',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        transform: index === activeImageIndex ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: index === activeImageIndex ? '0 3px 10px rgba(0,113,227,0.2)' : 'none'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index+1}`} 
                        className="img-thumbnail" 
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover',
                          border: 'none',
                          padding: '0'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={12} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin_dh-border)' }}>
            <Card.Header className="bg-white py-3" style={{ borderBottom: '1px solid var(--admin_dh-border)' }}>
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Thông tin cơ bản</h5>
            </Card.Header>
            <Card.Body style={{ padding: '10px' }}>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h3 className="product-title" style={{ fontWeight: '700', color: 'var(--admin_dh-text)', marginBottom: '12px' }}>{product.name}</h3>
                    <div className="d-flex align-items-center mb-2">
                      <h4 className="text-primary me-2 mb-0" style={{ fontWeight: '700' }}>{formatCurrency(product.price)}</h4>
                      {product.originalPrice > product.price && (
                        <h6 className="text-muted mb-0">
                          <del>{formatCurrency(product.originalPrice)}</del>
                        </h6>
                      )}
                    </div>
                    <div className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                      <Badge 
                        bg={product.status === 'available' ? 'success' : 'danger'} 
                        className="me-2 px-3 py-2"
                        style={{ 
                          borderRadius: '6px', 
                          fontSize: '0.85rem',
                          fontWeight: '500' 
                        }}
                      >
                        {product.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                      </Badge>
                      {product.discount > 0 && (
                        <Badge 
                          bg="warning" 
                          text="dark" 
                          className="px-3 py-2"
                          style={{ 
                            borderRadius: '6px', 
                            fontSize: '0.85rem',
                            fontWeight: '500' 
                          }}
                        >
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Danh mục:</span> {product.category}</p>
                    {product.subcategory && (
                      <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Danh mục con:</span> {product.subcategory}</p>
                    )}
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Tồn kho:</span> {product.stock} sản phẩm</p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Đã bán:</span> {product.sold} sản phẩm</p>
                    {product.rating && (
                      <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Đánh giá:</span> 
                        <span className="ms-1" style={{ color: '#ff9f0a' }}>
                          {Array(Math.floor(product.rating)).fill().map((_, i) => (
                            <i key={i} className="bi bi-star-fill me-1"></i>
                          ))}
                          {product.rating % 1 > 0 && <i className="bi bi-star-half me-1"></i>}
                        </span> 
                        <span className="ms-1">({product.reviewCount} đánh giá)</span>
                      </p>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Mã sản phẩm:</span> {product.id}</p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Ngày tạo:</span> {formatDate(product.createdAt)}</p>
                    <p className="mb-1" style={{ fontSize: '0.95rem' }}><span style={{ fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Cập nhật lần cuối:</span> {formatDate(product.updatedAt)}</p>
                  </div>
                  <div className="mb-2">
                    <p className="mb-1" style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--admin_dh-text-secondary)' }}>Mô tả:</p>
                    <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.5', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>{product.description}</p>
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
              {product.specifications && product.specifications.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0" style={{ fontSize: '0.9rem', minWidth: '100%', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '65%' }} />
                    </colgroup>
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr key={index} style={{ borderBottom: index === product.specifications.length - 1 ? 'none' : '1px solid var(--admin_dh-border)' }}>
                          <td style={{ 
                            padding: '6px 8px', 
                            fontWeight: '600', 
                            color: 'var(--admin_dh-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {spec.name}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            whiteSpace: 'normal', 
                            wordBreak: 'break-word',
                            lineHeight: '1.4'
                          }}>
                            {spec.value}
                          </td>
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
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--admin_dh-text)' }}>Phiên bản</h5>
            </Card.Header>
            <Card.Body style={{ padding: '10px' }}>
              {product.variants && product.variants.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0" style={{ fontSize: '0.9rem', minWidth: '100%', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '23%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '20%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '6px 8px', fontWeight: '600', borderBottom: '2px solid var(--admin_dh-border)' }}>Tên</th>
                        <th style={{ padding: '6px 8px', fontWeight: '600', borderBottom: '2px solid var(--admin_dh-border)' }}>Màu sắc</th>
                        <th style={{ padding: '6px 8px', fontWeight: '600', borderBottom: '2px solid var(--admin_dh-border)' }}>Giá</th>
                        <th style={{ padding: '6px 8px', fontWeight: '600', borderBottom: '2px solid var(--admin_dh-border)' }}>Tồn kho</th>
                        <th style={{ padding: '6px 8px', fontWeight: '600', borderBottom: '2px solid var(--admin_dh-border)' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant, index) => (
                        <tr key={variant.id} style={{ borderBottom: index === product.variants.length - 1 ? 'none' : '1px solid var(--admin_dh-border)' }}>
                          <td style={{ 
                            padding: '6px 8px', 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {variant.name}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {variant.color}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            fontWeight: '600', 
                            color: 'var(--admin_dh-primary)', 
                            whiteSpace: 'nowrap'
                          }}>
                            {formatCurrency(variant.price)}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            textAlign: 'center'
                          }}>
                            {variant.stock}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            textAlign: 'center'
                          }}>
                            {variant.stock > 0 ? (
                              <Badge bg="success" style={{ borderRadius: '4px', padding: '3px 6px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                <FaCheck className="me-1" style={{ fontSize: '0.6rem' }} /> Còn hàng
                              </Badge>
                            ) : (
                              <Badge bg="danger" style={{ borderRadius: '4px', padding: '3px 6px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                <FaTimes className="me-1" style={{ fontSize: '0.6rem' }} /> Hết hàng
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">Không có phiên bản</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShowProduct; 