import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaFilter, FaSort } from 'react-icons/fa';
import '../../assets/admin/Categories.css';
import '../../assets/admin/HomeAdmin.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    parentId: '',
    displayOrder: 1,
    status: 'SHOW'
  });
  const [editingId, setEditingId] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: [],
    hasParent: null,
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'displayOrder',
    direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const mockCategories = [
      {
        id: 1,
        name: 'Phụ kiện',
        description: 'Các loại phụ kiện điện thoại',
        image: 'accessories.jpg',
        parentId: null,
        displayOrder: 1,
        status: 'SHOW'
      },
      {
        id: 2,
        name: 'Ốp lưng',
        description: 'Ốp lưng điện thoại các loại',
        image: 'cases.jpg',
        parentId: 1,
        displayOrder: 2,
        status: 'SHOW'
      },
      {
        id: 3,
        name: 'Ốp lưng',
        description: 'Ốp lưng điện thoại các loại',
        image: 'cases.jpg',
        parentId: 1,
        displayOrder: 2,
        status: 'SHOW'
      },
      {
        id: 4,
        name: 'Ốp lưng',
        description: 'Ốp lưng điện thoại các loại',
        image: 'cases.jpg',
        parentId: 1,
        displayOrder: 2,
        status: 'SHOW'
      }
    ];
    setCategories(mockCategories);
    setParentCategories(mockCategories.filter(cat => !cat.parentId));
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  
  const filteredCategories = categories.filter(category => {
   
    if (filters.status.length > 0 && !filters.status.includes(category.status)) {
      return false;
    }

    
    if (filters.hasParent !== null) {
      if (filters.hasParent && !category.parentId) return false;
      if (!filters.hasParent && category.parentId) return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        category.name.toLowerCase().includes(searchLower) ||
        category.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  }).sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.field) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'displayOrder':
        return direction * (a.displayOrder - b.displayOrder);
      default:
        return 0;
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
      displayOrder: category.displayOrder,
      status: category.status,
      image: null
    });
    setImagePreview(category.image);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        
        setCategories(categories.filter(cat => cat.id !== id));
        showToast('Xóa danh mục thành công', 'success');
      } catch (error) {
        showToast('Có lỗi xảy ra khi xóa danh mục', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing category
        const updatedCategories = categories.map(cat =>
          cat.id === editingId ? { ...cat, ...formData } : cat
        );
        setCategories(updatedCategories);
        showToast('Cập nhật danh mục thành công', 'success');
      } else {
        const newCategory = {
          id: Math.max(...categories.map(c => c.id)) + 1,
          ...formData,
        };
        setCategories([...categories, newCategory]);
        showToast('Thêm danh mục thành công', 'success');
      }
      handleCloseModal();
    } catch (error) {
      showToast('Có lỗi xảy ra khi lưu danh mục', 'error');
    }
  };

  const handleCloseModal = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      parentId: '',
      displayOrder: 1,
      status: 'SHOW'
    });
    setImagePreview(null);
    setEditingId(null);
    setShowModal(false);
  };

  const showToast = (message, type) => {
    alert(message);
  };

  return (
    <div className="admin_dh-product-container">
      {/* Header Section */}
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>Quản lý danh mục</h1>
          <p className="text-muted">Quản lý các danh mục sản phẩm của cửa hàng</p>
        </div>
        <div className="admin_dh-product-actions">
          <button className="admin_dh-btn admin_dh-btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg" style={{ color: '#ffffff' }}></i> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="admin_dh-top-row">
        <div className="admin_dh-search-box">
          <i className="bi bi-search admin_dh-search-icon" style={{ color: '#0071e3' }}></i>
          <input
            type="text"
            className="admin_dh-search-input"
            placeholder="Tìm kiếm danh mục..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="admin_dh-filters">
          <button 
            className="admin_dh-btn admin_dh-btn-outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel" style={{ color: '#5ac8fa' }}></i> Bộ lọc
          </button>
          <button className="admin_dh-btn admin_dh-btn-outline" onClick={() => handleSort('displayOrder')}>
            <i className="bi bi-sort-down" style={{ color: '#5ac8fa' }}></i> Sắp xếp
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="admin_dh-filter-panel">
          <div className="admin_dh-filter-row">
            <div className="admin_dh-filter-column">
              <div className="admin_dh-filter-group">
                <label className="admin_dh-filter-label">Trạng thái</label>
                <div className="admin_dh-check-item">
                  <input
                    type="checkbox"
                    className="admin_dh-checkbox"
                    id="statusShow"
                    checked={filters.status.includes('SHOW')}
                    onChange={() => handleStatusFilterChange('SHOW')}
                  />
                  <label className="admin_dh-check-label" htmlFor="statusShow">
                    Hiển thị
                  </label>
                </div>
                <div className="admin_dh-check-item">
                  <input
                    type="checkbox"
                    className="admin_dh-checkbox"
                    id="statusHide"
                    checked={filters.status.includes('HIDE')}
                    onChange={() => handleStatusFilterChange('HIDE')}
                  />
                  <label className="admin_dh-check-label" htmlFor="statusHide">
                    Ẩn
                  </label>
                </div>
              </div>
            </div>
            <div className="admin_dh-filter-column">
              <div className="admin_dh-filter-group">
                <label className="admin_dh-filter-label">Danh mục </label>
                <div className="admin_dh-check-item">
                  <input
                    type="radio"
                    className="admin_dh-radio"
                    name="parentFilter"
                    id="parentAll"
                    checked={filters.hasParent === null}
                    onChange={() => handleFilterChange('hasParent', null)}
                  />
                  <label className="admin_dh-check-label" htmlFor="parentAll">
                    Tất cả
                  </label>
                </div>
                <div className="admin_dh-check-item">
                  <input
                    type="radio"
                    className="admin_dh-radio"
                    name="parentFilter"
                    id="hasParent"
                    checked={filters.hasParent === true}
                    onChange={() => handleFilterChange('hasParent', true)}
                  />
                  <label className="admin_dh-check-label" htmlFor="hasParent">
                    Có danh mục 
                  </label>
                </div>
                <div className="admin_dh-check-item">
                  <input
                    type="radio"
                    className="admin_dh-radio"
                    name="parentFilter"
                    id="noParent"
                    checked={filters.hasParent === false}
                    onChange={() => handleFilterChange('hasParent', false)}
                  />
                  <label className="admin_dh-check-label" htmlFor="noParent">
                    Không có danh mục
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin_dh-product-list">
        <table className="admin_dh-product-table">
          <thead>
            <tr>
              <th>STT</th>
              
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category, index) => (
              <tr key={category.id}>
                <td className="text-center">{category.displayOrder}</td>
                
                <td>
                  <div className="admin_dh-product-name">{category.name}</div>
                </td>
                <td className="admin_dh-product-description">{category.description}</td>
                <td className="admin_dh-product-category">
                  {categories.find(cat => cat.id === category.parentId)?.name || 
                    <span className="admin_dh-text-muted">-</span>}
                </td>
                <td>
                  <span className={`admin_dh-product-status ${category.status === 'SHOW' ? 'admin_dh-status-active' : 'admin_dh-status-inactive'}`}>
                    {category.status === 'SHOW' ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="admin_dh-product-actions-col">
                    <button
                      className="admin_dh-action-btn admin_dh-edit-btn"
                      onClick={() => handleEdit(category)}
                      title="Sửa danh mục"
                    >
                      <i className="bi bi-pencil" style={{ color: '#0071e3' }}></i>
                    </button>
                    <button
                      className="admin_dh-action-btn admin_dh-delete-btn"
                      onClick={() => handleDelete(category.id)}
                      title="Xóa danh mục"
                    >
                      <i className="bi bi-trash" style={{ color: '#ff3b30' }}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin_dh-modal-backdrop" onClick={handleCloseModal}>
          <div className="admin_dh-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin_dh-modal-header">
              <h5 className="admin_dh-modal-title">
                {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h5>
              <button type="button" className="admin_dh-modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="admin_dh-modal-body">
              <form onSubmit={handleSubmit} className="admin_dh-form">
                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Tên danh mục *</label>
                  <input
                    type="text"
                    className="admin_dh-form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Mô tả</label>
                  <textarea
                    className="admin_dh-form-control admin_dh-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                
                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Hình ảnh</label>
                  <div className="admin_dh-image-upload">
                    {imagePreview && (
                      <div className="admin_dh-image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <div className="admin_dh-upload-controls">
                      <label className="admin_dh-upload-label">
                        <i className="bi bi-upload" style={{ color: '#0071e3' }}></i>
                        <span>Chọn hình ảnh</span>
                        <input
                          type="file"
                          className="admin_dh-file-input"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Danh mục cha</label>
                  <select
                    className="admin_dh-form-control admin_dh-select"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                  >
                    <option value="">Không có</option>
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Thứ tự hiển thị *</label>
                  <input
                    type="number"
                    className="admin_dh-form-control"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="admin_dh-form-group">
                  <label className="admin_dh-form-label">Trạng thái *</label>
                  <select
                    className="admin_dh-form-control admin_dh-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="SHOW">Hiển thị</option>
                    <option value="HIDE">Ẩn</option>
                  </select>
                </div>

                <div className="admin_dh-modal-footer">
                  <button type="button" className="admin_dh-btn admin_dh-btn-outline" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="admin_dh-btn admin_dh-btn-primary">
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 