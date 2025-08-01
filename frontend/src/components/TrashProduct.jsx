import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchTrashedAdminProducts,
  restoreAdminProduct,
  deleteAdminProduct,
} from "../slices/adminproductsSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "../assets/admin/HomeAdmin.css";
import "../assets/admin/product.css";

const TrashList = () => {
  const dispatch = useDispatch();
  const { trashedProducts, loading, error } = useSelector(
    (state) => state.adminproduct
  );

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    dispatch(fetchTrashedAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Lỗi từ server: ${error}`);
    }
  }, [error]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(trashedProducts.map((product) => product.product_id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Khôi phục một sản phẩm
  const handleRestoreSingle = async (productId) => {
    const confirmResult = await Swal.fire({
      title: "Bạn có chắc muốn khôi phục sản phẩm này?",
      text: "Sản phẩm sẽ được đưa trở lại danh sách chính",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        await dispatch(restoreAdminProduct(productId));
        Swal.fire({
          icon: "success",
          title: "Đã khôi phục thành công!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        toast.error("Lỗi khi khôi phục sản phẩm");
      }
    }
  };

  // Xóa vĩnh viễn một sản phẩm
  const handleDeletePermanently = async (productId) => {
    const confirmResult = await Swal.fire({
      title: "⚠️ CẢNH BÁO!",
      text: "Bạn có chắc muốn xóa vĩnh viễn sản phẩm này? Hành động này KHÔNG THỂ KHÔI PHỤC!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        await dispatch(deleteAdminProduct(productId));
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));
        Swal.fire({
          icon: "success",
          title: "Đã xóa vĩnh viễn!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    }
  };

  // Khôi phục nhiều sản phẩm
  const handleRestoreSelected = async () => {
    const result = await Swal.fire({
      title: `Bạn có chắc muốn khôi phục ${selectedProducts.length} sản phẩm đã chọn?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        for (const productId of selectedProducts) {
          await dispatch(restoreAdminProduct(productId));
        }
        setSelectedProducts([]);
        Swal.fire({
          icon: "success",
          title: "Đã khôi phục thành công!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        toast.error("Lỗi khi khôi phục sản phẩm");
      }
    }
  };

  // Xóa vĩnh viễn nhiều sản phẩm
  const handleDeleteSelectedPermanently = async () => {
    const result = await Swal.fire({
      title: `⚠️ CẢNH BÁO!`,
      text: `Bạn có chắc muốn xóa vĩnh viễn ${selectedProducts.length} sản phẩm đã chọn? Hành động này KHÔNG THỂ KHÔI PHỤC!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        for (const productId of selectedProducts) {
          await dispatch(deleteAdminProduct(productId));
        }
        setSelectedProducts([]);
        Swal.fire({
          icon: "success",
          title: "Đã xóa vĩnh viễn!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(value));
  };

  const filteredProducts = trashedProducts.filter((product) =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="admin_dh-product-container">
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>🗑️ Thùng rác</h1>
          <p className="text-muted">Quản lý sản phẩm đã xóa ({filteredProducts.length} sản phẩm)</p>
        </div>
        <div className="admin_dh-product-actions">
          <Link
            to="/admin/product"
            className="admin_dh-btn admin_dh-btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #0071e3",
              color: "#0071e3",
            }}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div
        className="admin_dh-top-row"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
      
      </div>

      {selectedProducts.length > 0 && (
        <div className="admin_dh-bulk-actions">
          <div className="admin_dh-bulk-actions-info">
            {selectedProducts.length} sản phẩm đã chọn
          </div>
          <div className="admin_dh-bulk-actions-buttons">
            <button
              className="admin_dh-btn"
              onClick={handleRestoreSelected}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                marginRight: "8px",
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Khôi phục
            </button>
            <button
              className="admin_dh-btn admin_dh-btn-danger"
              onClick={handleDeleteSelectedPermanently}
            >
              <i className="bi bi-trash"></i> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      <div className="admin_dh-product-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p style={{ marginTop: "16px" }}>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: "40px" }}>
            <i className="bi bi-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "16px" }}></i>
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            <i className="bi bi-trash" style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}></i>
            <h3>Thùng rác trống</h3>
            <p>Chưa có sản phẩm nào bị xóa</p>
          </div>
        ) : (
          <table className="admin_dh-product-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="admin_dh-product-checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedProducts.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                  />
                </th>
                <th style={{ width: "80px" }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá KM</th>
                <th>Giá gốc</th>
                <th>Ngày xóa</th>
                <th style={{ width: "160px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className={
                    selectedProducts.includes(product.product_id) ? "selected" : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      className="admin_dh-product-checkbox"
                      checked={selectedProducts.includes(product.product_id)}
                      onChange={() => handleSelectProduct(product.product_id)}
                    />
                  </td>
                  <td>
                    <div className="admin_dh-product-image" style={{ margin: "0 auto" }}>
                      <img
                        src={product.image_url || "/default-image.png"}
                        alt={product.name || "No Name"}
                        onError={(e) => {
                          e.target.src = "/default-image.png";
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="admin_dh-product-details">
                      <div
                        className="admin_dh-product-name"
                        style={{ fontWeight: "500", marginBottom: "4px" }}
                      >
                        {product.name || "Không tên"}
                      </div>
                      <div
                        className="admin_dh-product-sku"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--admin_dh-text-secondary)",
                        }}
                      >
                        ID sản phẩm: {product.product_id || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="admin_dh-product-category">
                    {product.category?.name || "Không có danh mục"}
                  </td>
                  <td className="admin_dh-product-price admin_dh-product-price-large">
                    {product.price ? `${formatPrice(product.price)} VNĐ` : "Chưa cập nhật"}
                  </td>
                  <td className="admin_dh-product-price admin_dh-product-price-large">
                    {product.price_original
                      ? `${formatPrice(product.price_original)} VNĐ`
                      : "Chưa cập nhật"}
                  </td>
                  <td>
                    {product.deleted_at
                      ? new Date(product.deleted_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td>
                    <div className="admin_dh-product-actions-col">
                      <button
                        className="admin_dh-action-btn"
                        title="Khôi phục"
                        onClick={() => handleRestoreSingle(product.product_id)}
                        style={{ color: "#10b981" }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button
                        className="admin_dh-action-btn admin_dh-delete-btn"
                        title="Xóa vĩnh viễn"
                        onClick={() => handleDeletePermanently(product.product_id)}
                      >
                        <i className="bi bi-trash" style={{ color: "#ff3b30" }}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin_dh-pagination">
          <div className="admin_dh-pagination-info">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="admin_dh-pagination-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span style={{ margin: "0 12px" }}>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashList;
