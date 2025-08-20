import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory } from "../../slices/adminCategories";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/admin/AddCategories.css";
import Loading from "../../components/Loading";
const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [is_active, setIsActive] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
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
    
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addcategories-container">
      {loading && <Loading />}
      <button
        type="button"
        onClick={handleBack}
        style={{
          marginBottom: "16px",
          padding: "7px 20px",
          borderRadius: "10px",
          border: "none",
          background: "#eee",
          color: "white",
          cursor: "pointer",
          backgroundColor: "#007aff",
        }}
      >
        ← Quay lại
      </button>
      <h2 className="addcategories-title" style={{fontWeight: "900"}}>Thêm danh mục mới</h2>
      <form onSubmit={handleSubmit} className="addcategories-form">
        <div className="addcategories-group">
          <label>
            Tên danh mục
            <span className="required1">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục"
            className={showValidation && !name.trim() ? "error" : ""}
          />
          {showValidation && !name.trim() && (
            <span className="validation-message">Tên danh mục là bắt buộc</span>
          )}
        </div>

        <div className="addcategories-group">
          <label>
            Mô tả
            <span className="required1">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả danh mục"
            className={showValidation && !description.trim() ? "error" : ""}
          ></textarea>
          {showValidation && !description.trim() && (
            <span className="validation-message">Mô tả là bắt buộc</span>
          )}
        </div>

        <div className="addcategories-group">
          <label>
            Hình ảnh
            <span className="required1">*</span>
          </label>

          <div
            className={`image-upload-container ${
              showValidation && !imageFile ? "error" : ""
            }`}
          >
            <label className="custom-file-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className="upload-button">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 8L12 3L7 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Chọn hình ảnh</span>
              </div>
            </label>

            {imagePreview && (
              <div className="image-preview-single">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  ×
                </button>
              </div>
            )}

            <p className="upload-hint">
              Chọn hình ảnh cho danh mục (JPG, PNG, GIF)
            </p>
          </div>

          {showValidation && !imageFile && (
            <span className="validation-message">Hình ảnh là bắt buộc</span>
          )}
        </div>

        <button 
          type="submit" 
          className="addcategories-submit-btn"
          disabled={loading}
        >
          {loading ? "Đang thêm..." : "Thêm danh mục"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
