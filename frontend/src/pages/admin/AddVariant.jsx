import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { addAdminProductVariant } from "../../slices/AdminProductVariants";
import { fetchAttributes } from "../../slices/Attribute";
import { addVariantAttributeValue } from "../../slices/variantAttributeValueSlice";
import "../../assets/admin/addvariant.css";
import Loading from "../../components/Loading";

const AddVariant = () => {
  const { product_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { attributeValues, loading: attributeValuesLoading } = useSelector(
    (state) => state.attributeValue || {}
  );
  const { attributes, loading: attributesLoading } = useSelector(
    (state) => state.attribute
  );

  const [formData, setFormData] = useState({
    product_id: parseInt(product_id, 10),
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });

  const [errors, setErrors] = useState({
    sku: '',
    price: '',
    price_original: '',
    stock: '',
    attributes: '',
    image: ''
  });

  // State cho display values (đã format)
  const [displayValues, setDisplayValues] = useState({
    price: "",
    price_original: "",
    stock: "0"
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!product_id || isNaN(parseInt(product_id, 10))) {
      toast.error("ID sản phẩm không hợp lệ");
      navigate("/admin/product");
      return;
    }
    dispatch(fetchAttributeValues());
    dispatch(fetchAttributes());
  }, [dispatch, product_id, navigate]);

  // Cleanup preview URL khi component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Hàm format số thành chuỗi có dấu chấm phân cách
  const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    
    // Chuyển thành string và loại bỏ ký tự không phải số và dấu chấm
    const numStr = value.toString().replace(/[^\d.]/g, '');
    
    // Tách phần nguyên và phần thập phân
    const parts = numStr.split('.');
    
    // Format phần nguyên với dấu chấm phân cách hàng nghìn
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Trả về kết quả
    return parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
  };

  // Hàm chuyển chuỗi đã format về số
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return '';
    
    // Loại bỏ dấu chấm phân cách hàng nghìn và thay dấu phẩy thành dấu chấm thập phân
    return formattedValue.replace(/\./g, '').replace(',', '.');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else if (name === 'price' || name === 'price_original' || name === 'stock') {
      // Xử lý đặc biệt cho các trường số
      handleNumberInputChange(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Xóa error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberInputChange = (fieldName, value) => {
    // Loại bỏ tất cả ký tự không phải số, dấu chấm và dấu phẩy
    let cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Xử lý cho stock (chỉ số nguyên)
    if (fieldName === 'stock') {
      cleanValue = cleanValue.replace(/[.,]/g, '');
      const numericValue = cleanValue === '' ? 0 : parseInt(cleanValue, 10);
      
      setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
      setDisplayValues(prev => ({ ...prev, [fieldName]: formatNumber(numericValue) }));
    } else {
      // Xử lý cho price và price_original (có thể có phần thập phân)
      // Chỉ cho phép một dấu phẩy (thập phân)
      const parts = cleanValue.split(',');
      if (parts.length > 2) {
        cleanValue = parts[0] + ',' + parts[1];
      }
      
      const numericValue = parseFormattedNumber(cleanValue);
      
      setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
      setDisplayValues(prev => ({ ...prev, [fieldName]: cleanValue }));
    }
  };

  // Xử lý file upload và tạo preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }

    // Kiểm tra loại file
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WebP)');
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Cleanup URL cũ nếu có
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Tạo URL preview mới
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFormData(prev => ({ ...prev, image_url: file }));

    // Xóa error nếu có
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
    
    // Reset input file
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleAttributeChange = (attributeId, value_id) => {
    if (!attributeId || !value_id) return;

    try {
      const selectedValue = attributeValues[attributeId]?.find(
        av => String(av.value_id) === String(value_id)
      );
      if (!selectedValue) return;

      const attribute = attributes.find(
        attr => String(attr.attribute_id) === String(attributeId)
      );
      if (!attribute) return;

      setFormData(prev => {
        const newAttributes = [...(prev.attributes || [])];
        const existingIndex = newAttributes.findIndex(
          attr => String(attr.attribute_id) === String(attributeId)
        );

        const newAttribute = {
          attribute_id: parseInt(attributeId, 10),
          value_id: parseInt(value_id, 10),
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
      
      // Xóa error thuộc tính
      if (errors.attributes) {
        setErrors(prev => ({ ...prev, attributes: '' }));
      }
    } catch (error) {
      console.error('Error handling attribute change:', error);
      toast.error('Có lỗi khi cập nhật thuộc tính');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU không được để trống";
    }
    
    if (!formData.price || isNaN(formData.price)) {
      newErrors.price = "Giá bán không hợp lệ";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0";
    }

    // Validation cho giá gốc
    if (formData.price_original) {
      if (isNaN(formData.price_original)) {
        newErrors.price_original = "Giá gốc không hợp lệ";
      } else if (parseFloat(formData.price_original) <= 0) {
        newErrors.price_original = "Giá gốc phải lớn hơn 0";
      } else if (formData.price && parseFloat(formData.price_original) >= parseFloat(formData.price)) {
        newErrors.price_original = "Giá gốc phải nhỏ hơn giá bán";
      }
    }
    
    if (isNaN(formData.stock)) {
      newErrors.stock = "Số lượng tồn kho không hợp lệ";
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = "Số lượng tồn kho không được âm";
    }

    // Validation cho ảnh
    if (!formData.image_url) {
      newErrors.image = "Vui lòng chọn ảnh cho biến thể";
    }
    
    if (!formData.attributes || formData.attributes.length === 0) {
      newErrors.attributes = "Vui lòng chọn thuộc tính cho biến thể";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setIsSubmitting(true);
    
    try {
      toast.info("Đang tạo biến thể...");
      
      const variantData = {
        product_id: parseInt(product_id, 10),
        sku: formData.sku,
        price: parseFloat(formData.price),
        price_original: formData.price_original ? parseFloat(formData.price_original) : null,
        stock: parseInt(formData.stock, 10),
        is_active: formData.is_active
      };

      let variantResponse;

      if (formData.image_url instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('image_url', formData.image_url);
        Object.entries(variantData).forEach(([key, value]) => {
          imageFormData.append(key, value);
        });
        
        variantResponse = await dispatch(addAdminProductVariant(imageFormData)).unwrap();
      } else {
        variantResponse = await dispatch(addAdminProductVariant(variantData)).unwrap();
      }

      if (!variantResponse || !variantResponse.variant_id) {
        throw new Error('Không nhận được ID biến thể từ server');
      }

      // Thêm thuộc tính cho biến thể
      toast.info("Đang thêm thuộc tính...");
      for (const attr of formData.attributes) {
        const singleAttributeData = {
          variant_id: variantResponse.variant_id,
          attribute_id: parseInt(attr.attribute_id, 10),
          value_id: parseInt(attr.value_id, 10)
        };
        await dispatch(addVariantAttributeValue(singleAttributeData)).unwrap();
      }

      toast.success("Thêm biến thể thành công!");
      navigate(`/admin/editproduct/${product_id}`);
    } catch (err) {
      console.error('Error creating variant:', err);
      toast.error("Lỗi: " + (err.response?.data?.message || err.message || "Đã có lỗi xảy ra"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị loading khi đang submit
  if (isSubmitting) {
    return (
      <div className="adminAddVariant3">
        <Loading />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Đang tạo biến thể...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adminAddVariant3">
      <div className="adminAddVariant3__card">
        <div className="adminAddVariant3__card-body">
          <div className="adminAddVariant3__header">
            <h2 className="adminAddVariant3__title">Thêm biến thể mới</h2>
            <button
              type="button"
              className="adminAddVariant3__back-btn"
              onClick={() => navigate(`/admin/editproduct/${product_id}`)}
              disabled={isSubmitting}
            >
              <i className="bi bi-arrow-left"></i> Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="adminAddVariant3__form">
            <div className="adminAddVariant3__form-group">
              <label htmlFor="sku" className="adminAddVariant3__label">
                SKU <span className="adminAddVariant3__required">*</span>
              </label>
              <input
                type="text"
                className={`adminAddVariant3__input ${errors.sku ? 'adminAddVariant3__input--error' : ''}`}
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Nhập mã SKU..."
                disabled={isSubmitting}
              />
              {errors.sku && <div className="adminAddVariant3__error-message">{errors.sku}</div>}
            </div>

            <div className="adminAddVariant3__form-group">
              <label htmlFor="price" className="adminAddVariant3__label">
                Giá bán <span className="adminAddVariant3__required">*</span>
              </label>
              <div className="adminAddVariant3__input-wrapper">
                <input
                  type="text"
                  className={`adminAddVariant3__input ${errors.price ? 'adminAddVariant3__input--error' : ''}`}
                  id="price"
                  name="price"
                  value={displayValues.price}
                  onChange={handleInputChange}
                  placeholder="Nhập giá bán..."
                  disabled={isSubmitting}
                />
                <span className="adminAddVariant3__currency">VNĐ</span>
              </div>
              {errors.price && <div className="adminAddVariant3__error-message">{errors.price}</div>}
            </div>

            <div className="adminAddVariant3__form-group">
              <label htmlFor="price_original" className="adminAddVariant3__label">
                Giá gốc
              </label>
              <div className="adminAddVariant3__input-wrapper">
                <input
                  type="text"
                  className={`adminAddVariant3__input ${errors.price_original ? 'adminAddVariant3__input--error' : ''}`}
                  id="price_original"
                  name="price_original"
                  value={displayValues.price_original}
                  onChange={handleInputChange}
                  placeholder="Nhập giá gốc (phải nhỏ hơn giá bán)..."
                  disabled={isSubmitting}
                />
                <span className="adminAddVariant3__currency">VNĐ</span>
              </div>
              {errors.price_original && <div className="adminAddVariant3__error-message">{errors.price_original}</div>}
            
            </div>

            <div className="adminAddVariant3__form-group">
              <label htmlFor="stock" className="adminAddVariant3__label">
                Tồn kho <span className="adminAddVariant3__required">*</span>
              </label>
              <div className="adminAddVariant3__input-wrapper">
                <input
                  type="text"
                  className={`adminAddVariant3__input ${errors.stock ? 'adminAddVariant3__input--error' : ''}`}
                  id="stock"
                  name="stock"
                  value={displayValues.stock}
                  onChange={handleInputChange}
                  placeholder="Nhập số lượng tồn kho..."
                  disabled={isSubmitting}
                />
                <span className="adminAddVariant3__currency">sản phẩm</span>
              </div>
              {errors.stock && <div className="adminAddVariant3__error-message">{errors.stock}</div>}
            </div>

            {/* Upload ảnh với preview tích hợp */}
            <div className="adminAddVariant3__form-group">
              <label htmlFor="image" className="adminAddVariant3__label">
                Ảnh <span className="adminAddVariant3__required">*</span>
              </label>
              
              <div className={`adminAddVariant3__file-upload ${imagePreview ? 'adminAddVariant3__file-upload--has-image' : ''} ${errors.image ? 'adminAddVariant3__file-upload--error' : ''}`}>
                <input
                  type="file"
                  className="adminAddVariant3__file-input"
                  id="image"
                  accept="image/*"
                  disabled={isSubmitting}
                  onChange={handleImageChange}
                />
                
                {imagePreview ? (
                  /* Hiển thị preview ảnh */
                  <div className="adminAddVariant3__preview-content">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="adminAddVariant3__preview-image"
                    />
                    <div className="adminAddVariant3__preview-overlay">
                      <button
                        type="button"
                        className="adminAddVariant3__remove-image"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        title="Xóa ảnh"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      <div className="adminAddVariant3__change-text">
                        <i className="bi bi-camera"></i>
                        <span>Thay đổi ảnh</span>
                      </div>
                    </div>
                    <div className="adminAddVariant3__image-info">
                      <span className="adminAddVariant3__image-name">
                        {formData.image_url?.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Hiển thị placeholder khi chưa có ảnh */
                  <div className="adminAddVariant3__file-placeholder">
                    <div className="adminAddVariant3__file-icon">📷</div>
                    <div className="adminAddVariant3__file-text">
                      Chọn ảnh cho biến thể
                    </div>
                    <small className="adminAddVariant3__file-hint">
                      Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)
                    </small>
                  </div>
                )}
              </div>
              
              {errors.image && <div className="adminAddVariant3__error-message">{errors.image}</div>}
            </div>

            <div className="adminAddVariant3__attributes-section">
              <label className="adminAddVariant3__label adminAddVariant3__label--bold">
                Thuộc tính <span className="adminAddVariant3__required">*</span>
              </label>
              {attributesLoading ? (
                <div className="adminAddVariant3__loading">
                  <div className="adminAddVariant3__spinner"></div>
                  <span>Đang tải thuộc tính...</span>
                </div>
              ) : attributes && attributes.length > 0 ? (
                attributes.map(attribute => (
                  <div className="adminAddVariant3__form-group" key={attribute.attribute_id}>
                    <label className="adminAddVariant3__label">{attribute.name}:</label>
                    <select
                      className={`adminAddVariant3__select ${errors.attributes ? 'adminAddVariant3__select--error' : ''}`}
                      onChange={(e) => handleAttributeChange(attribute.attribute_id, e.target.value)}
                      value={formData.attributes.find(
                        attr => String(attr.attribute_id) === String(attribute.attribute_id)
                      )?.value_id || ""}
                      disabled={isSubmitting}
                    >
                      <option value="">-- Chọn {attribute.name} --</option>
                      {attributeValues[attribute.attribute_id]?.map((value) => (
                        <option key={value.value_id} value={value.value_id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <div className="adminAddVariant3__no-attributes">
                  Không có thuộc tính nào được định nghĩa
                </div>
              )}
              {errors.attributes && <div className="adminAddVariant3__error-message">{errors.attributes}</div>}
            </div>

            <div className="adminAddVariant3__actions">
              <button 
                type="submit" 
                className="adminAddVariant3__submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang thêm...
                  </>
                ) : (
                  'Thêm biến thể'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVariant;
