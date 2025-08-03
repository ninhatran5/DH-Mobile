import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAdminProduct } from "../../slices/adminproductsSlice";
import { addAdminProductSpecification } from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/admin/AddProduct.css";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { fetchAttributes } from "../../slices/Attribute";
import { addAdminProductVariant } from "../../slices/AdminProductVariants";
import { addVariantAttributeValue } from "../../slices/variantAttributeValueSlice";
import Loading from "../../components/Loading";
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaImage, 
  FaChevronDown, 
  FaChevronUp,
  FaSave,
  FaTimes
} from "react-icons/fa";

const AdminAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { loading: productLoading, error: productError } = useSelector((state) => state.adminproduct);
  const { loading: specLoading, error: specError } = useSelector((state) => state.adminProductSpecifications);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    price_original: "",
    status: 0,
  });

  const { attributeValues } = useSelector(state => state.attributeValue || {});
  const { attributes } = useSelector(state => state.attribute || {});
  
  const [variantFormData, setVariantFormData] = useState({
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });
  
  useEffect(() => {
    dispatch(fetchAttributeValues());
    dispatch(fetchAttributes());
    dispatch(fetchCategories());
  }, [dispatch]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantExpanded, setVariantExpanded] = useState([]);
  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [specifications, setSpecifications] = useState([{ spec_name: "", spec_value: "" }]);

  // ========== FORMAT UTILITIES ==========
  const formatNumber = (value) => {
    if (!value) return '';
    // Chuyển về string và loại bỏ tất cả ký tự không phải số
    const numericValue = value.toString().replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    
    // Format với dấu chấm phân cách hàng nghìn
    return parseInt(numericValue).toLocaleString('vi-VN');
  };

  const parseNumber = (formattedValue) => {
    if (!formattedValue) return '';
    // Loại bỏ dấu chấm và trả về số thuần
    return formattedValue.replace(/\./g, '');
  };

  // ========== NUMERIC INPUT HANDLERS ==========
  const handleNumericInput = (e, fieldName) => {
    const { value } = e.target;
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Lưu giá trị thuần (không format) vào state
    setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
    
    // Clear error khi user nhập
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleVariantNumericInput = (e, fieldName) => {
    const { value } = e.target;
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Lưu giá trị thuần (không format) vào state
    setVariantFormData(prev => ({ ...prev, [fieldName]: numericValue }));
    
    // Clear variant error khi user nhập
    if (variantErrors[fieldName]) {
      setVariantErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const handleBack = () => {
    navigate("/admin/product");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  // ========== VARIANT IMAGE FUNCTIONS ==========
  const handleVariantImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVariantFormData((prev) => ({ ...prev, image_url: file }));
      setVariantImagePreview(URL.createObjectURL(file));
    }
  };

  const removeVariantImage = () => {
    if (variantImagePreview) {
      URL.revokeObjectURL(variantImagePreview);
    }
    setVariantFormData((prev) => ({ ...prev, image_url: "" }));
    setVariantImagePreview(null);
  };

  // ========== SPECIFICATION FUNCTIONS ==========
  const handleSpecChange = (index, e) => {
    const { name, value } = e.target;
    const newSpecs = [...specifications];
    newSpecs[index][name] = value;
    setSpecifications(newSpecs);
    
    // Clear error
    if (errors[`${name}_${index}`]) {
      setErrors(prev => ({ ...prev, [`${name}_${index}`]: null }));
    }
  };

  const addSpecField = () => {
    setSpecifications([...specifications, { spec_name: "", spec_value: "" }]);
  };

  const removeSpecField = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // ========== VARIANT FUNCTIONS ==========
  const handleVariantInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVariantFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  const handleAttributeChange = (attributeId, value_id) => {
    if (!attributeId || !value_id) return;

    const selectedValue = attributeValues[attributeId]?.find(
      av => String(av.value_id) === String(value_id)
    );
    const attribute = attributes.find(attr => String(attr.attribute_id) === String(attributeId));
    if (!selectedValue || !attribute) return;

    setVariantFormData(prev => {
      const newAttributes = [...(prev.attributes || [])];
      const existingIndex = newAttributes.findIndex(
        attr => String(attr.attribute_id) === String(attributeId)
      );
      const newAttribute = {
        attribute_id: parseInt(attributeId),
        value_id: parseInt(value_id),
        name: attribute.name,
        value: selectedValue.value
      };
      if (existingIndex !== -1) {
        newAttributes[existingIndex] = newAttribute;
      } else {
        newAttributes.push(newAttribute);
      }
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleAddVariant = () => {
    if (variants.length >= 3) {
      toast.warning('Chỉ có thể thêm tối đa 3 biến thể.');
      return;
    }
    setShowVariantForm(true);
    // Reset variant errors khi mở form mới
    setVariantErrors({});
  };

  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();

    const newVariantErrors = {};

    // Validation SKU
    if (!variantFormData.sku.trim()) {
      newVariantErrors.sku = 'SKU không được để trống';
    } else if (variants.some(v => v.sku.trim().toLowerCase() === variantFormData.sku.trim().toLowerCase())) {
      newVariantErrors.sku = 'SKU đã tồn tại trong danh sách biến thể!';
    }
    
    // Validation giá bán
    if (!variantFormData.price || isNaN(Number(variantFormData.price)) || Number(variantFormData.price) <= 0) {
      newVariantErrors.price = 'Giá bán phải là số dương hợp lệ';
    }
    
    // Validation giá gốc  
    if (!variantFormData.price_original || isNaN(Number(variantFormData.price_original)) || Number(variantFormData.price_original) <= 0) {
      newVariantErrors.price_original = 'Giá gốc phải là số dương hợp lệ';
    }
    
    // Validation giá bán < giá gốc cho biến thể
    if (
      variantFormData.price &&
      variantFormData.price_original &&
      !isNaN(Number(variantFormData.price)) &&
      !isNaN(Number(variantFormData.price_original)) &&
      Number(variantFormData.price) >= Number(variantFormData.price_original)
    ) {
      newVariantErrors.price = 'Giá bán phải nhỏ hơn giá gốc';
    }
    
    // Validation tồn kho
    if (variantFormData.stock === '' || isNaN(Number(variantFormData.stock)) || Number(variantFormData.stock) < 0) {
      newVariantErrors.stock = 'Số lượng tồn kho phải là số không âm';
    }
    
    // Validation thuộc tính
    if (!variantFormData.attributes || variantFormData.attributes.length === 0) {
      newVariantErrors.attributes = 'Vui lòng chọn thuộc tính cho biến thể';
    }

    // Kiểm tra có lỗi không
    if (Object.keys(newVariantErrors).length > 0) {
      setVariantErrors(newVariantErrors);
      toast.error('Vui lòng kiểm tra lại thông tin biến thể.');
      return;
    }

    // Thêm biến thể vào danh sách
    setVariants([...variants, variantFormData]);
    setVariantFormData({
      sku: '', price: '', price_original: '', stock: 0, image_url: '', is_active: 1, attributes: []
    });
    
    // Reset image preview
    if (variantImagePreview) {
      URL.revokeObjectURL(variantImagePreview);
    }
    setVariantImagePreview(null);
    
    // Reset errors
    setVariantErrors({});
    setShowVariantForm(false);
    toast.success('Biến thể đã được thêm vào danh sách.');
  };

  const cancelVariantForm = () => {
    if (variantImagePreview) {
      URL.revokeObjectURL(variantImagePreview);
    }
    setVariantImagePreview(null);
    setVariantFormData({
      sku: '', price: '', price_original: '', stock: 0, image_url: '', is_active: 1, attributes: []
    });
    setVariantErrors({});
    setShowVariantForm(false);
  };

  const toggleVariantExpand = (index) => {
    setVariantExpanded((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const handleDeleteVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // ========== MAIN SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    
    // Basic validations
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục.';
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên sản phẩm.';
    if (!formData.description) newErrors.description = 'Vui lòng nhập mô tả.';
    
    // Numeric validations với kiểm tra chính xác hơn
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Giá bán phải là số dương hợp lệ.';
    }
    
    if (!formData.price_original || isNaN(Number(formData.price_original)) || Number(formData.price_original) <= 0) {
      newErrors.price_original = 'Giá gốc phải là số dương hợp lệ.';
    }
    
    if (!imageFile) newErrors.image = 'Vui lòng chọn ảnh sản phẩm.';

    // Validate giá bán < giá gốc với kiểm tra số chính xác hơn
    if (
      formData.price &&
      formData.price_original &&
      !isNaN(Number(formData.price)) &&
      !isNaN(Number(formData.price_original)) &&
      Number(formData.price) >= Number(formData.price_original)
    ) {
      newErrors.price = 'Giá bán phải nhỏ hơn giá gốc.';
    }

    // Validation cho specifications
    specifications.forEach((spec, index) => {
      if (!spec.spec_name.trim()) newErrors[`spec_name_${index}`] = 'Vui lòng nhập tên thông số.';
      if (!spec.spec_value.trim()) newErrors[`spec_value_${index}`] = 'Vui lòng nhập giá trị thông số.';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (imageFile) {
      form.append('image_url', imageFile);
    }

    try {
      const resultAction = await dispatch(addAdminProduct(form)).unwrap();
      const newProductId = resultAction.product_id;

      for (const spec of specifications) {
        await dispatch(addAdminProductSpecification({
          product_id: newProductId,
          spec_name: spec.spec_name,
          spec_value: spec.spec_value,
        })).unwrap();
      }

      for (const variant of variants) {
        const variantData = {
          ...variant,
          product_id: newProductId
        };
        let variantResponse;
        if (variant.image_url instanceof File) {
          const imageFormData = new FormData();
          imageFormData.append('image_url', variant.image_url);
          Object.entries(variantData).forEach(([key, value]) => {
            imageFormData.append(key, value);
          });
          variantResponse = await dispatch(addAdminProductVariant(imageFormData)).unwrap();
        } else {
          variantResponse = await dispatch(addAdminProductVariant(variantData)).unwrap();
        }

        const variant_id = variantResponse?.variant_id;
        if (!variant_id) throw new Error('Không nhận được ID biến thể');

        for (const attr of variant.attributes) {
          await dispatch(addVariantAttributeValue({
            variant_id,
            attribute_id: parseInt(attr.attribute_id),
            value_id: parseInt(attr.value_id)
          })).unwrap();
        }
      }

      toast.success('Thêm sản phẩm và biến thể thành công!');
      setFormData({
        category_id: '',
        name: '',
        description: '',
        price: '',
        price_original: '',
        status: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setSpecifications([{ spec_name: '', spec_value: '' }]);
      setVariants([]);
      navigate('/admin/product');
    } catch (error) {
      toast.error(error || 'Lỗi khi thêm sản phẩm.');
    }
  };

  return (
    <>
      {(productLoading || specLoading) && <Loading />}
      <div className="admin-add-product-container">
        {/* Header */}
        <div className="admin-add-product-header">
          <button
            type="button"
            onClick={handleBack}
            className="admin-back-btn"
          >
            <FaArrowLeft />
            <span>Quay lại</span>
          </button>
          <h2 className="admin-add-product-title">Thêm sản phẩm mới</h2>
        </div>

        {/* Error Alert */}
        {(productError || specError) && (
          <div className="admin-alert-error">
            {productError || specError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-add-product-form">
          <div className="admin-form-grid">
            {/* Left Column - Basic Info */}
            <div className="admin-form-section">
              <h3 className="admin-section-title">Thông tin cơ bản</h3>
              
              {/* Category */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Danh mục
                  <span className="required1">*</span>
                </label>
                {categoryLoading ? (
                  <div className="admin-loading-text">Đang tải danh mục...</div>
                ) : (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={`admin-form-select ${errors.category_id ? 'error' : ''}`}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                  </select>
                )}
                {errors.category_id && <div className="admin-error-message">{errors.category_id}</div>}
              </div>

              {/* Product Name */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Tên sản phẩm
                  <span className="required1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <div className="admin-error-message">{errors.name}</div>}
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Mô tả
                  <span className="required1">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả sản phẩm"
                  className={`admin-form-textarea ${errors.description ? 'error' : ''}`}
                  rows="4"
                />
                {errors.description && <div className="admin-error-message">{errors.description}</div>}
              </div>

              {/* Price Row - AUTO FORMAT */}
              <div className="admin-price-container">
                <div className="admin-price-field">
                  <label className="admin-form-label">
                    Giá bán
                    <span className="required1">*</span>
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formatNumber(formData.price)}
                    onChange={(e) => handleNumericInput(e, 'price')}
                    className={`admin-form-input admin-numeric-input ${errors.price ? 'error' : ''}`}
                    placeholder="0"
                    inputMode="numeric"
                  />
                  {errors.price && <div className="admin-error-message">{errors.price}</div>}
                </div>
                <div className="admin-price-field">
                  <label className="admin-form-label">
                    Giá gốc
                    <span className="required1">*</span>
                  </label>
                  <input
                    type="text"
                    name="price_original"
                    value={formatNumber(formData.price_original)}
                    onChange={(e) => handleNumericInput(e, 'price_original')}
                    className={`admin-form-input admin-numeric-input ${errors.price_original ? 'error' : ''}`}
                    placeholder="0"
                    inputMode="numeric"
                  />
                  {errors.price_original && <div className="admin-error-message">{errors.price_original}</div>}
                </div>
              </div>

              {/* Image Upload */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Ảnh sản phẩm
                  <span className="required1">*</span>
                </label>
                <div className={`admin-image-upload ${errors.image ? 'error' : ''}`}>
                  {!imagePreview ? (
                    <label className="admin-upload-area">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <div className="admin-upload-content">
                        <FaImage size={32} />
                        <span>Chọn ảnh sản phẩm</span>
                        <small>JPG, PNG, GIF (tối đa 5MB)</small>
                      </div>
                    </label>
                  ) : (
                    <div className="admin-image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button"
                        className="admin-remove-image"
                        onClick={removeImage}
                      >
                       x
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && <div className="admin-error-message">{errors.image}</div>}
              </div>
            </div>

            {/* Right Column - Specifications & Variants */}
            <div className="admin-form-section">
              <h3 className="admin-section-title">Thông số & Biến thể</h3>
              
              {/* Specifications */}
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Thông số kỹ thuật
                  <span className="required1">*</span>
                </label>
                <div className="admin-specifications">
                  {specifications.map((spec, index) => (
                    <div key={index} className="admin-spec-row">
                      <div className="admin-spec-inputs">
                        <input
                          type="text"
                          name="spec_name"
                          placeholder="Tên thông số"
                          value={spec.spec_name}
                          onChange={(e) => handleSpecChange(index, e)}
                          className={`admin-form-input ${errors[`spec_name_${index}`] ? 'error' : ''}`}
                        />
                        <input
                          type="text"
                          name="spec_value"
                          placeholder="Giá trị"
                          value={spec.spec_value}
                          onChange={(e) => handleSpecChange(index, e)}
                          className={`admin-form-input ${errors[`spec_value_${index}`] ? 'error' : ''}`}
                        />
                      </div>
                      {specifications.length > 1 && (
                        <button
                          type="button"
                          className="admin-remove-spec-btn"
                          onClick={() => removeSpecField(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                      {(errors[`spec_name_${index}`] || errors[`spec_value_${index}`]) && (
                        <div className="admin-error-message">
                          {errors[`spec_name_${index}`] || errors[`spec_value_${index}`]}
                        </div>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="admin-add-spec-btn" 
                    onClick={addSpecField}
                  >
                    <FaPlus />
                    <span>Thêm thông số</span>
                  </button>
                </div>
              </div>

              {/* Variants */}
              <div className="admin-form-group">
                <label className="admin-form-label">Biến thể sản phẩm</label>
                
                {/* Variant List */}
                {variants.map((variant, index) => (
                  <div key={index} className="admin-variant-item">
                    <div className="admin-variant-header">
                      <span className="admin-variant-title">Biến thể {index + 1}</span>
                      <div className="admin-variant-actions">
                        <button 
                          type="button" 
                          className="admin-variant-toggle"
                          onClick={() => toggleVariantExpand(index)}
                        >
                          {variantExpanded[index] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        <button
                          type="button"
                          className="admin-variant-delete"
                          onClick={() => handleDeleteVariant(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {variantExpanded[index] && (
                      <div className="admin-variant-details">
                        <div className="admin-variant-info">
                          <span><strong>SKU:</strong> {variant.sku}</span>
                          <span><strong>Giá:</strong> {formatNumber(variant.price)}đ</span>
                          <span><strong>Giá gốc:</strong> {formatNumber(variant.price_original)}đ</span>
                          <span><strong>Tồn kho:</strong> {formatNumber(variant.stock)}</span>
                        </div>
                        
                        {/* Hiển thị ảnh nếu có */}
                        {variant.image_url && (
                          <div className="admin-variant-image-display">
                            <strong>Ảnh biến thể:</strong>
                            <img 
                              src={variant.image_url instanceof File ? URL.createObjectURL(variant.image_url) : variant.image_url} 
                              alt="Variant" 
                              className="admin-variant-thumbnail"
                            />
                          </div>
                        )}
                        
                        <div className="admin-variant-attributes">
                          <strong>Thuộc tính:</strong>
                          {variant.attributes.map((attr, i) => (
                            <span key={i} className="admin-attribute-tag">
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button 
                  type="button" 
                  className="admin-add-variant-btn" 
                  onClick={handleAddVariant}
                  disabled={variants.length >= 3}
                >
                  <FaPlus />
                  <span>Thêm biến thể ({variants.length}/3)</span>
                </button>

                {/* Variant Form */}
                {showVariantForm && (
                  <div className="admin-variant-form">
                    <h4 className="admin-variant-form-title">Thêm biến thể mới</h4>
                    <div className="admin-variant-grid">
                      <div className="admin-variant-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">SKU</label>
                          <input 
                            className={`admin-form-input ${variantErrors.sku ? 'error' : ''}`}
                            name="sku" 
                            value={variantFormData.sku} 
                            onChange={handleVariantInputChange} 
                            placeholder="Mã SKU"
                          />
                          {variantErrors.sku && <div className="admin-error-message">{variantErrors.sku}</div>}
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Tồn kho</label>
                          <input 
                            type="text"
                            className={`admin-form-input admin-numeric-input ${variantErrors.stock ? 'error' : ''}`}
                            name="stock" 
                            value={formatNumber(variantFormData.stock)}
                            onChange={(e) => handleVariantNumericInput(e, 'stock')}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          {variantErrors.stock && <div className="admin-error-message">{variantErrors.stock}</div>}
                        </div>
                      </div>
                      <div className="admin-variant-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Giá bán</label>
                          <input 
                            type="text"
                            className={`admin-form-input admin-numeric-input ${variantErrors.price ? 'error' : ''}`}
                            name="price" 
                            value={formatNumber(variantFormData.price)}
                            onChange={(e) => handleVariantNumericInput(e, 'price')}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          {variantErrors.price && <div className="admin-error-message">{variantErrors.price}</div>}
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Giá gốc</label>
                          <input 
                            type="text"
                            className={`admin-form-input admin-numeric-input ${variantErrors.price_original ? 'error' : ''}`}
                            name="price_original" 
                            value={formatNumber(variantFormData.price_original)}
                            onChange={(e) => handleVariantNumericInput(e, 'price_original')}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          {variantErrors.price_original && <div className="admin-error-message">{variantErrors.price_original}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Image Upload trong Variant Form */}
                    <div className="admin-form-group">
                      <label className="admin-form-label">Ảnh biến thể</label>
                      <div className="admin-variant-image-upload">
                        {!variantImagePreview ? (
                          <label className="admin-variant-upload-area">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleVariantImageChange}
                              style={{ display: 'none' }}
                            />
                            <div className="admin-variant-upload-content">
                              <FaImage size={24} />
                              <span>Chọn ảnh biến thể</span>
                              <small>JPG, PNG, GIF (tối đa 5MB)</small>
                            </div>
                          </label>
                        ) : (
                          <div className="admin-variant-image-preview">
                            <img src={variantImagePreview} alt="Variant Preview" />
                            <button 
                              type="button"
                              className="admin-remove-variant-image"
                              onClick={removeVariantImage}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Thuộc tính</label>
                      <div className="admin-attributes-grid">
                        {attributes.map(attribute => (
                          <div key={attribute.attribute_id} className="admin-attribute-group">
                            <label className="admin-attribute-label">{attribute.name}</label>
                            <select
                              className="admin-form-select"
                              onChange={(e) => handleAttributeChange(attribute.attribute_id, e.target.value)}
                              value={
                                variantFormData.attributes.find(a => a.attribute_id === attribute.attribute_id)?.value_id || ''
                              }
                            >
                              <option value="">-- Chọn {attribute.name} --</option>
                              {attributeValues[attribute.attribute_id]?.map(val => (
                                <option key={val.value_id} value={val.value_id}>{val.value}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      {variantErrors.attributes && <div className="admin-error-message">{variantErrors.attributes}</div>}
                    </div>

                    <div className="admin-variant-form-actions">
                      <button 
                        className="admin-btn admin-btn-primary" 
                        type="button" 
                        onClick={handleAddVariantSubmit}
                      >
                        <FaSave />
                        <span>Lưu biến thể</span>
                      </button>
                      <button 
                        className="admin-btn admin-btn-secondary" 
                        type="button" 
                        onClick={cancelVariantForm}
                      >
                        <FaTimes />
                        <span>Hủy</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="admin-form-submit">
            <button
              type="submit"
              className="admin-submit-btn"
              disabled={productLoading || specLoading}
            >
              {(productLoading || specLoading) ? (
                <>
                  <div className="admin-spinner"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Thêm sản phẩm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAddProduct;
