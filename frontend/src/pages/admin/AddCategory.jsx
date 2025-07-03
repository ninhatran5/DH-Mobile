import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory } from "../../slices/adminCategories";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/admin/AddCategories.css";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [is_active, setIsActive] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleBack = () => {
    navigate("/admin/categories");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    if (!name.trim() || !description.trim() || !imageFile) {
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_active", is_active);
    if (imageFile) {
      formData.append("image_url", imageFile);
    }
    try {
      await dispatch(addCategory(formData)).unwrap();
      toast.success("Thêm danh mục thành công!");
      navigate("/admin/categories");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm danh mục!");
    }
  };

  return (
    <div className="addcategories-container">
      <button
        type="button"
        onClick={handleBack}
        style={{
          marginBottom: "16px",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          background: "#eee",
          color: "#333",
          cursor: "pointer"
        }}
      >
        ← Quay lại
      </button>
      <h2 className="addcategories-title">Thêm danh mục mới</h2>
      <form onSubmit={handleSubmit} className="addcategories-form">
        <div className="addcategories-group">
          <label>
            Tên danh mục
            {showValidation && !name.trim() && <span className="required">*</span>}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục"
          />
          {showValidation && !name.trim() && (
            <span className="validation-message">Tên danh mục là bắt buộc</span>
          )}
        </div>

        <div className="addcategories-group">
          <label>
            Mô tả
            {showValidation && !description.trim() && <span className="required">*</span>}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả danh mục"
          ></textarea>
          {showValidation && !description.trim() && (
            <span className="validation-message">Mô tả là bắt buộc</span>
          )}
        </div>

        <div className="addcategories-group">
          <label>
            Hình ảnh
            {showValidation && !imageFile && <span className="required">*</span>}
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          {showValidation && !imageFile && (
            <span className="validation-message">Hình ảnh là bắt buộc</span>
          )}
        </div>

        {imageFile && (
          <div className="addcategories-image-preview">
            <img src={URL.createObjectURL(imageFile)} alt="Preview" />
          </div>
        )}

        <div className="addcategories-group">
          <label>
            <input
              type="checkbox"
              checked={is_active}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Hoạt động
          </label>
        </div>

        <button type="submit" className="addcategories-submit-btn">
          Thêm danh mục
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
