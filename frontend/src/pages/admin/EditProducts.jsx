import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import {
  fetchAdminProducts,
  updateAdminProduct,
} from "../../slices/adminproductsSlice";
import {
  fetchAdminProductSpecifications,
  updateAdminProductSpecification,
  addAdminProductSpecification,
  deleteAdminProductSpecification,
} from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { deleteAdminProductVariant } from "../../slices/AdminProductVariants";
import { fetchVariantAttributeValues } from "../../slices/variantAttributeValueSlice";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { fetchAdminOrders } from "../../slices/adminOrderSlice";
import Loading from "../../components/Loading";
import "../../assets/admin/EditProducts.css";

// ✅ Memoized VariantDisplay Component
const VariantDisplay = ({ variant, onEdit, onDelete, attributeValues, isInOrder, ordersLoading, ordersError, canCheckOrders }) => {
  const handleDelete = useCallback(() => {
    if (ordersLoading) {
      toast.info("Vui lòng đợi kiểm tra ràng buộc đơn hàng...");
      return;
    }
    
    if (!canCheckOrders) {
      toast.warning("Không thể kiểm tra ràng buộc đơn hàng. Vui lòng cẩn thận khi xóa.");
    }
    
    onDelete(variant.variant_id);
  }, [ordersLoading, canCheckOrders, onDelete, variant.variant_id]);

  const formattedPrice = useMemo(() => 
    parseInt(variant.price).toLocaleString("vi-VN"), 
    [variant.price]
  );
  
  const formattedOriginalPrice = useMemo(() => 
    variant.price_original ? parseInt(variant.price_original).toLocaleString("vi-VN") : null, 
    [variant.price_original]
  );

  return (
    <div className="variant-display" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          borderBottom: "1px solid #eee",
        }}
      >
        {/* Hình ảnh biến thể */}
        <div
          style={{
            width: "100px",
            height: "100px",
            flexShrink: 0,
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#f8f8f8",
          }}
        >
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={variant.sku}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="bi bi-image text-muted"
                style={{ fontSize: "2rem" }}
              />
            </div>
          )}
        </div>

        {/* Thông tin biến thể */}
        <div style={{ flex: "1" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#333",
              marginBottom: "12px",
            }}
          >
            SKU: {variant.sku}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: "#666", fontSize: "15px" }}>Giá:</span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2563EB",
                }}
              >
                {formattedPrice}đ
              </span>
              {formattedOriginalPrice && (
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textDecoration: "line-through",
                  }}
                >
                  {formattedOriginalPrice}đ
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#666" }}>Tồn kho:</span>
              <span style={{ fontWeight: "500" }}>{variant.stock}</span>
            </div>
          </div>

          {/* Thuộc tính biến thể */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#666" }}>Thuộc tính:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {variant.attributes && variant.attributes.length > 0 ? (
                variant.attributes.map((attr) => (
                  <span
                    key={attr.value_id}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    {attr.name}: {attr.value}
                  </span>
                ))
              ) : (
                <span style={{ color: "#bbb" }}>Không có thuộc tính</span>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {isInOrder && (
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  border: "1px solid #ffeaa7",
                }}
              >
                <i className="bi bi-exclamation-triangle" /> Sản phẩm đã có trong đơn hàng
              </span>
            )}
            
            {!canCheckOrders && (
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  border: "1px solid #f5c6cb",
                }}
              >
                <i className="bi bi-exclamation-circle" /> Không thể kiểm tra ràng buộc
              </span>
            )}
            
            {ordersLoading && (
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#d1ecf1",
                  color: "#0c5460",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  border: "1px solid #bee5eb",
                }}
              >
                <i className="bi bi-clock-history" /> Đang kiểm tra...
              </span>
            )}
          </div>
        </div>

        {/* Nút thao tác */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <Link
            to={`/admin/variants/update/${variant.variant_id}`}
            style={{
              padding: "8px 16px",
              border: "1px solid #eab308",
              borderRadius: "6px",
              backgroundColor: "#fef9c3",
              color: "#854d0e",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            <i className="bi bi-pencil" />
            Cập nhật
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={isInOrder || ordersLoading}
            style={{
              padding: "10px 20px",
              border: `1px solid ${(isInOrder || ordersLoading) ? "#ccc" : "#dc2626"}`,
              borderRadius: "8px",
              backgroundColor: (isInOrder || ordersLoading) ? "#f5f5f5" : "#fee2e2",
              color: (isInOrder || ordersLoading) ? "#999" : "#991b1b",
              fontSize: "15px",
              cursor: (isInOrder || ordersLoading) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: (isInOrder || ordersLoading) ? 0.6 : 1,
            }}
            title={
              ordersLoading ? "Đang kiểm tra ràng buộc đơn hàng..." 
              : !canCheckOrders ? "Không thể kiểm tra ràng buộc - Hãy cẩn thận khi xóa"
              : isInOrder ? "Không thể xóa vì sản phẩm này đã có trong đơn hàng" 
              : "Xóa biến thể"
            }
          >
            <i className="bi bi-trash" />
            {ordersLoading ? "Đang kiểm tra..." : isInOrder ? "Không thể xóa" : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProductEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Optimized Selectors
  const { adminproducts, loading, error } = useSelector((state) => state.adminproduct);
  const { productSpecifications, loading: specsLoading, error: specsError } = useSelector(
    (state) => state.adminProductSpecifications
  );
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(
    (state) => state.category
  );
  const { attributeValues } = useSelector((state) => state.attributeValue || {});
  const { variantAttributeValues, loading: variantLoading } = useSelector(
    (state) => state.variantAttributeValue
  );

  // ✅ Optimized Orders Selector
  const { adminOrders, loading: ordersLoading, error: ordersError } = useSelector((state) => {
    const orderState = state.adminOrder;
    if (!orderState) {
      return { adminOrders: [], loading: false, error: "adminOrder state not found" };
    }
    
    return {
      adminOrders: orderState.adminOrders || orderState.orders || orderState.data || [],
      loading: orderState.loading || false,
      error: orderState.error || null
    };
  });

  // States
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    price_original: "",
    category_id: "",
    status: "Còn hàng",
    description: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [specificationsData, setSpecificationsData] = useState([]);
  const [showAddSpecForm, setShowAddSpecForm] = useState(false);
  const [newSpec, setNewSpec] = useState({ spec_name: "", spec_value: "" });
  const [ordersLoadAttempted, setOrdersLoadAttempted] = useState(false);

  // ✅ Optimized constraint checking function
  const checkVariantInOrders = useCallback((variantId) => {
    if (!Array.isArray(adminOrders) || adminOrders.length === 0) {
      return false;
    }

    const variant = variantAttributeValues?.find(v => v.variant_id === parseInt(variantId, 10));
    if (!variant) return false;

    const targetProductId = parseInt(variant.product_id, 10);

    return adminOrders.some(order => {
      const orderDetails = order.products || order.orderDetails || order.order_details || order.items || [];
      
      if (!Array.isArray(orderDetails)) return false;

      return orderDetails.some(detail => {
        const detailProductId = parseInt(detail.product_id, 10);
        return !isNaN(detailProductId) && detailProductId === targetProductId;
      });
    });
  }, [adminOrders, variantAttributeValues]);

  const canCheckOrderConstraints = useMemo(() => {
    return !ordersLoading && !ordersError && Array.isArray(adminOrders);
  }, [ordersLoading, ordersError, adminOrders]);

  // ✅ Optimized data loading effect
  useEffect(() => {
    if (ordersLoadAttempted) return;

    const loadAllData = async () => {
      const promises = [];
      
      if (!adminproducts?.length) {
        promises.push(dispatch(fetchAdminProducts()));
      }
      promises.push(dispatch(fetchAdminProductSpecifications()));
      if (!categories?.length) {
        promises.push(dispatch(fetchCategories()));
      }
      promises.push(dispatch(fetchVariantAttributeValues()));
      promises.push(dispatch(fetchAttributeValues()));
      
      const ordersPromise = dispatch(fetchAdminOrders())
        .unwrap()
        .catch(() => {
          toast.warning("Không thể tải dữ liệu đơn hàng. Chức năng kiểm tra ràng buộc có thể bị hạn chế.");
          return null;
        });
      
      promises.push(ordersPromise);
      
      await Promise.allSettled(promises);
      setOrdersLoadAttempted(true);
    };

    loadAllData();
  }, [dispatch, adminproducts?.length, categories?.length, ordersLoadAttempted]);

  // ✅ Optimized retry effect
  useEffect(() => {
    if ((ordersError || !adminOrders) && ordersLoadAttempted && !ordersLoading) {
      const retryTimer = setTimeout(() => {
        dispatch(fetchAdminOrders());
      }, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [ordersError, adminOrders, ordersLoadAttempted, ordersLoading, dispatch]);

  // ✅ Optimized product data effect
  useEffect(() => {
    if (!adminproducts?.length || !productSpecifications?.length) return;

    const product = adminproducts.find((p) => String(p.product_id) === id);
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        price_original: product.price_original || "",
        category_id: product.category_id || "",
        status: product.status === 0 ? "Hết hàng" : "Còn hàng",
        description: product.description || "",
        imageFile: null,
      });
      setImagePreview(product.image_url || "");
    }

    const specs = productSpecifications.filter((spec) => String(spec.product_id) === id);
    setSpecificationsData(specs);
  }, [adminproducts, productSpecifications, id]);

  // ✅ Memoized current product variants
  const currentProductVariants = useMemo(() => 
    variantAttributeValues?.filter((variant) => String(variant.product_id) === id) || [],
    [variantAttributeValues, id]
  );

  // ✅ Optimized handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSpecificationChange = useCallback((index, field, value) => {
    setSpecificationsData((prev) =>
      prev.map((spec, i) => i === index ? { ...spec, [field]: value } : spec)
    );
  }, []);

  const handleUpdateSpecifications = useCallback(async () => {
    try {
      await Promise.all(
        specificationsData.map(spec =>
          dispatch(updateAdminProductSpecification({
            id: spec.spec_id,
            updatedData: {
              product_id: spec.product_id,
              spec_name: spec.spec_name,
              spec_value: spec.spec_value,
            }
          }))
        )
      );
      toast.success("Cập nhật thông số kỹ thuật thành công!");
    } catch (err) {
      toast.error("Cập nhật thông số kỹ thuật thất bại: " + err);
    }
  }, [dispatch, specificationsData]);

  const handleAddSpecification = useCallback(async (e) => {
    e.preventDefault();
    if (!newSpec.spec_name.trim() || !newSpec.spec_value.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin thông số kỹ thuật");
      return;
    }

    try {
      await dispatch(addAdminProductSpecification({
        product_id: parseInt(id, 10),
        spec_name: newSpec.spec_name,
        spec_value: newSpec.spec_value,
      })).unwrap();
      
      toast.success("Thêm thông số kỹ thuật thành công!");
      setNewSpec({ spec_name: "", spec_value: "" });
      setShowAddSpecForm(false);
      dispatch(fetchAdminProductSpecifications());
    } catch (err) {
      toast.error("Thêm thông số thất bại: " + err);
    }
  }, [dispatch, id, newSpec]);

  const handleDeleteSpecification = useCallback(async (specId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa thông số",
      text: "Bạn có chắc chắn muốn xóa thông số này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteAdminProductSpecification(specId)).unwrap();
        toast.success("Xóa thông số thành công!");
        dispatch(fetchAdminProductSpecifications());
      } catch (err) {
        toast.error("Xóa thông số thất bại: " + err);
      }
    }
  }, [dispatch]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Tên sản phẩm không được để trống");
      return;
    }
    if (!formData.price || isNaN(formData.price)) {
      toast.warning("Giá sản phẩm không hợp lệ");
      return;
    }
    if (!formData.category_id) {
      toast.warning("Vui lòng chọn danh mục");
      return;
    }

    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("price", formData.price);
    updatedData.append("price_original", formData.price_original);
    updatedData.append("category_id", formData.category_id);
    updatedData.append("status", formData.status === "Còn hàng" ? 1 : 0);
    updatedData.append("description", formData.description);
    if (formData.imageFile) {
      updatedData.append("image_url", formData.imageFile);
    }

    try {
      await dispatch(updateAdminProduct({ id, updatedData })).unwrap();
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/product");
    } catch (err) {
      toast.error("Cập nhật thất bại: " + err);
    }
  }, [dispatch, formData, id, navigate]);

  const handleDeleteVariant = useCallback(async (variantId) => {
    try {
      if (ordersLoading) {
        toast.info("Đang kiểm tra ràng buộc đơn hàng, vui lòng đợi...");
        return;
      }

      const canCheck = canCheckOrderConstraints;
      
      if (!canCheck) {
        const result = await Swal.fire({
          title: "⚠️ Cảnh báo - Không thể kiểm tra ràng buộc",
          html: `
            <div style="text-align: left; padding: 10px;">
              <p><strong>Tình trạng:</strong></p>
              <ul style="text-align: left; margin: 10px 0;">
                <li>Không thể tải dữ liệu đơn hàng</li>
                <li>Không thể xác định sản phẩm có trong đơn hàng hay không</li>
              </ul>
              <p><strong>Bạn có muốn tiếp tục xóa?</strong></p>
              <p style="color: #d33; font-size: 14px;">⚠️ Rủi ro: Xóa biến thể của sản phẩm đã có trong đơn hàng có thể gây lỗi hệ thống</p>
            </div>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "🗑️ Vẫn xóa (có rủi ro)",
          cancelButtonText: "❌ Hủy bỏ an toàn",
        });

        if (!result.isConfirmed) return;
      } else {
        if (!adminOrders?.length) {
          const loadingSwal = Swal.fire({
            title: "Đang kiểm tra ràng buộc đơn hàng...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          try {
            await dispatch(fetchAdminOrders()).unwrap();
            loadingSwal.close();
          } catch (error) {
            loadingSwal.close();
            const result = await Swal.fire({
              title: "❌ Không thể kiểm tra ràng buộc",
              text: "Vẫn muốn tiếp tục xóa?",
              icon: "error",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "Vẫn xóa",
              cancelButtonText: "Hủy",
            });
            if (!result.isConfirmed) return;
          }
        }

        const isInOrder = checkVariantInOrders(variantId);
        
        if (isInOrder) {
          await Swal.fire({
            title: "⚠️ Không thể xóa biến thể!",
            html: `
              <div style="text-align: left; padding: 10px;">
                <p><strong>Lý do:</strong> Sản phẩm này đã có trong đơn hàng và không thể xóa biến thể.</p>
                <p><strong>Chi tiết:</strong> Biến thể thuộc về sản phẩm đã được đặt hàng</p>
                <p><strong>Giải pháp:</strong></p>
                <ul style="text-align: left; margin: 10px 0;">
                  <li>Chỉ có thể ẩn biến thể thay vì xóa</li>
                  <li>Hoặc chờ tất cả đơn hàng liên quan được hoàn thành</li>
                </ul>
              </div>
            `,
            icon: "error",
            confirmButtonText: "Đã hiểu",
            confirmButtonColor: "#3085d6",
            width: 500
          });
          return;
        }
      }

      const result = await Swal.fire({
        title: "⚠️ Xác nhận xóa biến thể",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p>Bạn có chắc chắn muốn xóa biến thể này?</p>
            <p style="color: #d33; font-weight: bold;">⚠️ Hành động này không thể hoàn tác!</p>
            ${!canCheck ? '<p style="color: #856404; font-size: 14px;">⚠️ Đã bỏ qua kiểm tra ràng buộc đơn hàng</p>' : ''}
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "🗑️ Xóa ngay",
        cancelButtonText: "❌ Hủy bỏ",
      });

      if (result.isConfirmed) {
        const loadingSwal = Swal.fire({
          title: "Đang xóa biến thể...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await dispatch(deleteAdminProductVariant(variantId)).unwrap();
          await dispatch(fetchVariantAttributeValues());
          
          loadingSwal.close();
          await Swal.fire({
            title: "Thành công!",
            text: "Xóa biến thể thành công!",
            icon: "success",
            confirmButtonText: "Đóng",
            timer: 2000
          });
        } catch (error) {
          loadingSwal.close();
          
          let errorMessage = "❌ Lỗi khi xóa biến thể";
          let errorDetails = "";

          if (error.message) {
            if (error.message.includes("foreign key constraint") || error.message.includes("constraint")) {
              errorMessage = "❌ Không thể xóa biến thể";
              errorDetails = "Biến thể này còn liên kết với dữ liệu khác trong hệ thống";
            } else if (error.message.includes("not found")) {
              errorMessage = "❌ Không tìm thấy biến thể";
              errorDetails = "Biến thể có thể đã được xóa trước đó";
            } else {
              errorMessage = "❌ Lỗi không xác định";
              errorDetails = error.message;
            }
          }

          await Swal.fire({
            title: errorMessage,
            text: errorDetails,
            icon: "error",
            confirmButtonText: "Đóng",
            confirmButtonColor: "#d33"
          });
        }
      }
    } catch (error) {
      toast.error("❌ Có lỗi xảy ra khi xử lý yêu cầu");
    }
  }, [ordersLoading, canCheckOrderConstraints, adminOrders, dispatch, checkVariantInOrders]);

  // ✅ Show loading if any critical data is loading
  const isLoading = loading || specsLoading || categoriesLoading || ordersLoading;
  const hasError = error || specsError || categoriesError;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="admineditproduct-container" style={{ padding: "5px 10px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="admineditproduct-header" style={{ marginBottom: "0px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "2px solid #eee" }}>
        <h1 className="admineditproduct-title" style={{ margin: 0 }}>Chỉnh sửa sản phẩm</h1>
        <Link to="/admin/product" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left" /> Quay lại
        </Link>
      </div>

      {/* Warning alerts */}
      {(ordersError || !adminOrders) && ordersLoadAttempted && !ordersLoading && (
        <div className="alert alert-warning alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle" />
          <strong>Cảnh báo:</strong> Không thể tải dữ liệu đơn hàng. 
          <br />
          <small>
            - Chức năng kiểm tra ràng buộc bị hạn chế<br />
            - Hãy cẩn thận khi xóa biến thể<br />
            {ordersError && `- Lỗi: ${ordersError}`}
          </small>
        </div>
      )}

      {hasError && (
        <div className="alert alert-danger">
          {error || specsError || categoriesError}
        </div>
      )}

      {/* Main Content */}
      <div className="row g-3 align-items-stretch">
        {/* Form thông tin cơ bản */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-between" style={{ padding: 18 }}>
              <h4 className="card-title mb-4">Thông tin cơ bản</h4>
              <form onSubmit={handleSubmit} className="admineditproduct-form">
                {[
                  { label: "Tên sản phẩm", type: "text", name: "name", required: true },
                  { label: "Giá khuyến mại", type: "number", name: "price", required: true },
                  { label: "Giá Gốc", type: "number", name: "price_original" },
                ].map(({ label, type, name, required }) => (
                  <div key={name} className="admineditproduct-form-group" style={{ marginBottom: "12px" }}>
                    <label>{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      required={required}
                      style={{ width: "100%", padding: "6px" }}
                    />
                  </div>
                ))}

                <div className="admineditproduct-form-group" style={{ marginBottom: "12px" }}>
                  <label>Chọn tệp ảnh</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="admineditproduct-file-input"
                  />
                </div>

                {imagePreview && (
                  <div className="admineditproduct-image-preview" style={{ marginBottom: "12px" }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: "150px", borderRadius: "4px" }} />
                  </div>
                )}

                <div className="admineditproduct-form-group" style={{ marginBottom: "12px" }}>
                  <label>Danh mục</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "6px" }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories?.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admineditproduct-form-group" style={{ marginBottom: "12px" }}>
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    style={{ width: "100%", padding: "6px" }}
                  />
                </div>

                <button type="submit" className="btn btn-success" style={{ marginTop: "12px" }}>
                  Cập nhật sản phẩm
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Thông số kỹ thuật section */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column" style={{ padding: 18, fontSize: 14, background: "#fafbfc", borderRadius: 10, minHeight: 0, height: "100%" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0" style={{ fontSize: 17 }}>Thông số kỹ thuật</h4>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 17, padding: "4px 12px" }}
                  onClick={() => setShowAddSpecForm(!showAddSpecForm)}
                >
                  <i className="bi bi-plus" /> Thêm thông số
                </button>
              </div>

              <hr />
              
              {/* Form thêm thông số mới */}
              {showAddSpecForm && (
                <div className="add-spec-form mb-3 p-3 border rounded bg-light">
                  <h5 className="mb-2" style={{ fontSize: 14 }}>Thêm thông số mới</h5>
                  <form onSubmit={handleAddSpecification}>
                    <div className="mb-2">
                      <label className="form-label" style={{ fontSize: 13 }}>Tên thông số</label>
                      <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        style={{ fontSize: 13, padding: "4px 8px", background: "#f6f8fa", border: "1px solid #e0e0e0", borderRadius: 6 }}
                        placeholder="Ví dụ: RAM, CPU, Màn hình..."
                        value={newSpec.spec_name}
                        onChange={(e) => setNewSpec((prev) => ({ ...prev, spec_name: e.target.value }))}
                      />
                      <label className="form-label" style={{ fontSize: 13 }}>Giá trị</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ fontSize: 13, padding: "4px 8px", background: "#f6f8fa", border: "1px solid #e0e0e0", borderRadius: 6 }}
                        placeholder="Nhập giá trị thông số"
                        value={newSpec.spec_value}
                        onChange={(e) => setNewSpec((prev) => ({ ...prev, spec_value: e.target.value }))}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success btn-sm" style={{ fontSize: 13, padding: "4px 12px" }}>
                        <i className="bi bi-check-lg" /> Lưu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 13, padding: "4px 12px" }}
                        onClick={() => {
                          setShowAddSpecForm(false);
                          setNewSpec({ spec_name: "", spec_value: "" });
                        }}
                      >
                        <i className="bi bi-x-lg" /> Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="specifications-container">
                {specificationsData.map((spec, index) => (
                  <div
                    className="specification-row mb-3"
                    key={spec.spec_id || index}
                    style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 8, padding: "12px 12px", marginBottom: 18, fontSize: 16 }}
                  >
                    <div className="row g-2 w-100">
                      <div className="col-md-5 mb-2">
                        <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Tên thông số</div>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ fontSize: 15, padding: "6px 10px", background: "#f6f8fa", border: "1px solid #e0e0e0", borderRadius: 6 }}
                          placeholder="Tên thông số"
                          value={spec.spec_name || ""}
                          onChange={(e) => handleSpecificationChange(index, "spec_name", e.target.value)}
                        />
                      </div>
                      <div className="col-md-5 mb-2">
                        <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Thông số kỹ thuật</div>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ fontSize: 15, padding: "6px 10px", background: "#f6f8fa", border: "1px solid #e0e0e0", borderRadius: 6 }}
                          placeholder="Giá trị"
                          value={spec.spec_value || ""}
                          onChange={(e) => handleSpecificationChange(index, "spec_value", e.target.value)}
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end justify-content-end">
                        <button
                          type="button"
                          className="admin-edit-product-btn btn-danger btn-sm"
                          style={{ fontSize: 15, padding: "6px 10px ", margin: "0px 1px 7px 0px", borderRadius: 6, background: "#fff0f0", color: "#d32f2f", border: "1px solid #ffd6d6" }}
                          onClick={() => handleDeleteSpecification(spec.spec_id)}
                          disabled={!spec.spec_id}
                        >
                          <i className="bi bi-trash" /> Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {specificationsData.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleUpdateSpecifications}
                      className="btn btn-warning btn-sm w-100"
                      style={{ fontSize: 14, padding: "7px 0", borderRadius: 6, width: "100%", marginTop: 10, fontWeight: 500, background: "#ffe066", color: "#7c5c00", border: "1px solid #ffe066" }}
                    >
                      <i className="bi bi-save" /> Cập nhật tất cả thông số kỹ thuật
                    </button>
                  </div>
                )}
                
                {specificationsData.length === 0 && (
                  <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
                    <i className="bi bi-clipboard-data" style={{ fontSize: "1.3rem" }} />
                    <p className="mt-2">Chưa có thông số kỹ thuật nào. Hãy thêm thông số mới!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variants section */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">
                  Biến thể sản phẩm
                  {ordersLoading && (
                    <small className="text-muted ms-2">
                      <i className="bi bi-clock-history" /> Đang kiểm tra ràng buộc...
                    </small>
                  )}
                  {(ordersError || !adminOrders) && (
                    <small className="text-warning ms-2">
                      <i className="bi bi-exclamation-triangle" /> Không thể kiểm tra ràng buộc
                    </small>
                  )}
                </h4>
                <Link
                  to={`/admin/addvariant/${id}`}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }}
                >
                  <i className="bi bi-plus" />
                  Thêm biến thể mới
                </Link>
              </div>
              
              <div className="variants-list" style={{ border: "1px solid #e1e1e1", borderRadius: "8px", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                {currentProductVariants.length > 0 ? (
                  currentProductVariants.map((variant) => {
                    const isInOrder = canCheckOrderConstraints && checkVariantInOrders(variant.variant_id);
                    
                    return (
                      <div
                        key={variant.variant_id}
                        data-variant-id={variant.variant_id}
                        className="variant-item"
                        style={{ backgroundColor: "#fff", transition: "background-color 0.2s" }}
                      >
                        <VariantDisplay
                          variant={variant}
                          onEdit={() => navigate(`/admin/variants/update/${variant.variant_id}`)}
                          onDelete={handleDeleteVariant}
                          attributeValues={attributeValues}
                          isInOrder={isInOrder}
                          ordersLoading={ordersLoading}
                          ordersError={ordersError}
                          canCheckOrders={canCheckOrderConstraints}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5" style={{ color: "#666", fontSize: "16px" }}>
                    <i className="bi bi-box-seam" style={{ fontSize: "3rem", marginBottom: "16px", display: "block" }} />
                    <p>Chưa có biến thể nào cho sản phẩm này</p>
                    <Link to={`/admin/addvariant/${id}`} className="btn btn-primary mt-2">
                      <i className="bi bi-plus" /> Thêm biến thể đầu tiên
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;
