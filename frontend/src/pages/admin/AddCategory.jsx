import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/admin/AddCategory.module.css';


const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    parentCategory: '',
    displayOrder: 0,
    status: 'active'
  });
  const [preview, setPreview] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch parent categories when component mounts
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setParentCategories(data);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

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
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      await fetch('/api/categories', {
        method: 'POST',
        body: formDataToSend
      });

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error adding category:', error);
      // Handle error (show notification, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin_dh-category-container">
      <div className="admin_dh-category-header">
        <h2 className="admin_dh-category-title">Add New Category</h2>
        <button
          className="admin_dh-btn admin_dh-btn-secondary"
          onClick={() => navigate('/admin/categories')}
        >
          <i className="bi bi-arrow-left"></i> Back to Categories
        </button>
      </div>

      <form className="admin_dh-category-form" onSubmit={handleSubmit}>
        <div className="admin_dh-form-group">
          <label className="admin_dh-form-label admin_dh-required-label">Name</label>
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
          <label className="admin_dh-form-label">Description</label>
          <textarea
            className="admin_dh-form-control"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        

        <div className="admin_dh-form-group">
          <label className="admin_dh-form-label">Parent Category</label>
          <select
            className="admin_dh-form-control admin_dh-form-select"
            name="parentCategory"
            value={formData.parentCategory}
            onChange={handleInputChange}
          >
            <option value="">None</option>
            {parentCategories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin_dh-form-group">
          <label className="admin_dh-form-label">Display Order</label>
          <input
            type="number"
            className="admin_dh-form-control"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleInputChange}
            min="0"
          />
        </div>

        <div className="admin_dh-form-group">
          <label className="admin_dh-form-label">Status</label>
          <select
            className="admin_dh-form-control admin_dh-form-select"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin_dh-btn-container">
          <button
            type="submit"
            className="admin_dh-btn admin_dh-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-repeat"></i> Adding...
              </>
            ) : (
              <>
                <i className="bi bi-plus"></i> Add Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory; 