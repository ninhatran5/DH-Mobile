import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/admin/AddCategory.module.css';


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
    <div className={styles.acContainer}>
      <div className={styles.acHeader}>
        <h2>Add New Category</h2>
        <button
          className={styles.acBackButton}
          onClick={() => navigate('/admin/categories')}
        >
          <i className="fas fa-arrow-left"></i> Back to Categories
        </button>
      </div>

      <form className={styles.acForm} onSubmit={handleSubmit}>
        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Name</label>
          <input
            type="text"
            className={styles.acInput}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Description</label>
          <textarea
            className={styles.acTextarea}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Image</label>
          <div className={styles.acImageUpload}>
            <input
              type="file"
              className={styles.acInput}
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {preview && (
              <div className={styles.acPreview}>
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Parent Category</label>
          <select
            className={styles.acSelect}
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

        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Display Order</label>
          <input
            type="number"
            className={styles.acInput}
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleInputChange}
            min="0"
          />
        </div>

        <div className={styles.acFormGroup}>
          <label className={styles.acLabel}>Status</label>
          <select
            className={styles.acSelect}
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className={styles.acSubmitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner ac-spinner"></i> Adding...
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i> Add Category
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCategory; 