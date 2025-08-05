/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../assets/admin/HomeAdmin.css";
import "../../assets/admin/product.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  softdeleteAdminProduct,
  fetchProductVariants,
} from "../../slices/adminproductsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { fetchProfileAdmin } from "../../slices/adminProfile";
import Swal from "sweetalert2";
import Loading from "../../components/Loading";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";

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
  const [isDeleting, setIsDeleting] = useState(false); // State cho loading khi xóa

  const [filters, setFilters] = useState({
    priceRange: "all",
    category: "all",
  });
  const [currentPage, setCurrentPage] = useState(pageParam);
  const productsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchCategories());
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

  // Xóa mềm nhiều sản phẩm đã chọn với kiểm tra điều kiện
  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    try {
      setIsDeleting(true);

      // Kiểm tra từng sản phẩm có variants hay không
      const productsWithVariants = [];
      const validProductsToDelete = [];

      for (const productId of selectedProducts) {
        try {
          const fetchResult = await dispatch(
            fetchProductVariants(productId)
          ).unwrap();

          const variants = fetchResult.variants?.variants || [];

          if (variants.length > 0) {
            const product = adminproducts.find(
              (p) => p.product_id === productId
            );
            productsWithVariants.push(product?.name || `ID: ${productId}`);
          } else {
            validProductsToDelete.push(productId);
          }
        } catch (error) {
          console.error(
            `Lỗi khi kiểm tra variants cho sản phẩm ${productId}:`,
            error
          );
          // Nếu có lỗi khi kiểm tra, bỏ qua sản phẩm này để đảm bảo an toàn
        }
      }

      setIsDeleting(false);

      // Nếu có sản phẩm có variants, hiển thị thông báo
      if (productsWithVariants.length > 0) {
        const productList = productsWithVariants.slice(0, 3).join(", ");
        const moreText =
          productsWithVariants.length > 3
            ? ` và ${productsWithVariants.length - 3} sản phẩm khác`
            : "";

        await Swal.fire({
          icon: "warning",
          title: "Không thể xóa một số sản phẩm",
          html: `
            <div style="text-align: left;">
              <p><strong>Các sản phẩm sau không thể xóa vì có biến thể:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>${productList}${moreText}</li>
              </ul>
              ${
                validProductsToDelete.length > 0
                  ? `<p><strong>Còn lại ${validProductsToDelete.length} sản phẩm có thể xóa.</strong></p>
                <p>Bạn có muốn tiếp tục xóa những sản phẩm này không?</p>`
                  : "<p>Không có sản phẩm nào có thể xóa.</p>"
              }
            </div>
          `,
          showCancelButton: validProductsToDelete.length > 0,
          confirmButtonText:
            validProductsToDelete.length > 0 ? "Tiếp tục xóa" : "Đóng",
          cancelButtonText: "Hủy",
          confirmButtonColor:
            validProductsToDelete.length > 0 ? "#f59e0b" : "#3085d6",
          cancelButtonColor: "#e5e7eb",
          reverseButtons: true,
        });

        // Nếu không có sản phẩm nào có thể xóa, dừng lại
        if (validProductsToDelete.length === 0) {
          return;
        }

        // Nếu người dùng không muốn tiếp tục, dừng lại
        if (validProductsToDelete.length > 0) {
          // Cập nhật selectedProducts chỉ còn những sản phẩm có thể xóa
          setSelectedProducts(validProductsToDelete);
        }
      }

      // Xác nhận xóa các sản phẩm có thể xóa
      if (validProductsToDelete.length > 0) {
        const result = await Swal.fire({
          title: `Bạn có chắc muốn chuyển ${validProductsToDelete.length} sản phẩm vào thùng rác?`,
          text: "Bạn có thể khôi phục sau này từ thùng rác",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Chuyển vào thùng rác",
          cancelButtonText: "Hủy",
          confirmButtonColor: "#f59e0b",
          cancelButtonColor: "#e5e7eb",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          setIsDeleting(true);

          try {
            let successCount = 0;
            let errorCount = 0;

            for (const productId of validProductsToDelete) {
              try {
                const resultAction = await dispatch(
                  softdeleteAdminProduct(productId)
                );
                if (softdeleteAdminProduct.fulfilled.match(resultAction)) {
                  successCount++;
                } else {
                  errorCount++;
                  toast.error(
                    `Lỗi khi xóa sản phẩm ${productId}: ${
                      resultAction.error?.message || "Lỗi không xác định"
                    }`
                  );
                }
              } catch (error) {
                errorCount++;
                toast.error(
                  `Lỗi khi xóa sản phẩm ${productId}: ${error.message}`
                );
              }
            }

            setSelectedProducts([]);

            if (successCount > 0) {
              Swal.fire({
                icon: "success",
                title: `Đã chuyển ${successCount} sản phẩm vào thùng rác!`,
                text:
                  errorCount > 0
                    ? `Có ${errorCount} sản phẩm không thể xóa`
                    : "",
                showConfirmButton: false,
                timer: 2000,
              });
            }

            // Tải lại danh sách sản phẩm
            dispatch(fetchAdminProducts());
          } catch (error) {
            toast.error(`Lỗi từ server: ${error.message}`);
          } finally {
            setIsDeleting(false);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi trong quá trình xóa:", error);
      toast.error("Có lỗi xảy ra trong quá trình kiểm tra sản phẩm");
      setIsDeleting(false);
    }
  };

  // Xóa mềm một sản phẩm
  const handleDeleteSingle = async (productId) => {
    try {
      setIsDeleting(true);

      const fetchResult = await dispatch(
        fetchProductVariants(productId)
      ).unwrap();

      const variants = fetchResult.variants?.variants || [];

      setIsDeleting(false);

      if (variants.length > 0) {
        toast.warning("Không thể xóa sản phẩm vì có biến thể.");
        return;
      }

      const confirmResult = await Swal.fire({
        title: "Bạn có chắc muốn chuyển sản phẩm vào thùng rác?",
        text: "Bạn có thể khôi phục sau này từ thùng rác",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Chuyển vào thùng rác",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#e5e7eb",
        reverseButtons: true,
      });

      if (confirmResult.isConfirmed) {
        setIsDeleting(true);

        try {
          await dispatch(softdeleteAdminProduct(productId));
          setSelectedProducts((prev) => prev.filter((id) => id !== productId));

          Swal.fire({
            icon: "success",
            title: "Đã chuyển vào thùng rác!",
            showConfirmButton: false,
            timer: 1500,
          });

          // Tải lại danh sách sản phẩm
          dispatch(fetchAdminProducts());
        } catch (error) {
          toast.error(error.message || "Lỗi khi xóa sản phẩm");
        } finally {
          setIsDeleting(false);
        }
      }
    } catch (error) {
      setIsDeleting(false);
      toast.error(error.message || "Lỗi khi kiểm tra sản phẩm");
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

  // Hiển thị Loading khi đang xóa
  if (isDeleting) {
    return <Loading />;
  }

  return (
    <div className="admin_dh-product-container">
      <div className="admin_dh-product-header">
        <div className="admin_dh-product-title">
          <h1>Sản phẩm</h1>
          <p className="text-muted">Quản lý danh sách sản phẩm của bạn</p>
        </div>
        <div className="admin_dh-product-actions">
          <Link
            to="/admin/trashproduct"
            className="admin_dh-btn admin_dh-btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #dc3545",
              color: "#ff0018",
              marginRight: "12px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-trash" style={{ fontSize: "1.1rem" }}></i>
            <span style={{ fontWeight: "500" }}>Thùng rác</span>
          </Link>

          {checkRole !== "sale" && (
            <Link
              to="/admin/addproduct"
              className="adminproductadd"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                backgroundColor: "#2563eb",
                color: "#ffffff",
              }}
            >
              <i
                className="bi bi-plus-lg"
                style={{
                  color: "0502e0",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                }}
              ></i>
              <span style={{ fontWeight: "500" }}>Thêm sản phẩm</span>
            </Link>
          )}
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
                disabled={isDeleting}
                style={{
                  backgroundColor: "#f59e0b",
                  borderColor: "#f59e0b",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                <i className="bi bi-trash" style={{ color: "#ffffff" }}></i>
                {isDeleting ? "Đang xử lý..." : "Chuyển vào thùng rác"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="admin_dh-product-list">
        {loading ? (
          <Loading />
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
                          style={{ backgroundColor: "#2e00ff", color: "white" }}

                        >
                          <FaEdit style={{ color: "white", fontSize: 15 }} />
                        </Link>
                      )}
                      <Link
                        to={`/admin/product/${product.product_id}`}
                        className="admin_dh-action-btn"

                      >
                        <FaEye style={{ color: "white" }} />
                      </Link>
                      {checkRole !== "sale" && (
                        <button
                          className="admin_dh-action-btn admin_dh-delete-btn"
                          onClick={() => handleDeleteSingle(product.product_id)}
                          disabled={isDeleting}
                          style={{ backgroundColor: "red", color: "white" }}

                        >
                          <FaTrashAlt style={{ color: "white" }} />
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
