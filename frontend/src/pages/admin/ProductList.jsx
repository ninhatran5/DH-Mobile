import React, { useState } from 'react';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/product.css';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

 
  const products = [
    {
      id: 8,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },
    {
      id: 7,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },{
      id: 1,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },{
      id: 5,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },{
      id: 4,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },{
      id: 3,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div className="admin_dh-product-container">
      {/* Header Section */}
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>Sản phẩm</h1>
          <p className="text-muted">Quản lý danh sách sản phẩm của bạn</p>
        </div>
        <div className="admin_dh-product-actions">
          <Link 
            to="/admin/products/add" 
            className="admin_dh-btn admin_dh-btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(0, 113, 227, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <i 
              className="bi bi-plus-lg" 
              style={{ 
                color: '#ffffff', 
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            ></i>
            <span style={{ fontWeight: '500' }}>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="admin_dh-top-row">
        <div className="admin_dh-search-box">
          <i className="bi bi-search admin_dh-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin_dh-search-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="admin_dh-filters">
          <button className="admin_dh-btn admin_dh-btn-outline">
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
          <button className="admin_dh-btn admin_dh-btn-outline">
            <i className="bi bi-sort-down" style={{ color: '#5ac8fa' }}></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedProducts.length > 0 && (
        <div className="admin_dh-bulk-actions">
          <div className="admin_dh-bulk-actions-info">{selectedProducts.length} sản phẩm đã chọn</div>
          <div className="admin_dh-bulk-actions-buttons">
            <button className="admin_dh-btn admin_dh-btn-outline">
              <i className="bi bi-archive" style={{ color: '#5ac8fa' }}></i> Lưu trữ
            </button>
            <button className="admin_dh-btn admin_dh-btn-danger">
              <i className="bi bi-trash" style={{ color: '#ffffff' }}></i> Xóa
            </button>
          </div>
        </div>
      )}
      <div className="admin_dh-product-list">
        <table className="admin_dh-product-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="admin_dh-product-checkbox"
                  onChange={handleSelectAll}
                  checked={selectedProducts.length === products.length}
                />
              </th>
              <th style={{ width: '80px' }}>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th style={{ width: '120px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={selectedProducts.includes(product.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    className="admin_dh-product-checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td>
                  <div className="admin_dh-product-image" style={{ margin: '0 auto' }}>
                    <img src={product.image} alt={product.name} />
                  </div>
                </td>
                <td>
                  <div className="admin_dh-product-details">
                    <div className="admin_dh-product-name" style={{ fontWeight: '500', marginBottom: '4px' }}>{product.name}</div>
                    <div className="admin_dh-product-sku" style={{ fontSize: '0.8rem', color: 'var(--admin_dh-text-secondary)' }}>SKU: {product.id}</div>
                  </div>
                </td>
                <td className="admin_dh-product-category">{product.category}</td>
                <td className="admin_dh-product-price" style={{ fontWeight: '500', color: 'var(--admin_dh-text)' }}>{product.price}</td>
                <td className="admin_dh-product-stock">{product.stock}</td>
                <td>
                  <span className={`admin_dh-product-status ${product.status === 'Còn hàng' ? 'admin_dh-status-active' : 'admin_dh-status-inactive'}`}>
                    {product.status}
                  </span>
                </td>
                <td>{product.lastUpdated}</td>
                <td>
                  <div className="admin_dh-product-actions-col">
                    <button className="admin_dh-action-btn admin_dh-edit-btn" title="Sửa">
                      <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                    </button>
                    <Link to={`/admin/product/${product.id}`} className="admin_dh-action-btn" title="Xem chi tiết">
                      <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                    </Link>
                    <button className="admin_dh-action-btn admin_dh-delete-btn" title="Xóa">
                      <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin_dh-pagination">
        <div className="admin_dh-pagination-info">
          Hiển thị 1-10 trong tổng số 100 sản phẩm
        </div>
        <div className="admin_dh-pagination-controls">
          <button className="admin_dh-page-btn admin_dh-page-btn-disabled">
            <i className="bi bi-chevron-left" style={{ color: '#8e8e93' }}></i>
          </button>
          <button className="admin_dh-page-btn admin_dh-page-btn-active">1</button>
          <button className="admin_dh-page-btn">2</button>
          <button className="admin_dh-page-btn">3</button>
          <button className="admin_dh-page-btn">
            <i className="bi bi-chevron-right" style={{ color: '#0071e3' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList; 