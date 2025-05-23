import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory } from "../../slices/adminCategories";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [is_active, setIsActive] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

 
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("is_active", is_active);
  if (imageFile) {
    formData.append("image_url", imageFile);
  }

  
  const token = localStorage.getItem("adminToken");

  console.log("Token:", token);
  
  const formDataEntries = {};
  formData.forEach((value, key) => {
    formDataEntries[key] = value;
  });
  console.log("FormData entries to submit:", formDataEntries);

  await dispatch(addCategory(formData));
  navigate("/admin/categories");
};

  return (
    <div className="admin-form-container">
      <h2>Thêm danh mục mới</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Tên danh mục</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Hình ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={is_active}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Hoạt động
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Thêm danh mục
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
