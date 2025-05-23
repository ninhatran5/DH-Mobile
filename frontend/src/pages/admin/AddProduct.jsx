// src/pages/admin/AddCategory.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory } from "../../slices/adminCategories";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image_url, setImageUrl] = useState("");
  const [is_active, setIsActive] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCategory = {
      name,
      description,
      image_url,
      is_active,
    };
    await dispatch(addCategory(newCategory));
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
          <label>Hình ảnh (URL)</label>
          <input
            type="text"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
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
