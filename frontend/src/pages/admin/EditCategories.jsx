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

      <label className="admin-edit-categories-label">Hình ảnh</label>
      <input
        type="file"
        accept="image/*"
        className="admin-edit-categories-input"
        onChange={handleFileChange}
      />

      {imagePreview && (
        <div className="admin-edit-categories-image-preview">
          <img src={imagePreview} alt="Xem trước" />
        </div>
      )}

      <button type="submit" className="admin-edit-categories-button">
        Lưu thay đổi
      </button>
    </form>
  );
};

export default EditCategory;
