import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCategory } from "../../slices/adminCategories";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/admin/EditCategories.css"; 

const EditCategory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector(state => state.category);
  const existingCategory = categories.find(cat => String(cat.category_id) === String(id));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name || "");
      setDescription(existingCategory.description || "");
      setImagePreview(existingCategory.image_url || null);
    }
  }, [existingCategory]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", name || "");
  formData.append("description", description || "");

  if (imageFile) {
    formData.append("image_url", imageFile);
  }

  for (let [key, value] of formData.entries()) {
  }

  try {
    await dispatch(updateCategory({ id, updatedData: formData })).unwrap();
    navigate("/admin/categories");
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    alert("Lỗi: " + JSON.stringify(error));
  }
};


  return (
    <form onSubmit={handleSubmit} className="admin-edit-categories-form">
      <h2 className="admin-edit-categories-title">Cập nhật danh mục</h2>

      <label className="admin-edit-categories-label">Tên danh mục</label>
      <input
        className="admin-edit-categories-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label className="admin-edit-categories-label">Mô tả</label>
      <textarea
        className="admin-edit-categories-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

   <label className="admin-edit-categories-label">Ảnh sản phẩm *</label>
<div className="admin-edit-categories-file-upload-container">
  <input
    type="file"
    accept="image/*"
    className="admin-edit-categories-file-input"
    onChange={handleFileChange}
    id="file-upload"
  />
  <label htmlFor="file-upload" className={`admin-edit-categories-file-upload-label ${imagePreview ? 'has-preview' : ''}`}>
    {!imagePreview ? (
      // Hiển thị icon upload khi chưa có ảnh
      <>
        <div className="admin-edit-categories-upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="admin-edit-categories-upload-text">
          <p className="admin-edit-categories-upload-main">Chọn ảnh sản phẩm</p>
          <p className="admin-edit-categories-upload-sub">JPG, PNG, GIF (tối đa 5MB)</p>
        </div>
      </>
    ) : (
      // Hiển thị ảnh preview khi đã có ảnh
      <div className="admin-edit-categories-image-preview-container">
        <img src={imagePreview} alt="Xem trước" className="admin-edit-categories-preview-image" />
        <div className="admin-edit-categories-preview-overlay">
          <div className="admin-edit-categories-preview-text">
            <p>Nhấp để thay đổi ảnh</p>
          </div>
          <button 
            type="button"
            className="admin-edit-categories-remove-image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setImageFile(null);
              setImagePreview(null);
              const fileInput = document.getElementById('file-upload');
              if (fileInput) fileInput.value = '';
            }}
            title="Xóa ảnh"
          >
            ✕
          </button>
        </div>
      </div>
    )}
  </label>
</div>


      <button type="submit" className="admin-edit-categories-button">
        Lưu thay đổi
      </button>
    </form>
  );
};

export default EditCategory;
