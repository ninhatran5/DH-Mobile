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
  fetchTrashedAdminProducts,
} from "../../slices/adminproductsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { fetchProfileAdmin } from "../../slices/adminProfile";
import { fetchAdminProductVariants } from "../../slices/AdminProductVariants";
import Swal from "sweetalert2";
import Loading from "../../components/Loading";

const ProductList = () => {
  const dispatch = useDispatch();
  const { 
    adminproducts, 
    loading, 
    error,
    trashedProductsCount,
    loadingTrashedCount 
  } = useSelector((state) => state.adminproduct);
  const { categories } = useSelector((state) => state.category);
  const { adminProfile } = useSelector((state) => state.adminProfile);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Thêm state để lưu variants của tất cả sản phẩm
  const [productVariants, setProductVariants] = useState({});

  const [filters, setFilters] = useState({
    priceRange: "all",
    category: "all",
  });
  const [currentPage, setCurrentPage] = useState(pageParam);
  const productsPerPage = 10;

  // Responsive detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchCategories());
    dispatch(fetchProfileAdmin());
    dispatch(fetchTrashedAdminProducts());
  }, [dispatch, error]);

  useEffect(() => {
    const fetchAllVariants = async () => {
      if (adminproducts.length > 0) {
        try {
          const variantsMap = {};
          const results = await Promise.all(
            adminproducts.map(async (product) => {
              const variants = await dispatch(fetchAdminProductVariants(product.product_id)).unwrap();
              variantsMap[product.product_id] = variants || [];
              return variants;
            })
          );
          setProductVariants(variantsMap);
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

  // Hàm kiểm tra sản phẩm có variants hay không
  const checkProductHasVariants = (productId) => {
    const variants = productVariants[productId] || [];
    return variants.length > 0;
  };

  // Hàm helper để thực hiện xóa hàng loạt
  const performBulkDelete = async (productIds, skippedCount = 0) => {
    setIsDeleting(true);
    try {
      const deletePromises = productIds.map(productId =>
        dispatch(softdeleteAdminProduct(productId)).unwrap()
      );
      
      await Promise.all(deletePromises);
      
      await dispatch(fetchAdminProducts());
      await dispatch(fetchTrashedAdminProducts());
      
      setSelectedProducts([]);
      
      const successMessage = `Đã chuyển ${productIds.length} sản phẩm vào thùng rác thành công`;
      
      toast.success(successMessage);
      
      Swal.fire({
        title: "Đã xóa!",
        text: successMessage,
        icon: "success",
        timer: 3000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.");
      
      Swal.fire({
        title: "Lỗi!",
        text: "Không thể xóa sản phẩm. Vui lòng thử lại.",
        icon: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Hàm xóa nhiều sản phẩm đã chọn (đã sửa)
  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để xóa");
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc chắn muốn chuyển ${selectedProducts.length} sản phẩm vào thùng rác?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, chuyển vào thùng rác",
      cancelButtonText: "Hủy",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      await performBulkDelete(selectedProducts, 0);
    }
  };

  // Hàm xóa một sản phẩm (đã sửa)
  const handleDeleteSingle = async (productId) => {
    const product = adminproducts.find(p => p.product_id === productId);
    const productName = product?.name || "sản phẩm này";

    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc chắn muốn chuyển "${productName}" vào thùng rác?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, chuyển vào thùng rác",
      cancelButtonText: "Hủy",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await dispatch(softdeleteAdminProduct(productId)).unwrap();
        
        await dispatch(fetchAdminProducts());
        await dispatch(fetchTrashedAdminProducts());
        
        if (selectedProducts.includes(productId)) {
          setSelectedProducts(selectedProducts.filter(id => id !== productId));
        }
        
        toast.success(`Đã chuyển "${productName}" vào thùng rác thành công`);
        
        Swal.fire({
          title: "Đã xóa!",
          text: `"${productName}" đã được chuyển vào thùng rác.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        toast.error("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.");
        
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể xóa sản phẩm. Vui lòng thử lại.",
          icon: "error"
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

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

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const checkRole = adminProfile?.user?.role;

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

  if (isDeleting) {
    return <Loading />;
  }

  return (
    <div className="ProductsList1-container">
      {/* Header Section */}
      <div className="ProductsList1-header">
        <div className="ProductsList1-header-content">
          <div className="ProductsList1-title-section">
            <h1 className="ProductsList1-main-title">Quản lý sản phẩm</h1>
            <p className="ProductsList1-subtitle">Quản lý danh sách sản phẩm của bạn</p>
          </div>
          <div className="ProductsList1-action-buttons">
            <Link to="/admin/trashproduct" className="ProductsList1-btn ProductsList1-btn-outline-danger">
              <i className="bi bi-trash"></i>
              <span className="ProductsList1-trash-text">
                Thùng rác
                <span className="ProductsList1-trash-count-badge">{trashedProductsCount || 0}</span>
              </span>
            </Link>

            {checkRole !== "sale" && (
              <Link to="/admin/addproduct" className="ProductsList1-btn ProductsList1-btn-primary">
                <i className="bi bi-plus-lg"></i>
                <span>Thêm sản phẩm</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="ProductsList1-search-filter-section">
        <div className="ProductsList1-search-controls">
          <div className="ProductsList1-search-box">
            <i className="bi bi-search ProductsList1-search-icon"></i>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ProductsList1-search-input"
            />
          </div>
          <button
            className={`ProductsList1-filter-toggle ${showFilters ? 'ProductsList1-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel"></i>
            <span className="ProductsList1-filter-text">Bộ lọc</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="ProductsList1-filters-panel">
            <div className="ProductsList1-filter-group">
              <label className="ProductsList1-filter-label">Khoảng giá</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="ProductsList1-filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="under5m">Dưới 5 triệu</option>
                <option value="5to10m">5 - 10 triệu</option>
                <option value="10to20m">10 - 20 triệu</option>
                <option value="20to30m">20 - 30 triệu</option>
                <option value="over30m">Trên 30 triệu</option>
              </select>
            </div>

            <div className="ProductsList1-filter-group">
              <label className="ProductsList1-filter-label">Danh mục</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="ProductsList1-filter-select"
              >
                <option value="all">Tất cả danh mục</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="ProductsList1-bulk-actions">
          <div className="ProductsList1-bulk-info">
            <span className="ProductsList1-selected-count">{selectedProducts.length}</span> sản phẩm đã chọn
          </div>
          {checkRole !== "sale" && (
            <button
              className="ProductsList1-btn ProductsList1-btn-warning ProductsList1-bulk-delete"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
            >
              <i className="bi bi-trash"></i>
              {isDeleting ? "Đang xử lý..." : "Chuyển vào thùng rác"}
            </button>
          )}
        </div>
      )}

      {/* Products Content */}
      <div className="ProductsList1-content">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="ProductsList1-error-message">{error}</div>
        ) : adminproducts.length === 0 ? (
          <div className="ProductsList1-empty-state">
            <i className="bi bi-box-seam ProductsList1-empty-icon"></i>
            <h3>Chưa có sản phẩm nào</h3>
            <p>Hãy thêm sản phẩm đầu tiên của bạn</p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="ProductsList1-mobile">
            {paginatedProducts.map((product) => (
              <div key={product.product_id} className="ProductsList1-card-mobile">
                <div className="ProductsList1-card-header">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.product_id)}
                    onChange={() => handleSelectProduct(product.product_id)}
                    className="ProductsList1-checkbox"
                  />
                  <div className="ProductsList1-image-mobile">
                    <img
                      src={product.image_url || "/default-image.png"}
                      alt={product.name || "No Name"}
                      onError={(e) => { e.target.src = "/default-image.png"; }}
                    />
                  </div>
                </div>
                
                <div className="ProductsList1-card-content">
                  <h3 className="ProductsList1-name">
                    {product.name || "Không tên"}
                    {checkProductHasVariants(product.product_id) && (
                      <span className="ProductsList1-variant-indicator" title="Sản phẩm có biến thể">
                        <i className="bi bi-layers text-info"></i>
                      </span>
                    )}
                  </h3>
                  <p className="ProductsList1-id">ID: {product.product_id}</p>
                  <p className="ProductsList1-category">{product.category?.name || "Không có danh mục"}</p>
                  
                  <div className="ProductsList1-price-section">
                    <div className="ProductsList1-price-current">
                      {product.price ? `${formatPrice(product.price)} VNĐ` : "Chưa cập nhật"}
                    </div>
                    <div className="ProductsList1-price-original">
                      {product.price_original ? `${formatPrice(product.price_original)} VNĐ` : ""}
                    </div>
                  </div>
                  
                  <div className="ProductsList1-update-date">
                    Cập nhật: {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                
                <div className="ProductsList1-card-actions">
                  {checkRole !== "sale" && (
                    <Link
                      to={`/admin/EditProduct/${product.product_id}`}
                      className="ProductsList1-action-btn ProductsList1-edit-btn"
                      title="Sửa"
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                  )}
                  <Link
                    to={`/admin/product/${product.product_id}`}
                    className="ProductsList1-action-btn ProductsList1-view-btn"
                    title="Xem chi tiết"
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
                  {checkRole !== "sale" && (
                    <button
                      className="ProductsList1-action-btn ProductsList1-delete-btn"
                      title="Chuyển vào thùng rác"
                      onClick={() => handleDeleteSingle(product.product_id)}
                      disabled={isDeleting}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="ProductsList1-table-container">
            <table className="ProductsList1-table">
              <thead>
                <tr>
                  <th className="ProductsList1-checkbox-col">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedProducts.length === adminproducts.length &&
                        adminproducts.length > 0
                      }
                    />
                  </th>
                  <th className="ProductsList1-image-col">Ảnh</th>
                  <th className="ProductsList1-name-col">Tên sản phẩm</th>
                  <th className="ProductsList1-category-col">Danh mục</th>
                  <th className="ProductsList1-price-col">Giá KM</th>
                  <th className="ProductsList1-price-col">Giá gốc</th>
                  <th className="ProductsList1-date-col">Cập nhật</th>
                  <th className="ProductsList1-actions-col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.product_id}
                    className={selectedProducts.includes(product.product_id) ? "ProductsList1-selected" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={() => handleSelectProduct(product.product_id)}
                      />
                    </td>
                    <td>
                      <div className="ProductsList1-image">
                        <img
                          src={product.image_url || "/default-image.png"}
                          alt={product.name || "No Name"}
                          onError={(e) => { e.target.src = "/default-image.png"; }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="ProductsList1-info">
                        <div className="ProductsList1-name">
                          {product.name || "Không tên"}
                          {checkProductHasVariants(product.product_id) && (
                            <span className="ProductsList1-variant-indicator" title="Sản phẩm có biến thể">
                              <i className="bi bi-layers text-info"></i>
                            </span>
                          )}
                        </div>
                        <div className="ProductsList1-id">ID: {product.product_id}</div>
                      </div>
                    </td>
                    <td>{product.category?.name || "Không có danh mục"}</td>
                    <td className="ProductsList1-price">
                      {product.price ? `${formatPrice(product.price)} VNĐ` : "Chưa cập nhật"}
                    </td>
                    <td className="ProductsList1-price">
                      {product.price_original ? `${formatPrice(product.price_original)} VNĐ` : "Chưa cập nhật"}
                    </td>
                    <td>
                      {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <div className="ProductsList1-table-actions">
                        {checkRole !== "sale" && (
                          <Link
                            to={`/admin/EditProduct/${product.product_id}`}
                            className="ProductsList1-action-btn ProductsList1-edit-btn"
                            title="Sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        )}
                        <Link
                          to={`/admin/product/${product.product_id}`}
                          className="ProductsList1-action-btn ProductsList1-view-btn"
                          title="Xem chi tiết"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        {checkRole !== "sale" && (
                          <button
                            className="ProductsList1-action-btn ProductsList1-delete-btn"
                            title="Chuyển vào thùng rác"
                            onClick={() => handleDeleteSingle(product.product_id)}
                            disabled={isDeleting}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ProductsList1-pagination-container">
          <div className="ProductsList1-pagination-info">
            Hiển thị {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, filteredProducts.length)} của {filteredProducts.length} sản phẩm
          </div>
          <div className="ProductsList1-pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="ProductsList1-pagination-btn"
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="ProductsList1-pagination-btn"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="ProductsList1-page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`ProductsList1-page-number ${currentPage === pageNum ? 'ProductsList1-active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ProductsList1-pagination-btn"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="ProductsList1-pagination-btn"
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
