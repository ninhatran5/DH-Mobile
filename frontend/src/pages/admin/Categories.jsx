import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaFilter, FaSort } from 'react-icons/fa';
import '../../assets/admin/Categories.css';

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
    <div className="categories-container">
      <div className="categories-header">
        <h1>Quản lý danh mục</h1>
        <div className="header-actions">
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            Bộ lọc
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="filter-group">
                <label className="filter-label">Trạng thái</label>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="statusShow"
                    checked={filters.status.includes('SHOW')}
                    onChange={() => handleStatusFilterChange('SHOW')}
                  />
                  <label className="form-check-label" htmlFor="statusShow">
                    Hiển thị
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="statusHide"
                    checked={filters.status.includes('HIDE')}
                    onChange={() => handleStatusFilterChange('HIDE')}
                  />
                  <label className="form-check-label" htmlFor="statusHide">
                    Ẩn
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="filter-group">
                <label className="filter-label">Danh mục </label>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="parentFilter"
                    id="parentAll"
                    checked={filters.hasParent === null}
                    onChange={() => handleFilterChange('hasParent', null)}
                  />
                  <label className="form-check-label" htmlFor="parentAll">
                    Tất cả
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="parentFilter"
                    id="hasParent"
                    checked={filters.hasParent === true}
                    onChange={() => handleFilterChange('hasParent', true)}
                  />
                  <label className="form-check-label" htmlFor="hasParent">
                    Có danh mục 
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="parentFilter"
                    id="noParent"
                    checked={filters.hasParent === false}
                    onChange={() => handleFilterChange('hasParent', false)}
                  />
                  <label className="form-check-label" htmlFor="noParent">
                    Không có danh mục
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="filter-group">
                <label className="filter-label">Tìm kiếm</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên hoặc mô tả..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Tên danh mục
                {sortConfig.field === 'name' && (
                  <FaSort className={`ms-2 ${sortConfig.direction === 'asc' ? 'asc' : 'desc'}`} />
                )}
              </th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th onClick={() => handleSort('displayOrder')} style={{ cursor: 'pointer' }}>
                Thứ tự
                {sortConfig.field === 'displayOrder' && (
                  <FaSort className={`ms-2 ${sortConfig.direction === 'asc' ? 'asc' : 'desc'}`} />
                )}
              </th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => (
              <tr key={category.id}>
                <td>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />
                </td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  {categories.find(cat => cat.id === category.parentId)?.name || '-'}
                </td>
                <td>{category.displayOrder}</td>
                <td>
                  <span className={`status-badge ${category.status === 'SHOW' ? 'status-active' : 'status-inactive'}`}>
                    {category.status === 'SHOW' ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(category)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash />
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
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tên danh mục *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hình ảnh</label>
                  <div className="image-upload-container">
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <div className="upload-button">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Danh mục cha</label>
                  <select
                    className="form-select"
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

                <div className="mb-3">
                  <label className="form-label">Thứ tự hiển thị *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Trạng thái *</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="SHOW">Hiển thị</option>
                    <option value="HIDE">Ẩn</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
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