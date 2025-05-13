import React, { useState } from 'react';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/product.css';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

 
  const products = [
    {
      id: 1,
      name: "MacBook Pro 14-inch",
      image: "https://example.com/macbook-pro.jpg",
      price: "45,990,000₫",
      category: "Laptop",
      stock: 15,
      status: "Còn hàng",
      lastUpdated: "2024-02-20"
    },
    {
      id: 1,
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
      id: 1,
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
      id: 1,
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
    <div className="product-list-container">
      {/* Header Section */}
      <div className="product-header">
        <div className="header-title">
          <h1>Sản phẩm</h1>
          <p className="text-muted">Quản lý danh sách sản phẩm của bạn</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/products/add" className="btn btn-primary">
            <i className="bi bi-plus-lg"></i> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn-light">
            <i className="bi bi-funnel"></i> Bộ lọc
          </button>
          <button className="btn btn-light">
            <i className="bi bi-sort-down"></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Selected Actions */}
      {selectedProducts.length > 0 && (
        <div className="selected-actions">
          <span>{selectedProducts.length} sản phẩm đã chọn</span>
          <div className="action-buttons">
            <button className="btn btn-light">
              <i className="bi bi-archive"></i> Lưu trữ
            </button>
            <button className="btn btn-danger">
              <i className="bi bi-trash"></i> Xóa
            </button>
          </div>
        </div>
      )}
      <div className="products-table">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedProducts.length === products.length}
                />
              </th>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={selectedProducts.includes(product.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>
                <td>
                  <div className="product-info">
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-details">
                      <h6>{product.name}</h6>
                      <small className="text-muted">SKU: {product.id}</small>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.status === 'Còn hàng' ? 'in-stock' : 'out-of-stock'}`}>
                    {product.status}
                  </span>
                </td>
                <td>{product.lastUpdated}</td>
                <td>
                  <div className="action-dropdown">
                    <button className="btn btn-light btn-sm" data-bs-toggle="dropdown">
                      <i className="bi bi-three-dots"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#"><i className="bi bi-pencil"></i> Sửa</a></li>
                      <li><a className="dropdown-item" href="#"><i className="bi bi-eye"></i> Xem</a></li>
                      <li><a className="dropdown-item" href="#"><i className="bi bi-archive"></i> Lưu trữ</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash"></i> Xóa</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-section">
        <div className="pagination-info">
          Hiển thị 1-10 trong tổng số 100 sản phẩm
        </div>
        <nav>
          <ul className="pagination">
            <li className="page-item disabled">
              <a className="page-link" href="#"><i className="bi bi-chevron-left"></i></a>
            </li>
            <li className="page-item active"><a className="page-link" href="#">1</a></li>
            <li className="page-item"><a className="page-link" href="#">2</a></li>
            <li className="page-item"><a className="page-link" href="#">3</a></li>
            <li className="page-item">
              <a className="page-link" href="#"><i className="bi bi-chevron-right"></i></a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProductList; 