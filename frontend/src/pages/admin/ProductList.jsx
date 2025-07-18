import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../assets/admin/HomeAdmin.css";
import "../../assets/admin/product.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  deleteAdminProduct,
  fetchProductVariants
} from "../../slices/adminproductsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { fetchProfileAdmin } from "../../slices/adminProfile";
import Swal from "sweetalert2";

const ProductList = () => {
  const dispatch = useDispatch();
  const { adminproducts, loading, error } = useSelector(
    (state) => state.adminproduct
  );
  const { categories } = useSelector((state) => state.category);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    priceRange: "all",
    category: "all",
  });
  const [currentPage, setCurrentPage] = useState(pageParam);
  const productsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchCategories());
    if (error) {
      toast.error(`Lỗi từ server: ${error}`);
    }
  }, [dispatch, error]);

 useEffect(() => {
  const fetchAllVariants = async () => {
    if (adminproducts.length > 0) {
      try {
        const results = await Promise.all(
          adminproducts.map((product) =>
            dispatch(fetchProductVariants(product.product_id)).unwrap()
          )
        );

        console.log("Danh sách biến thể từng sản phẩm:", results);
      } catch (error) {
        console.error("Lỗi khi lấy biến thể:", error);
      }
    }
  };

  fetchAllVariants();
}, [dispatch, adminproducts]);


  useEffect(() => {
    setSearchParams((params) => {
      params.set("page", currentPage);
      return params;
    });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    if (pageParam !== currentPage) setCurrentPage(pageParam);
  }, [pageParam]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(adminproducts.map((product) => product.product_id));
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

  const handleDeleteSelected = async () => {
    const result = await Swal.fire({
      title: `Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true

    });
    if (result.isConfirmed) {
      try {
        for (const productId of selectedProducts) {
          const resultAction = await dispatch(deleteAdminProduct(productId));
          if (deleteAdminProduct.rejected.match(resultAction)) {
            toast.error(
              `Lỗi khi xóa sản phẩm ${productId}: ${resultAction.error.message}`
            );
          }
        }
        setSelectedProducts([]);
        Swal.fire({
          icon: "success",
          title: "Đã xoá thành công!",
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        toast.error(`Lỗi từ server: ${error.message}`);
      }
    }
  };

 const handleDeleteSingle = async (productId) => {
  try {
    console.log("🔍 Gọi fetchProductVariants với productId:", productId);
    const fetchResult = await dispatch(fetchProductVariants(productId)).unwrap();
    console.log("Kết quả fetchProductVariants:", fetchResult);

    // Lấy mảng biến thể thực tế
    const variants = fetchResult.variants?.variants || [];

    if (variants.length > 0) {
      toast.warning(" Không thể xoá sản phẩm vì có biến thể.");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Bạn có chắc muốn xóa sản phẩm này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#e5e7eb",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      await dispatch(deleteAdminProduct(productId));
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));

      Swal.fire({
        icon: "success",
        title: " Đã xoá thành công!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  } catch (error) {
    toast.error(error.message || "❌ Lỗi khi kiểm tra biến thể sản phẩm");
  }
};


  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const { adminProfile } = useSelector((state) => state.adminProfile);

  const checkRole = adminProfile?.user?.role;

  useEffect(() => {
    dispatch(fetchProfileAdmin());
  }, [dispatch]);

  const getFilteredProducts = () => {
    return Array.isArray(adminproducts)
      ? adminproducts.filter((product) => {
          const nameMatch = product?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          let priceMatch = true;
          const price = parseFloat(product.price);
          switch (filters.priceRange) {
            case "under5m":
              priceMatch = price < 5000000;
              break;
            case "5to10m":
              priceMatch = price >= 5000000 && price < 10000000;
              break;
            case "10to20m":
              priceMatch = price >= 10000000 && price < 20000000;
              break;
            case "20to30m":
              priceMatch = price >= 20000000 && price < 30000000;
              break;
            case "over30m":
              priceMatch = price >= 30000000;
              break;
            default:
              priceMatch = true;
          }

          // Lọc theo danh mục
          const categoryMatch =
            filters.category === "all"
              ? true
              : product.category_id === parseInt(filters.category);

          return nameMatch && priceMatch && categoryMatch;
        })
      : [];
  };

  const formatPrice = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(value));
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="admin_dh-product-container">
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>Sản phẩm</h1>
          <p className="text-muted">Quản lý danh sách sản phẩm của bạn</p>
        </div>
        {checkRole !== "sale" && (
          <div className="admin_dh-product-actions">
            <Link
              to="/admin/addproduct"
              className="admin_dh-btn admin_dh-btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 113, 227, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <i
                className="bi bi-plus-lg"
                style={{
                  color: "#ffffff",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              ></i>
              <span style={{ fontWeight: "500" }}>Thêm sản phẩm</span>
            </Link>
          </div>
        )}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            className="admin_dh-search-box"
            style={{
              position: "relative",
              width: "400px",
            }}
          >
            <i
              className="bi bi-search"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#0071e3",
                fontSize: "1.1rem",
              }}
            ></i>
            <input
              type="text"
              className="admin_dh-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                fontSize: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                outline: "none",
                transition: "all 0.2s ease",
                backgroundColor: "#f9fafb",
              }}
            />
          </div>
          <button
            className="admin_dh-btn admin_dh-btn-outline"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: showFilters ? "#f3f4f6" : "#fff",
              color: "#374151",
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-funnel" style={{ color: "#5ac8fa" }}></i>
            Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div
            className="admin_dh-filters-panel"
            style={{
              display: "flex",
              gap: "20px",
              padding: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div className="filter-group" style={{ flex: 1 }}>
              <label
                className="filter-label"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                Khoảng giá
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) =>
                  handleFilterChange("priceRange", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                }}
              >
                <option value="all">Tất cả</option>
                <option value="under5m">Dưới 5 triệu</option>
                <option value="5to10m">5 - 10 triệu</option>
                <option value="10to20m">10 - 20 triệu</option>
                <option value="20to30m">20 - 30 triệu</option>
                <option value="over30m">Trên 30 triệu</option>
              </select>
            </div>

            <div className="filter-group" style={{ flex: 1 }}>
              <label
                className="filter-label"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.9rem",
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                Danh mục
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                }}
              >
                <option value="all">Tất cả danh mục</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {selectedProducts.length > 0 && (
        <div className="admin_dh-bulk-actions">
          <div className="admin_dh-bulk-actions-info">
            {selectedProducts.length} sản phẩm đã chọn
          </div>
          <div className="admin_dh-bulk-actions-buttons">
            {checkRole !== "sale" && (
              <button
                className="admin_dh-btn admin_dh-btn-danger"
                onClick={handleDeleteSelected}
              >
                <i className="bi bi-trash" style={{ color: "#ffffff" }}></i> Xóa
              </button>
            )}
          </div>
        </div>
      )}

      <div className="admin_dh-product-list">
        {loading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : adminproducts.length === 0 ? (
          <div>Không có sản phẩm phù hợp</div>
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
                      selectedProducts.length === adminproducts.length &&
                      adminproducts.length > 0
                    }
                    indeterminate={
                      selectedProducts.length > 0 &&
                      selectedProducts.length < adminproducts.length
                        ? "true"
                        : undefined
                    }
                  />
                </th>
                <th style={{ width: "80px" }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá KM</th>
                <th>Giá gốc</th>
                <th>Cập nhật</th>
                <th style={{ width: "120px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className={
                    selectedProducts.includes(product.product_id)
                      ? "selected"
                      : ""
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
                    <div
                      className="admin_dh-product-image"
                      style={{ margin: "0 auto" }}
                    >
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
                        ID sản phẩm : {product.product_id || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="admin_dh-product-category">
                    {product.category?.name || "Không có danh mục"}
                  </td>
                  <td className="admin_dh-product-price admin_dh-product-price-large">
                    {product.price
                      ? `${formatPrice(product.price)} VNĐ`
                      : "Chưa cập nhật"}
                  </td>
                  <td className="admin_dh-product-price admin_dh-product-price-large">
                    {product.price_original
                      ? `${formatPrice(product.price_original)} VNĐ`
                      : "Chưa cập nhật"}
                  </td>

                  <td>
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <div className="admin_dh-product-actions-col">
                      {checkRole !== "sale" && (
                        <Link
                          to={`/admin/EditProduct/${product.product_id}`}
                          className="admin_dh-action-btn admin_dh-edit-btn"
                          title="Sửa"
                        >
                          <i
                            className="bi bi-pencil"
                            style={{ color: "#0071e3" }}
                          ></i>
                        </Link>
                      )}
                      <Link
                        to={`/admin/product/${product.product_id}`}
                        className="admin_dh-action-btn"
                        title="Xem chi tiết"
                      >
                        <i
                          className="bi bi-eye"
                          style={{ color: "#5ac8fa" }}
                        ></i>
                      </Link>
                      {checkRole !== "sale" && (
                        <button
                          className="admin_dh-action-btn admin_dh-delete-btn"
                          title="Xóa"
                          onClick={() => handleDeleteSingle(product.product_id)}
                        >
                          <i
                            className="bi bi-trash"
                            style={{ color: "#ff3b30" }}
                          ></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="admin_dh-pagination">
        <div className="admin_dh-pagination-info">
          Trang {currentPage} / {totalPages}
        </div>
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
};

export default ProductList;
