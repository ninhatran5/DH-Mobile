import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrashedCategories, restoreCategory, forceDeleteCategory } from "../slices/adminCategories";
import { fetchAdminProducts } from "../slices/adminproductsSlice";
import "../assets/admin/Categories.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import { FaBars, FaTimes, FaUndo, FaTrashAlt, FaArrowLeft, FaSearch } from "react-icons/fa";

const TrashCategories = () => {
  const dispatch = useDispatch();
  const { trashedCategories, loading, error } = useSelector((state) => state.category);
  const { adminproducts } = useSelector((state) => state.adminproduct);
  const [searchTerm, setSearchTerm] = useState("");
  const [productCounts, setProductCounts] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTrashedCategories());
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    const counts = {};
    adminproducts.forEach(product => {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    });
    setProductCounts(counts);
  }, [adminproducts]);

  // ========== HELPER FUNCTIONS ==========
  const getProductCount = (categoryId) => {
    return productCounts[categoryId] || 0;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "22/05/2025 10:00:00";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // ========== TRASH FUNCTIONS ==========
  const handleRestore = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn khôi phục danh mục này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      reverseButtons: true
    });
    if (result.isConfirmed) {
      setIsProcessing(true);
      dispatch(restoreCategory(id)).then(() => {
        dispatch(fetchTrashedCategories());
        Swal.fire({
          icon: "success",
          title: "Khôi phục danh mục thành công!",
          showConfirmButton: false,
          timer: 1500
        });
      }).finally(() => setIsProcessing(false));
    }
  };

  const handleForceDelete = async (id) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      toast.error(`Không thể xóa vĩnh viễn danh mục này vì còn ${productCount} sản phẩm thuộc danh mục này. Vui lòng xóa hoặc chuyển các sản phẩm sang danh mục khác trước.`);
      return;
    }
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa vĩnh viễn danh mục này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
      reverseButtons: true
    });
    if (result.isConfirmed) {
      setIsProcessing(true);
      dispatch(forceDeleteCategory(id)).then(() => {
        dispatch(fetchTrashedCategories());
        Swal.fire({
          icon: "success",
          title: "Xóa vĩnh viễn danh mục thành công!",
          showConfirmButton: false,
          timer: 1500
        });
      }).finally(() => setIsProcessing(false));
    }
  };

  // ========== DATA FILTERING ==========
  const filteredCategories = trashedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== RENDER ACTIONS ==========
  const renderActions = (cat) => (
    <>
      <button
        className="admin_dh-action-btn restore"
        onClick={() => handleRestore(cat.category_id)}
        title="Khôi phục"
      >
        <FaUndo />
      </button>
      <button
        className="admin_dh-action-btn force-delete"
        onClick={() => handleForceDelete(cat.category_id)}
        title="Xóa vĩnh viễn"
      >
        <FaTrashAlt />
      </button>
    </>
  );

  // ========== RENDER HEADER ==========
  const renderHeader = () => (
    <div className="admin_dh-categories-header">
      <div className="admin_dh-header-content">
        <h2 className="admin_dh-categories-title">Thùng rác danh mục</h2>
        
        {/* Desktop Toolbar */}
        <div className="admin_dh-toolbar-desktop">
          <div className="admin_dh-search-wrapper">
            <FaSearch className="admin_dh-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="admin_dh-search-input"
            />
          </div>
          <Link to="/admin/categories" className="admin_dh-back-btn">
            <FaArrowLeft />
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        {/* Mobile Toolbar Toggle */}
        <div className="admin_dh-mobile-toolbar-toggle">
          <button 
            className="mobile-toolbar-btn"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? <FaTimes /> : <FaBars />}
            <span>Công cụ</span>
          </button>
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className={`admin_dh-toolbar-mobile ${showMobileFilters ? 'show' : ''}`}>
        <div className="admin_dh-search-wrapper-mobile">
          <FaSearch className="admin_dh-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="admin_dh-search-input"
          />
        </div>
        <div className="admin_dh-mobile-actions">
          <Link to="/admin/categories" className="admin_dh-back-btn-mobile">
            <FaArrowLeft />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>
    </div>
  );

  // ========== RENDER TABLE ==========
  const renderDesktopTable = () => (
    <div className="admin_dh-table-wrapper desktop-table">
      <table className="admin_dh-categories-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
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
              <td className="admin_dh-text-center">{getProductCount(cat.category_id)}</td>
              <td>{formatDate(cat.created_at)}</td>
              <td>{formatDate(cat.updated_at)}</td>
              <td>
                <div className="admin_dh-actions">
                  {renderActions(cat)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMobileCards = () => (
    <div className="admin_dh-mobile-cards">
      {filteredCategories.map((cat, index) => (
        <div key={cat.category_id} className="admin_dh-mobile-card">
          <div className="mobile-card-header">
            <img
              src={cat.image_url}
              alt={cat.name}
              className="mobile-category-image"
            />
            <div className="mobile-category-info">
              <h3>{cat.name}</h3>
              <p>{cat.description || "Không có mô tả"}</p>
            </div>
            <div className="mobile-actions">
              {renderActions(cat)}
            </div>
          </div>
          
          <div className="mobile-card-content">
            <div className="mobile-info-row">
              <span className="mobile-label">STT:</span>
              <span className="mobile-value">{index + 1}</span>
            </div>
            
            <div className="mobile-info-row">
              <span className="mobile-label">Số sản phẩm:</span>
              <span className="mobile-value">{getProductCount(cat.category_id)}</span>
            </div>
            
            <div className="mobile-info-row">
              <span className="mobile-label">Ngày tạo:</span>
              <span className="mobile-value">{formatDate(cat.created_at)}</span>
            </div>
            
            <div className="mobile-info-row">
              <span className="mobile-label">Ngày cập nhật:</span>
              <span className="mobile-value">{formatDate(cat.updated_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin_dh-categories-container">
      {isProcessing && <Loading />}
      
      {renderHeader()}

      {loading && <div className="admin_dh-loading">Đang tải dữ liệu...</div>}
      {error && <div className="admin_dh-error">Lỗi: {error}</div>}
      {!loading && filteredCategories.length === 0 && (
        <div className="admin_dh-no-data">Không có danh mục nào trong thùng rác.</div>
      )}

      {!loading && filteredCategories.length > 0 && (
        <>
          {renderDesktopTable()}
          {renderMobileCards()}
        </>
      )}
    </div>
  );
};

export default TrashCategories;
