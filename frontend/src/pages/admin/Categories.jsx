import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories,deleteCategory,addCategory } from "../../slices/adminCategories";
import "../../assets/admin/Categories.css";
import { Link } from "react-router-dom";
const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (id) => {
  if (window.confirm("Bạn có chắc muốn xóa danh mục này không?")) {
    dispatch(deleteCategory(id));
  }
};


  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin_dh-categories-container">
      <div className="admin_dh-categories-header">
        <h2 className="admin_dh-categories-title">Danh sách danh mục</h2>
        <div className="admin_dh-toolbar">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="admin_dh-search-input"
          />
          <Link to="/admin/Addcategories" className="admin_dh-add-btn">
  + Thêm danh mục
</Link>

        </div>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}
      {!loading && filteredCategories.length === 0 && <p>Không có danh mục nào.</p>}

      {!loading && filteredCategories.length > 0 && (
        <table className="admin_dh-categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tiêu danh mục </th>
              <th>Liên kết</th>
             
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat, index) => (
              <tr key={cat.category_id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="admin_dh-category-img"
                  />
                </td>
                <td>
                  <div className="admin_dh-category-title">{cat.name}</div>
                </td>
                <td>{cat.description || "Không có"}</td>
                
                <td>{new Date(cat.created_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }) || "22/05/2025 10:00:00"}</td>
                <td>{new Date(cat.updated_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }) || "22/05/2025 10:00:00"}</td>
               <td>
  <div style={{ display: "flex", gap: "8px" }}>
    <Link to={`/admin/EditCategories/${cat.category_id}`} className="admin_dh-action-btn edit" title="Chỉnh sửa">
  <i className="bi bi-pencil-fill"></i>
</Link>
    <button
      className="admin_dh-action-btn delete"
      onClick={() => handleDelete(cat.category_id)}
      title="Xóa"
    >
      <i className="bi bi-trash-fill"></i>
    </button>
  </div>
</td>



              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryList;