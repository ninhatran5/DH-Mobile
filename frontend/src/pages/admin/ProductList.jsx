import React, { useState, useEffect } from 'react';
import '../../assets/admin/HomeAdmin.css';
import '../../assets/admin/product.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, deleteAdminProduct } from '../../slices/adminproductsSlice';

const ProductList = () => {
  const dispatch = useDispatch();
  const { adminproducts, loading, error } = useSelector((state) => state.adminproduct);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(adminproducts.map(product => product.product_id));
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

  const handleDeleteSelected = () => {
    if(window.confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`)) {
      selectedProducts.forEach((productId) => {
        dispatch(deleteAdminProduct(productId));
      });
      setSelectedProducts([]);
    }
  };

  const handleDeleteSingle = (productId) => {
    if(window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      dispatch(deleteAdminProduct(productId));
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // Bảo vệ adminproducts, tránh lỗi khi dữ liệu chưa về hoặc không đúng kiểu
  const filteredProducts = Array.isArray(adminproducts)
    ? adminproducts.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="admin_dh-product-container">
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>Sản phẩm</h1>
          <p className="text-muted">Quản lý danh sách sản phẩm của bạn</p>
        </div>
        <div className="admin_dh-product-actions">
          <Link 
            to="/admin/addproduct" 
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
            <i className="bi bi-plus-lg" style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 'bold' }}></i>
            <span style={{ fontWeight: '500' }}>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

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

      {selectedProducts.length > 0 && (
        <div className="admin_dh-bulk-actions">
          <div className="admin_dh-bulk-actions-info">{selectedProducts.length} sản phẩm đã chọn</div>
          <div className="admin_dh-bulk-actions-buttons">
            <button 
              className="admin_dh-btn admin_dh-btn-danger"
              onClick={handleDeleteSelected}
            >
              <i className="bi bi-trash" style={{ color: '#ffffff' }}></i> Xóa
            </button>
          </div>
        </div>
      )}

      <div className="admin_dh-product-list">
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div>Không có sản phẩm phù hợp</div>
        ) : (
          <table className="admin_dh-product-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="admin_dh-product-checkbox"
                    onChange={handleSelectAll}
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length ? "true" : undefined}
                  />
                </th>
                <th style={{ width: '80px' }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá KM</th>
                <th>Giá gốc</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th style={{ width: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className={selectedProducts.includes(product.product_id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="admin_dh-product-checkbox"
                      checked={selectedProducts.includes(product.product_id)}
                      onChange={() => handleSelectProduct(product.product_id)}
                    />
                  </td>
                  <td>
                    <div className="admin_dh-product-image" style={{ margin: '0 auto' }}>
                      <img 
                        src={product.image_url || '/default-image.png'} 
                        alt={product.name || 'No Name'} 
                        onError={(e) => { e.target.src = '/default-image.png'; }} 
                      />
                    </div>
                  </td>
                  <td>
                    <div className="admin_dh-product-details">
                      <div className="admin_dh-product-name" style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {product.name || 'Không tên'}
                      </div>
                      <div className="admin_dh-product-sku" style={{ fontSize: '0.8rem', color: 'var(--admin_dh-text-secondary)' }}>
                        ID sản phẩm : {product.product_id || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="admin_dh-product-category">{product.category?.name || 'Không có danh mục'}</td>
                  <td className="admin_dh-product-price" style={{ fontWeight: '500', color: 'var(--admin_dh-text)' }}>
                    {product.price ? `${product.price} USD` : 'Chưa cập nhật'}
                  </td>
                  <td className="admin_dh-product-price" style={{ fontWeight: '500', color: 'var(--admin_dh-text)' }}>
                    {product.price_original ? `${product.price_original} USD` : 'Chưa cập nhật'}
                  </td>
                  <td>
                    <span className={`admin_dh-product-status ${product.status === 0 ? 'admin_dh-status-inactive' : 'admin_dh-status-active'}`}>
                      {product.status === 0 ? 'Ẩn' : 'Hiển thị'}
                    </span>
                  </td>
                  <td>{product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="admin_dh-product-actions-col">
                      <Link 
                        to={`/admin/EditProduct/${product.product_id}`} 
                        className="admin_dh-action-btn admin_dh-edit-btn" 
                        title="Sửa"
                      >
                        <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                      </Link>
                      <Link 
                        to={`/admin/product/${product.product_id}`} 
                        className="admin_dh-action-btn" 
                        title="Xem chi tiết"
                      >
                        <i className="bi bi-eye" style={{ color: '#5ac8fa' }}></i>
                      </Link>
                      <button 
                        className="admin_dh-action-btn admin_dh-delete-btn" 
                        title="Xóa"
                        onClick={() => handleDeleteSingle(product.product_id)}
                      >
                        <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin_dh-pagination">
        <div className="admin_dh-pagination-info">
          Hiển thị {filteredProducts.length} sản phẩm
        </div>
      </div>
    </div>
  );
};

export default ProductList;
