import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { updateAdminProductVariant } from "../../slices/AdminProductVariants";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { fetchAttributes } from "../../slices/Attribute";
import { fetchVariantAttributeValues, updateVariantAttributeValue } from "../../slices/variantAttributeValueSlice";

const UpdateVariant = () => {
  const { variant_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { attributeValues, loading: attributeValuesLoading } = useSelector(
    (state) => state.attributeValue
  );
  const { attributes, loading: attributesLoading } = useSelector(
    (state) => state.attribute
  );
  const { variantAttributeValues, loading: variantLoading } = useSelector(
    (state) => state.variantAttributeValue
  );

  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (variant_id) {
      dispatch(fetchVariantAttributeValues());
      dispatch(fetchAttributeValues());
      dispatch(fetchAttributes());
    } else {
      navigate('/admin/product');
    }
  }, [dispatch, variant_id, navigate]);

  useEffect(() => {
    if (!variantAttributeValues.length || !variant_id) return;
    
    const variant = variantAttributeValues.find(v => String(v.variant_id) === String(variant_id));
    
    if (variant) {
      try {
        const variantAttributes = variant.attributes || [];
        // Đảm bảo không có thuộc tính trùng lặp bằng cách sử dụng Map
        const attributesMap = new Map();
        
        if (Array.isArray(variantAttributes)) {
          variantAttributes.forEach(attr => {
            const foundAttribute = attributes.find(a => 
              a.name.toLowerCase() === attr.name.toLowerCase()
            );
            
            if (foundAttribute) {
              const key = String(foundAttribute.attribute_id);
              if (!attributesMap.has(key)) {
                attributesMap.set(key, {
                  attribute_id: foundAttribute.attribute_id,
                  name: attr.name,
                  value_id: attr.value_id,
                  value: attr.value,
                  variant_attribute_value_id: attr.variant_attribute_value_id
                });
              }
            }
          });
        }

        const realAttributes = Array.from(attributesMap.values());

        setFormData(prev => ({
          ...prev,
          sku: variant.sku || "",
          price: variant.price || "",
          price_original: variant.price_original || "",
          stock: variant.stock || 0,
          image_url: variant.image_url || "",
          is_active: variant.is_active === 1 ? 1 : 0,
          product_id: variant.product_id || "",
          attributes: realAttributes
        }));

        if (variant.image_url) {
          setImagePreview(variant.image_url);
        }
      } catch (error) {
        console.error('Error processing variant data:', error);
      }
    }
  }, [variantAttributeValues, variant_id, attributes]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttributeChange = (attribute_id, value_id) => {
    if (!attribute_id) return;

    try {
      const selectedValue = attributeValues[attribute_id]?.find(av => 
        av && String(av.value_id) === String(value_id)
      );
      
      const attribute = attributes.find(a => String(a.attribute_id) === String(attribute_id));
      if (!attribute) return;

      setFormData(prev => {
        // Tạo Map từ attributes hiện tại để dễ dàng cập nhật và tránh trùng lặp
        const attributesMap = new Map(
          prev.attributes.map(attr => [String(attr.attribute_id), attr])
        );

        if (value_id) {
          // Cập nhật hoặc thêm mới thuộc tính
          attributesMap.set(String(attribute_id), {
            attribute_id: parseInt(attribute_id),
            name: attribute.name,
            value_id: selectedValue ? parseInt(selectedValue.value_id) : '',
            value: selectedValue ? selectedValue.value : '',
            variant_attribute_value_id: attributesMap.get(String(attribute_id))?.variant_attribute_value_id || null
          });
        } else {
          // Nếu không có value_id, xóa thuộc tính
          attributesMap.delete(String(attribute_id));
        }

        return {
          ...prev,
          attributes: Array.from(attributesMap.values())
        };
      });
    } catch (error) {
      console.error('Error in handleAttributeChange:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/')) {
        return;
      }

      setFormData(prev => ({ ...prev, image_url: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!formData.sku.trim() || !formData.price || isNaN(formData.price) || !formData.stock || isNaN(formData.stock)) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);

      const variantFormData = new FormData();
      variantFormData.append('sku', formData.sku.trim());
      variantFormData.append('price', formData.price);
      variantFormData.append('price_original', formData.price_original || '');
      variantFormData.append('stock', formData.stock);
      variantFormData.append('is_active', formData.is_active);
      variantFormData.append('product_id', formData.product_id);

      if (formData.image_url instanceof File) {
        variantFormData.append('image_url', formData.image_url);
      }
      
      const resultAction = await dispatch(updateAdminProductVariant({
        id: variant_id,
        updatedData: variantFormData
      }));

      if (resultAction.error) {
        throw new Error(resultAction.payload || resultAction.error.message);
      }

      // Xử lý và loại bỏ các thuộc tính trùng lặp trước khi gửi
      const uniqueAttributes = Array.from(
        new Map(
          formData.attributes
            .filter(attr => attr && attr.attribute_id && attr.value_id)
            .map(attr => [
              `${attr.attribute_id}`,
              {
                attribute_id: parseInt(attr.attribute_id),
                value_id: parseInt(attr.value_id)
              }
            ])
        ).values()
      );

      const attributeData = {
        variant_id: variant_id,
        update_mode: 'update',
        attributes: uniqueAttributes
      };

      const attributeResult = await dispatch(updateVariantAttributeValue({
        id: variant_id,
        updatedData: attributeData
      }));

      if (attributeResult.error) {
        throw new Error(attributeResult.payload || attributeResult.error.message);
      }

      // Đợi tất cả các API call hoàn thành trước khi chuyển trang
      await Promise.all([
        dispatch(fetchVariantAttributeValues()),
        dispatch(fetchAttributeValues()),
        dispatch(fetchAttributes())
      ]);

      toast.success('Cập nhật biến thể thành công');
      navigate(`/admin/editproduct/${formData.product_id}`);
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật biến thể');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variantLoading || attributeValuesLoading || attributesLoading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="card-title mb-0">Cập nhật biến thể</h2>
            <Link 
              to={`/admin/editproduct/${formData.product_id}`}
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left"></i> Quay lại
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="sku" className="form-label">SKU:</label>
              <input
                type="text"
                className="form-control"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">Giá:</label>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price_original" className="form-label">Giá gốc:</label>
              <input
                type="number"
                className="form-control"
                id="price_original"
                name="price_original"
                value={formData.price_original}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stock" className="form-label">Tồn kho:</label>
              <input
                type="number"
                className="form-control"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">Ảnh:</label>
              <input
                type="file"
                className="form-control"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: "120px", borderRadius: "4px" }} />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Thuộc tính:</label>
              {attributes.map(attr => {
                const currentValue = formData.attributes.find(
                  a => String(a.attribute_id) === String(attr.attribute_id)
                );
                
                return (
                  <div className="mb-3" key={`attr-${attr.attribute_id}`}>
                    <label className="form-label">{attr.name}:</label>
                    <select
                      className="form-select"
                      onChange={e => handleAttributeChange(attr.attribute_id, e.target.value)}
                      value={currentValue?.value_id || ""}
                    >
                      <option value="">-- Chọn {attr.name} --</option>
                      {attributeValues[attr.attribute_id]?.map(value => (
                        <option key={`value-${value.value_id}`} value={value.value_id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="is_active">
                  Kích hoạt
                </label>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật biến thể'
                )}
              </button>
              <Link
                to={`/admin/editproduct/${formData.product_id}`}
                className="btn btn-secondary"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateVariant; 