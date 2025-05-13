import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

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
      const response = await axios.get('/api/categories');
      setParentCategories(response.data);
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

      await axios.post('/api/categories', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
    <div className="categories-container">
      <div className="categories-header">
        <h2>Add New Category</h2>
        <div className="header-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin/categories')}
          >
            <i className="fas fa-arrow-left"></i> Back to Categories
          </button>
        </div>
      </div>

      <div className="add-category-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                className="form-control"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Parent Category</label>
            <select
              className="form-control"
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

          <div className="form-group mb-4">
            <label className="form-label">Display Order</label>
            <input
              type="number"
              className="form-control"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory; 