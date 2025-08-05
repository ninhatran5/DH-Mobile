/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// CKEditor imports
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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
    <div className="variant-display">
      <div className="variant-content">
        {/* Hình ảnh biến thể */}
        <div className="variant-image-container">
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={variant.sku}
              className="variant-image"
            />
          ) : (
            <div className="variant-image-placeholder">
              <i className="bi bi-image" />
            </div>
          )}
        </div>

        {/* Thông tin biến thể */}
        <div className="variant-info">
          <div className="variant-sku">
            SKU: {variant.sku}
          </div>

          <div className="variant-details">
            <div className="variant-price">
              <span className="price-label">Giá:</span>
              <span className="price-current">
                {formattedPrice}đ
              </span>
              {formattedOriginalPrice && (
                <span className="price-original">
                  {formattedOriginalPrice}đ
                </span>
              )}
            </div>

            <div className="variant-stock">
              <span className="stock-label">Tồn kho:</span>
              <span className="stock-value">{variant.stock}</span>
            </div>
          </div>

          {/* Thuộc tính biến thể */}
          <div className="variant-attributes">
            <div className="attributes-label">Thuộc tính:</div>
            <div className="attributes-container">
              {variant.attributes && variant.attributes.length > 0 ? (
                variant.attributes.map((attr) => (
                  <span key={attr.value_id} className="attribute-tag">
                    {attr.name}: {attr.value}
                  </span>
                ))
              ) : (
                <span className="no-attributes">Không có thuộc tính</span>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="variant-status">
            {isInOrder && (
              <span className="status-badge status-warning">
                <i className="bi bi-exclamation-triangle" /> Sản phẩm đã có trong đơn hàng
              </span>
            )}
            
            {!canCheckOrders && (
              <span className="status-badge status-error">
                <i className="bi bi-exclamation-circle" /> Không thể kiểm tra ràng buộc
              </span>
            )}
            
            {ordersLoading && (
              <span className="status-badge status-loading">
                <i className="bi bi-clock-history" /> Đang kiểm tra...
              </span>
            )}
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="variant-actions">
          <Link
            to={`/admin/variants/update/${variant.variant_id}`}
            className="action-btn btn-edit"
          >
            <i className="bi bi-pencil" />
            Cập nhật
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={isInOrder || ordersLoading}
            className={`action-btn btn-delete ${(isInOrder || ordersLoading) ? 'disabled' : ''}`}
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

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    price_original: "",
    category_id: "",
    status: "Còn hàng",
    description: "",
    imageFile: null,
  });

  const [displayValues, setDisplayValues] = useState({
    price: "",
    price_original: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [specificationsData, setSpecificationsData] = useState([]);
  const [showAddSpecForm, setShowAddSpecForm] = useState(false);
  const [newSpec, setNewSpec] = useState({ spec_name: "", spec_value: "" });
  const [ordersLoadAttempted, setOrdersLoadAttempted] = useState(false);

  const formatPrice = useCallback((value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    if (!cleanValue) return '';
    const number = parseInt(cleanValue, 10);
    return number.toLocaleString('vi-VN');
  }, []);

  const parsePrice = useCallback((formattedValue) => {
    if (!formattedValue) return '';
    return formattedValue.toString().replace(/\./g, '');
  }, []);

  const isValidPrice = useCallback((value) => {
    const cleaned = value.toString().replace(/\D/g, '');
    return cleaned !== '' && parseInt(cleaned, 10) >= 0;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'price_original') {
      // Chỉ cho phép số và dấu chấm
      const cleanValue = value.replace(/[^\d.]/g, '');
      
      // Parse về số nguyên (loại bỏ dấu chấm)
      const numericValue = parsePrice(cleanValue);
      
      // Validate
      if (cleanValue === '' || isValidPrice(numericValue)) {
        // Cập nhật giá trị thô (để submit)
        setFormData(prev => ({ 
          ...prev, 
          [name]: numericValue 
        }));
        
        // Cập nhật giá trị hiển thị (đã format)
        setDisplayValues(prev => ({
          ...prev,
          [name]: cleanValue === '' ? '' : formatPrice(numericValue)
        }));
      }
    } else {
      // Các field khác giữ nguyên
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [formatPrice, parsePrice, isValidPrice]);

  const handlePriceFocus = useCallback((e) => {
    const { name } = e.target;
    if (name === 'price' || name === 'price_original') {
      e.target.value = formData[name]; // Hiển thị số nguyên khi focus
    }
  }, [formData]);

  const handlePriceBlur = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'price_original') {
      const formatted = value ? formatPrice(value) : '';
      setDisplayValues(prev => ({
        ...prev,
        [name]: formatted
      }));
      // Cập nhật lại input value để hiển thị format
      e.target.value = formatted;
    }
  }, [formatPrice]);

  const validatePrices = useCallback(() => {
    if (!formData.price || !isValidPrice(formData.price)) {
      return "Giá khuyến mại không hợp lệ";
    }
    
    const price = parseInt(formData.price, 10);
    if (price <= 0) {
      return "Giá khuyến mại phải lớn hơn 0";
    }
    
    if (formData.price_original) {
      if (!isValidPrice(formData.price_original)) {
        return "Giá gốc không hợp lệ";
      }
      
      const originalPrice = parseInt(formData.price_original, 10);
      if (originalPrice <= 0) {
        return "Giá gốc phải lớn hơn 0";
      }
      
      if (originalPrice <= price) {
        return "Giá gốc phải lớn hơn giá khuyến mại";
      }
    }
    
    return null;
  }, [formData, isValidPrice]);

  // ✅ Enhanced constraint checking (giữ nguyên từ code gốc)
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

  // ✅ CKEditor Configuration (giữ nguyên)
  const editorConfiguration = {
  toolbar: {
    items: [
      'heading', '|',
      'bold', 'italic', 'underline', '|',
      'bulletedList', 'numberedList', '|',
      'link', 'imageUpload', 'mediaEmbed', '|',
      'blockQuote', 'insertTable', '|',
      'undo', 'redo', '|',
      'alignment', 'fontColor', 'fontBackgroundColor', '|',
      'fontSize', 'fontFamily'
    ]
  },
  
  alignment: {
    options: [
      { name: 'left', className: 'text-left' },
      { name: 'center', className: 'text-center' },
      { name: 'right', className: 'text-right' },
      { name: 'justify', className: 'text-justify' }
    ]
  },
  
  fontFamily: {
    options: [
      'default',
      'Arial, Helvetica, sans-serif',
      'Courier New, Courier, monospace',
      'Georgia, serif',
      'Lucida Sans Unicode, Lucida Grande, sans-serif',
      'Tahoma, Geneva, sans-serif',
      'Times New Roman, Times, serif',
      'Trebuchet MS, Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif',
      // Thêm font tiếng Việt
      'Be Vietnam Pro, sans-serif',
      'Roboto, sans-serif',
      'Open Sans, sans-serif'
    ],
    supportAllValues: true
  },
  
  fontSize: {
    options: [
      9, 10, 11, 12, 'default', 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 48, 72
    ],
    supportAllValues: true
  },
  
  fontColor: {
    colors: [
      {
        color: 'hsl(0, 0%, 0%)',
        label: 'Black'
      },
      {
        color: 'hsl(0, 0%, 30%)',
        label: 'Dim grey'
      },
      {
        color: 'hsl(0, 0%, 60%)',
        label: 'Grey'
      },
      {
        color: 'hsl(0, 0%, 90%)',
        label: 'Light grey'
      },
      {
        color: 'hsl(0, 0%, 100%)',
        label: 'White',
        hasBorder: true
      },
      {
        color: 'hsl(0, 75%, 60%)',
        label: 'Red'
      },
      {
        color: 'hsl(30, 75%, 60%)',
        label: 'Orange'
      },
      {
        color: 'hsl(60, 75%, 60%)',
        label: 'Yellow'
      },
      {
        color: 'hsl(90, 75%, 60%)',
        label: 'Light green'
      },
      {
        color: 'hsl(120, 75%, 60%)',
        label: 'Green'
      },
      {
        color: 'hsl(150, 75%, 60%)',
        label: 'Aquamarine'
      },
      {
        color: 'hsl(180, 75%, 60%)',
        label: 'Turquoise'
      },
      {
        color: 'hsl(210, 75%, 60%)',
        label: 'Light blue'
      },
      {
        color: 'hsl(240, 75%, 60%)',
        label: 'Blue'
      },
      {
        color: 'hsl(270, 75%, 60%)',
        label: 'Purple'
      }
    ]
  },
  
  fontBackgroundColor: {
    colors: [
      {
        color: 'hsl(0, 0%, 0%)',
        label: 'Black'
      },
      {
        color: 'hsl(0, 0%, 30%)',
        label: 'Dim grey'
      },
      {
        color: 'hsl(0, 0%, 60%)',
        label: 'Grey'
      },
      {
        color: 'hsl(0, 0%, 90%)',
        label: 'Light grey'
      },
      {
        color: 'hsl(0, 0%, 100%)',
        label: 'White',
        hasBorder: true
      },
      {
        color: 'hsl(0, 75%, 60%)',
        label: 'Red'
      },
      {
        color: 'hsl(30, 75%, 60%)',
        label: 'Orange'
      },
      {
        color: 'hsl(60, 75%, 60%)',
        label: 'Yellow'
      },
      {
        color: 'hsl(90, 75%, 60%)',
        label: 'Light green'
      },
      {
        color: 'hsl(120, 75%, 60%)',
        label: 'Green'
      },
      {
        color: 'hsl(150, 75%, 60%)',
        label: 'Aquamarine'
      },
      {
        color: 'hsl(180, 75%, 60%)',
        label: 'Turquoise'
      },
      {
        color: 'hsl(210, 75%, 60%)',
        label: 'Light blue'
      },
      {
        color: 'hsl(240, 75%, 60%)',
        label: 'Blue'
      },
      {
        color: 'hsl(270, 75%, 60%)',
        label: 'Purple'
      }
    ]
  },
  
  image: {
    toolbar: [
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'toggleImageCaption',
      'imageTextAlternative'
    ]
  },
  
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
  },
  
  ckfinder: {
    uploadUrl: '/api/upload-image'
  },
  
  // ✅ Cấu hình thêm cho editor
  placeholder: 'Nhập mô tả sản phẩm chi tiết...',
  
  // ✅ Cấu hình heading styles
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
    ]
  }
};


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

  useEffect(() => {
    if (!adminproducts?.length || !productSpecifications?.length) return;

    const product = adminproducts.find((p) => String(p.product_id) === id);
    if (product) {
      const initialFormData = {
        name: product.name || "",
        price: product.price || "",
        price_original: product.price_original || "",
        category_id: product.category_id || "",
        status: product.status === 0 ? "Hết hàng" : "Còn hàng",
        description: product.description || "",
        imageFile: null,
      };

      setFormData(initialFormData);
      
      // Format display values
      setDisplayValues({
        price: product.price ? formatPrice(product.price) : "",
        price_original: product.price_original ? formatPrice(product.price_original) : "",
      });
      
      setImagePreview(product.image_url || "");
    }

    const specs = productSpecifications.filter((spec) => String(spec.product_id) === id);
    setSpecificationsData(specs);
  }, [adminproducts, productSpecifications, id, formatPrice]);

  useEffect(() => {
    if ((ordersError || !adminOrders) && ordersLoadAttempted && !ordersLoading) {
      const retryTimer = setTimeout(() => {
        dispatch(fetchAdminOrders());
      }, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [ordersError, adminOrders, ordersLoadAttempted, ordersLoading, dispatch]);

  const currentProductVariants = useMemo(() => 
    variantAttributeValues?.filter((variant) => String(variant.product_id) === id) || [],
    [variantAttributeValues, id]
  );

  // ✅ File handling (giữ nguyên từ code gốc)
  const handleFileChange = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.");
        return;
      }
      
      setFormData((prev) => ({ ...prev, imageFile: selectedFile }));
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      toast.error("Vui lòng chọn file ảnh hợp lệ!");
    }
  }, []);

  const handleInputFileChange = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) {
      handleFileChange(selected);
    }
  }, [handleFileChange]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const removeImage = useCallback(() => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImagePreview("");
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
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
    
    const priceValidationError = validatePrices();
    if (priceValidationError) {
      toast.warning(priceValidationError);
      return;
    }
    
    if (!formData.category_id) {
      toast.warning("Vui lòng chọn danh mục");
      return;
    }

    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("price", formData.price); // Gửi số nguyên
    updatedData.append("price_original", formData.price_original || ""); // Gửi số nguyên
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
  }, [dispatch, formData, id, navigate, validatePrices]);

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

  const isLoading = loading || specsLoading || categoriesLoading || ordersLoading;
  const hasError = error || specsError || categoriesError;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="admineditproduct-container">
      {/* Header */}
      <div className="admineditproduct-header">
        <h1 className="admineditproduct-title">Chỉnh sửa sản phẩm</h1>
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
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4">
                <i className="bi bi-info-circle" /> Thông tin cơ bản
              </h4>
              <form onSubmit={handleSubmit} className="admineditproduct-form">
                <div className="row g-3">
                  {/* Cột trái - Thông tin sản phẩm */}
                  <div className="col-md-6">
                    {/* Tên sản phẩm */}
                    <div className="admineditproduct-form-group mb-3">
                      <label className="form-label fw-medium">
                        Tên sản phẩm <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Nhập tên sản phẩm..."
                      />
                    </div>

                    <div className="admineditproduct-form-group mb-3">
                      <label className="form-label fw-medium">
                        Giá khuyến mại (VNĐ) <span className="text-danger">*</span>
                      </label>
                      <div className="price-input-wrapper">
                        <input
                          type="text"
                          name="price"
                          value={displayValues.price}
                          onChange={handleInputChange}
                          onFocus={handlePriceFocus}
                          onBlur={handlePriceBlur}
                          required
                          className={`form-control price-input ${
                            formData.price && isValidPrice(formData.price) ? 'is-valid' : 
                            formData.price ? 'is-invalid' : ''
                          }`}
                          placeholder="0"
                          autoComplete="off"
                        />
                      </div>
                      {formData.price && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-calculator" /> Giá trị: <strong>{parseInt(formData.price, 10).toLocaleString('vi-VN')}₫</strong>
                        </small>
                      )}
                    </div>

                    <div className="admineditproduct-form-group mb-3">
                      <label className="form-label fw-medium">
                        Giá gốc (VNĐ)
                      </label>
                      <div className="price-input-wrapper">
                        <input
                          type="text"
                          name="price_original"
                          value={displayValues.price_original}
                          onChange={handleInputChange}
                          onFocus={handlePriceFocus}
                          onBlur={handlePriceBlur}
                          className={`form-control price-input ${
                            formData.price_original && isValidPrice(formData.price_original) ? 'is-valid' : 
                            formData.price_original ? 'is-invalid' : ''
                          }`}
                          placeholder="0"
                          autoComplete="off"
                        />
                      </div>
                      {formData.price_original && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-calculator" /> Giá trị: <strong>{parseInt(formData.price_original, 10).toLocaleString('vi-VN')}₫</strong>
                        </small>
                      )}
                      {formData.price && formData.price_original && (
                        <small className={`d-block mt-2 ${
                          parseInt(formData.price_original, 10) > parseInt(formData.price, 10) 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {parseInt(formData.price_original, 10) > parseInt(formData.price, 10)
                            ? <><i className="bi bi-check-circle" /> Tiết kiệm: <strong>{(parseInt(formData.price_original, 10) - parseInt(formData.price, 10)).toLocaleString('vi-VN')}₫</strong></>
                            : <><i className="bi bi-exclamation-triangle" /> Giá gốc phải lớn hơn giá khuyến mại</>
                          }
                        </small>
                      )}
                    </div>

                    <div className="admineditproduct-form-group mb-3">
                      <label className="form-label fw-medium">
                        Danh mục <span className="text-danger">*</span>
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        className="form-select"
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories?.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admineditproduct-form-group mb-3">
                      <label className="form-label fw-medium">Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="Còn hàng">Còn hàng</option>
                        <option value="Hết hàng">Hết hàng</option>
                      </select>
                    </div>
                  </div>

                  {/* Cột phải - Upload ảnh (giữ nguyên từ code gốc) */}
                  <div className="col-md-6">
                    <div className="admineditproduct-form-group image-upload-section">
                      <label className="form-label fw-medium mb-3">Ảnh sản phẩm:</label>
                      
                      <div 
                        className={`upload-area ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-image' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {imagePreview ? (
                          <div className="image-preview-container">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="preview-image"
                            />
                            <div className="image-overlay">
                              <div className="d-flex gap-2">
                                <button 
                                  type="button" 
                                  className="btn btn-primary btn-sm btn-change-image"
                                  onClick={() => document.getElementById('file-input').click()}
                                >
                                  <i className="bi bi-arrow-repeat" /> Thay đổi
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm btn-remove-image"
                                  onClick={removeImage}
                                >
                                  <i className="bi bi-trash" /> Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <div className="upload-icon text-muted mb-3">
                              <i className="bi bi-cloud-arrow-up"></i>
                            </div>
                            <p className="mb-2">
                              <strong>Kéo thả ảnh vào đây</strong> hoặc
                            </p>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm btn-select-file"
                              onClick={() => document.getElementById('file-input').click()}
                            >
                              <i className="bi bi-folder2-open" /> Chọn ảnh từ máy tính
                            </button>
                            <p className="text-muted mt-2 small">
                              Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleInputFileChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mô tả sản phẩm (giữ nguyên) */}
                <div className="row">
                  <div className="col-12">
                    <div className="description-section">
                      <label className="form-label fw-medium mb-3">Mô tả sản phẩm:</label>
                      <div className="ckeditor-wrapper">
                        <CKEditor
                          editor={ClassicEditor}
                          config={editorConfiguration}
                          data={formData.description}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            setFormData((prev) => ({ ...prev, description: data }));
                          }}
                          onReady={(editor) => {
                            editor.editing.view.change((writer) => {
                              writer.setStyle("min-height", "300px", editor.editing.view.document.getRoot());
                            });
                          }}
                        />
                      </div>
                    
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    type="submit" 
                    className="updateproduct1 "
                  >
                    <i className="bi bi-check-lg" /> Cập nhật sản phẩm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        
        {/* Thông số kỹ thuật */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">
                  <i className="bi bi-gear" /> Thông số kỹ thuật
                </h4>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddSpecForm(!showAddSpecForm)}
                >
                  <i className="bi bi-plus" /> Thêm thông số
                </button>
              </div>
              
              {/* Form thêm thông số mới */}
              {showAddSpecForm && (
                <div className="add-spec-form mb-4 p-3 border rounded bg-light">
                  <h5 className="mb-3">Thêm thông số mới</h5>
                  <form onSubmit={handleAddSpecification}>
                    <div className="row">
                      <div className="col-md-5 mb-3">
                        <label className="form-label">Tên thông số</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ví dụ: RAM, CPU, Màn hình..."
                          value={newSpec.spec_name}
                          onChange={(e) => setNewSpec((prev) => ({ ...prev, spec_name: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-5 mb-3">
                        <label className="form-label">Giá trị</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhập giá trị thông số"
                          value={newSpec.spec_value}
                          onChange={(e) => setNewSpec((prev) => ({ ...prev, spec_value: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end mb-3">
                        <div className="d-flex gap-2 w-100">
                          <button type="submit" className="btn btn-success">
                            <i className="bi bi-check-lg" /> Lưu
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setShowAddSpecForm(false);
                              setNewSpec({ spec_name: "", spec_value: "" });
                            }}
                          >
                            <i className="bi bi-x-lg" /> Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="specifications-list">
                {specificationsData.length > 0 ? (
                  <>
                    {specificationsData.map((spec, index) => (
                      <div
                        className="specification-item"
                        key={spec.spec_id || index}
                      >
                        <div className="row align-items-center">
                          <div className="col-md-4 mb-2">
                            <label className="form-label fw-medium">Tên thông số</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tên thông số"
                              value={spec.spec_name || ""}
                              onChange={(e) => handleSpecificationChange(index, "spec_name", e.target.value)}
                            />
                          </div>
                          <div className="col-md-6 mb-2">
                            <label className="form-label fw-medium">Giá trị thông số</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Giá trị"
                              value={spec.spec_value || ""}
                              onChange={(e) => handleSpecificationChange(index, "spec_value", e.target.value)}
                            />
                          </div>
                          <div className="col-md-2 d-flex align-items-end justify-content-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteSpecification(spec.spec_id)}
                              disabled={!spec.spec_id}
                            >
                              <i className="bi bi-trash" /> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-light border-top">
                      <button
                        type="button"
                        onClick={handleUpdateSpecifications}
                        className="btn btn-warning w-100"
                      >
                        <span style={{color:"white"}}> <i className="bi bi-save" /> Cập nhật tất cả thông số kỹ thuật</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-clipboard-data empty-icon" />
                    <p>Chưa có thông số kỹ thuật nào. Hãy thêm thông số mới!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biến thể sản phẩm */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">
                  <i className="bi bi-box-seam" /> Biến thể sản phẩm
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
                >
                  <i className="bi bi-plus" /> Thêm biến thể mới
                </Link>
              </div>
              
              <div className="variants-list">
                {currentProductVariants.length > 0 ? (
                  currentProductVariants.map((variant) => {
                    const isInOrder = canCheckOrderConstraints && checkVariantInOrders(variant.variant_id);
                    
                    return (
                      <div
                        key={variant.variant_id}
                        data-variant-id={variant.variant_id}
                        className="variant-item"
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
                  <div className="text-center py-5">
                    <i className="bi bi-box-seam empty-icon" />
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
