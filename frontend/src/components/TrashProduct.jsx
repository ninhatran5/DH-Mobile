
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchTrashedAdminProducts,
  restoreAdminProduct,
  deleteAdminProduct,
  
} from "../slices/adminproductsSlice";
import {fetchAdminProductVariants} from "../slices/AdminProductVariants";
import {fetchAdminOrders} from "../slices/adminOrderSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "../assets/admin/HomeAdmin.css";
import "../assets/admin/trashproduct.css"; 

const TrashList = () => {
  const dispatch = useDispatch();
  const { trashedProducts, loading, error } = useSelector(
    (state) => state.adminproduct
  );
  const { productVariants, loading: variantsLoading } = useSelector(
    (state) => state.adminProductVariants
  );
  const { orders: adminOrders, loading: ordersLoading } = useSelector(
    (state) => state.adminOrder
  );

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    dispatch(fetchTrashedAdminProducts());
    dispatch(fetchAdminProductVariants());
    dispatch(fetchAdminOrders());
  }, [dispatch]);
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

  // Kiểm tra sản phẩm có variant không
  const checkProductHasVariants = (productId) => {
    return productVariants.some(variant => variant.product_id === productId);
  };

  // Kiểm tra sản phẩm hoặc variants của nó có trong đơn hàng không
  const checkProductInOrders = (productId) => {
    if (!Array.isArray(adminOrders) || adminOrders.length === 0) {
      return false;
    }

    // Lấy tất cả variant_ids của sản phẩm này
    const productVariantIds = productVariants
      .filter(variant => variant.product_id === productId)
      .map(variant => variant.variant_id);

    return adminOrders.some(order => {
      // Tìm order items trong order (có thể có nhiều tên khác nhau)
      const orderItems = order.order_items || order.products || order.orderDetails || order.order_details || order.items || [];
      
      if (!Array.isArray(orderItems)) return false;

      return orderItems.some(item => {
        // Kiểm tra trực tiếp product_id
        if (item.product_id && parseInt(item.product_id, 10) === parseInt(productId, 10)) {
          return true;
        }
        
        // Kiểm tra variant_id nếu có
        if (item.variant_id && productVariantIds.includes(parseInt(item.variant_id, 10))) {
          return true;
        }
        
        return false;
      });
    });
  };

  // Kiểm tra xem có thể xóa sản phẩm không (chỉ kiểm tra orders)
  const canDeleteProduct = (productId) => {
    const inOrders = checkProductInOrders(productId);
    return !inOrders;
  };

  // Lấy lý do không thể xóa
  const getDeletionBlockReason = (productId) => {
    const inOrders = checkProductInOrders(productId);
    
    if (inOrders) {
      return "Không thể xóa - sản phẩm hoặc biến thể đã có trong đơn hàng";
    } else {
      return "Xóa vĩnh viễn";
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
    // Kiểm tra các ràng buộc
    if (!canDeleteProduct(productId)) {
      toast.error("Không thể xóa sản phẩm này vì sản phẩm hoặc biến thể đã có trong đơn hàng!");
      return;
    }

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
        const result = await dispatch(deleteAdminProduct(productId));
        // Kiểm tra lỗi trả về từ backend hoặc error của redux
        const backendError = result?.error || result?.payload?.error;
        const backendMsg = result?.payload?.message || result?.error?.message;
        if (!backendError && !backendMsg) {
          setSelectedProducts((prev) => prev.filter((id) => id !== productId));
          Swal.fire({
            icon: "success",
            title: "Đã xóa vĩnh viễn!",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          toast.error(backendMsg || "Lỗi khi xóa sản phẩm");
          // Gọi lại API để cập nhật danh sách nếu xóa không thành công
          dispatch(fetchTrashedAdminProducts());
        }
      } catch (error) {
        toast.error(error?.message || "Lỗi khi xóa sản phẩm");
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
    // Kiểm tra từng sản phẩm đã chọn có ràng buộc không
    const productsWithConstraints = selectedProducts.filter(productId => 
      !canDeleteProduct(productId)
    );

    if (productsWithConstraints.length > 0) {
      const constraintsList = productsWithConstraints.map(productId => {
        const product = trashedProducts.find(p => p.product_id === productId);
        const productName = product ? product.name : `ID: ${productId}`;
        return productName;
      }).join(", ");
      
      toast.error(`Không thể xóa các sản phẩm sau vì đã có trong đơn hàng: ${constraintsList}`);
      return;
    }

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
    <div className="TrashList1-container">
      {/* Header Section */}
      <div className="TrashList1-header">
        <div className="TrashList1-header-content">
          <div className="TrashList1-title-section">
            <h1 className="TrashList1-main-title">
              <i className="bi bi-trash3"></i>
              Thùng rác
            </h1>
            <p className="TrashList1-subtitle">
              Quản lý sản phẩm đã xóa ({filteredProducts.length} sản phẩm)
            </p>
          </div>
          <div className="TrashList1-action-buttons">
            <Link to="/admin/product" className="TrashList1-btn TrashList1-btn-outline">
              <i className="bi bi-arrow-left"></i>
              <span>Quay lại danh sách</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="TrashList1-search-section">
        <div className="TrashList1-search-box">
          <i className="bi bi-search TrashList1-search-icon"></i>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm trong thùng rác..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="TrashList1-search-input"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="TrashList1-bulk-actions">
          <div className="TrashList1-bulk-info">
            <span className="TrashList1-selected-count">{selectedProducts.length}</span> 
            sản phẩm đã chọn
          </div>
          <div className="TrashList1-bulk-buttons">
            <button
              className="TrashList1-btn TrashList1-btn-success"
              onClick={handleRestoreSelected}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
              Khôi phục
            </button>
            <button
              className="TrashList1-btn TrashList1-btn-danger"
              onClick={handleDeleteSelectedPermanently}
            >
              <i className="bi bi-trash"></i>
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      {/* Products Content */}
      <div className="TrashList1-content">
        {(loading || variantsLoading || ordersLoading) ? (
          <div className="TrashList1-loading">
            <div className="TrashList1-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          (() => { Swal.fire({ icon: 'error', title: 'Lỗi', text: error }); return null; })()
        ) : filteredProducts.length === 0 ? (
          <div className="TrashList1-empty-state">
            <i className="bi bi-trash3 TrashList1-empty-icon"></i>
            <h3>Thùng rác trống</h3>
            <p>Chưa có sản phẩm nào bị xóa</p>
          </div>
        ) : (
          <div className="TrashList1-table-container">
            <table className="TrashList1-table">
              <thead>
                <tr>
                  <th className="TrashList1-checkbox-col">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                    />
                  </th>
                  <th className="TrashList1-image-col">Ảnh</th>
                  <th className="TrashList1-name-col">Tên sản phẩm</th>
                  <th className="TrashList1-category-col">Danh mục</th>
                  <th className="TrashList1-price-col">Giá KM</th>
                  <th className="TrashList1-price-col">Giá gốc</th>
                  <th className="TrashList1-date-col">Ngày xóa</th>
                  <th className="TrashList1-actions-col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.product_id}
                    className={selectedProducts.includes(product.product_id) ? "TrashList1-selected" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={() => handleSelectProduct(product.product_id)}
                      />
                    </td>
                    <td>
                      <div className="TrashList1-image">
                        <img
                          src={product.image_url || "/default-image.png"}
                          alt={product.name || "No Name"}
                          onError={(e) => { e.target.src = "/default-image.png"; }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="TrashList1-info">
                        <div className="TrashList1-name">{product.name || "Không tên"}</div>
                        <div className="TrashList1-id">ID: {product.product_id}</div>
                      </div>
                    </td>
                    <td>{product.category?.name || "Không có danh mục"}</td>
                    <td className="TrashList1-price">
                      {product.price ? `${formatPrice(product.price)} VNĐ` : "Chưa cập nhật"}
                    </td>
                    <td className="TrashList1-price">
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
                      <div className="TrashList1-table-actions">
                        <button
                          className="TrashList1-action-btn TrashList1-restore-btn"
                          title="Khôi phục"
                          onClick={() => handleRestoreSingle(product.product_id)}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button
                          className={`TrashList1-action-btn TrashList1-delete-btn ${
                            !canDeleteProduct(product.product_id) ? 'TrashList1-disabled' : ''
                          }`}
                          title={getDeletionBlockReason(product.product_id)}
                          onClick={() => handleDeletePermanently(product.product_id)}
                        >
                          <i className="bi bi-trash"></i>
                          {!canDeleteProduct(product.product_id) && (
                            <i className="bi bi-exclamation-triangle" style={{marginLeft: '4px', fontSize: '12px'}}></i>
                          )}
                        </button>
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
        <div className="TrashList1-pagination-container">
          <div className="TrashList1-pagination-info">
            Hiển thị {(currentPage - 1) * productsPerPage + 1} - {Math.min(currentPage * productsPerPage, filteredProducts.length)} của {filteredProducts.length} sản phẩm
          </div>
          <div className="TrashList1-pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="TrashList1-pagination-btn"
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="TrashList1-pagination-btn"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="TrashList1-page-numbers">
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
                    className={`TrashList1-page-number ${currentPage === pageNum ? 'TrashList1-active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="TrashList1-pagination-btn"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="TrashList1-pagination-btn"
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashList;
