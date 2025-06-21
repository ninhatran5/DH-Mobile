import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, deleteCategory, restoreCategory, forceDeleteCategory, fetchTrashedCategories } from "../../slices/adminCategories";
import "../../assets/admin/Categories.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, trashedCategories, loading, error } = useSelector((state) => state.category);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTrashedCategories());
  }, [dispatch]);

  const getProductCount = (categoryId) => {
    return adminproducts.filter(product => product.category_id === categoryId).length;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (id) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      toast.error(`Không thể xóa danh mục này vì còn ${productCount} sản phẩm thuộc danh mục này. Vui lòng xóa hoặc chuyển các sản phẩm sang danh mục khác trước.`);
      return;
    }
    
    if (window.confirm("Bạn có chắc muốn xóa danh mục này không? Danh mục sẽ được chuyển vào thùng rác.")) {
      dispatch(deleteCategory(id)).then(() => {
        dispatch(fetchCategories());
        dispatch(fetchTrashedCategories());
      });
    }
  };

  const handleRestore = (id) => {
    if (window.confirm("Bạn có chắc muốn khôi phục danh mục này không?")) {
      dispatch(restoreCategory(id)).then(() => {
        dispatch(fetchCategories());
        dispatch(fetchTrashedCategories());
      });
    }
  };

  const handleForceDelete = (id) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      toast.error(`Không thể xóa vĩnh viễn danh mục này vì còn ${productCount} sản phẩm thuộc danh mục này. Vui lòng xóa hoặc chuyển các sản phẩm sang danh mục khác trước.`);
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa vĩnh viễn danh mục này không? Hành động này không thể hoàn tác!")) {
      dispatch(forceDeleteCategory(id)).then(() => {
        dispatch(fetchTrashedCategories());
      });
    }
  };

  const toggleTrash = () => {
    setShowTrash(!showTrash);
  };

  const filteredCategories = (showTrash ? trashedCategories : categories).filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin_dh-categories-container">
      <div className="admin_dh-categories-header">
        <h2 className="admin_dh-categories-title">
          {showTrash ? "Thùng rác danh mục" : "Danh sách danh mục"}
        </h2>
        <div className="admin_dh-toolbar">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="admin_dh-search-input"
          />
          <button
            onClick={toggleTrash}
            className="admin_dh-trash-btn"
            style={{
              padding: '8px 15px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: showTrash ? '#666' : '#ff4444',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginLeft: 'auto',
              marginRight: '16px'
            }}
          >
            {!showTrash && <i className="bi bi-trash"></i>}
            {showTrash ? "Xem danh mục" : "Thùng rác"}
          </button>
          {!showTrash && (
            <Link to="/admin/Addcategories" className="admin_dh-add-btn">
              + Thêm danh mục
            </Link>
          )}
        </div>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}
      {!loading && filteredCategories.length === 0 && (
        <p>{showTrash ? "Không có danh mục nào trong thùng rác." : "Không có danh mục nào."}</p>
      )}

      {!loading && filteredCategories.length > 0 && (
        <table className="admin_dh-categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tiêu danh mục</th>
              <th>Liên kết</th>
              <th>Số sản phẩm</th>
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
                <td>{getProductCount(cat.category_id)}</td>
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
                    {showTrash ? (
                      <>
                        <button
                          className="admin_dh-action-btn restore"
                          onClick={() => handleRestore(cat.category_id)}
                          title="Khôi phục"
                          style={{
                            backgroundColor: '#28a745',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button
                          className="admin_dh-action-btn force-delete"
                          onClick={() => handleForceDelete(cat.category_id)}
                          title="Xóa vĩnh viễn"
                          style={{
                            backgroundColor: '#dc3545',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="bi bi-trash2-fill"></i>
                        </button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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