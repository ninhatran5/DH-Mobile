/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { addAdminProductVariant } from "../../slices/AdminProductVariants";
import { fetchAttributes } from "../../slices/Attribute";
import { addVariantAttributeValue } from "../../slices/variantAttributeValueSlice";

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
    stock: '',
    attributes: ''
  });

  useEffect(() => {
    if (!product_id || isNaN(parseInt(product_id, 10))) {
      toast.error("ID sản phẩm không hợp lệ");
      navigate("/admin/product");
      return;
    }
    dispatch(fetchAttributeValues());
    dispatch(fetchAttributes());
  }, [dispatch, product_id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      newErrors.price = "Giá không hợp lệ";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Giá phải lớn hơn 0";
    }
    
    if (!formData.stock || isNaN(formData.stock)) {
      newErrors.stock = "Số lượng tồn kho không hợp lệ";
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
      return;
    }

    try {
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

      const attributeData = {
        variant_id: variantResponse.variant_id,
        attributes: formData.attributes.map(attr => ({
          attribute_id: parseInt(attr.attribute_id, 10),
          value_id: parseInt(attr.value_id, 10)
        }))
      };
      
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
    }
  };

  return (
    <div className="addvariant-container container my-5">
      <div className="addvariant-card card shadow">
        <div className="addvariant-card-body card-body">
          <div className="addvariant-header d-flex justify-content-between align-items-center mb-4">
            <h2 className="addvariant-title card-title mb-0">Thêm biến thể mới</h2>
            <button
              type="button"
              className="addvariant-back-btn btn btn-outline-secondary"
              onClick={() => navigate(`/admin/editproduct/${product_id}`)}
            >
              <i className="bi bi-arrow-left"></i> Quay lại
            </button>
          </div>

          <form onSubmit={handleSubmit} className="addvariant-form">
            <div className="addvariant-form-group mb-3">
              <label htmlFor="sku" className="addvariant-label form-label">SKU * :</label>
              <input
                type="text"
                className={`addvariant-input form-control ${errors.sku ? 'is-invalid' : ''}`}
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Nhập mã SKU..."
              />
              {errors.sku && <div className="addvariant-error invalid-feedback">{errors.sku}</div>}
            </div>

            <div className="addvariant-form-group mb-3">
              <label htmlFor="price" className="addvariant-label form-label">Giá * :</label>
              <input
                type="number"
                className={`addvariant-input form-control ${errors.price ? 'is-invalid' : ''}`}
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Nhập giá sản phẩm..."
              />
              {errors.price && <div className="addvariant-error invalid-feedback">{errors.price}</div>}
            </div>

            <div className="addvariant-form-group mb-3">
              <label htmlFor="price_original" className="addvariant-label form-label">Giá gốc * :</label>
              <input
                type="number"
                className="addvariant-input form-control"
                id="price_original"
                name="price_original"
                value={formData.price_original}
                onChange={handleInputChange}
                placeholder="Nhập giá gốc (nếu có)..."
              />
            </div>

            <div className="addvariant-form-group mb-3">
              <label htmlFor="stock" className="addvariant-label form-label">Tồn kho * :</label>
              <input
                type="number"
                className={`addvariant-input form-control ${errors.stock ? 'is-invalid' : ''}`}
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Nhập số lượng tồn kho..."
              />
              {errors.stock && <div className="addvariant-error invalid-feedback">{errors.stock}</div>}
            </div>

            <div className="addvariant-form-group mb-3">
              <label htmlFor="image" className="addvariant-label form-label">Ảnh * : </label>
              <input
                type="file"
                className="addvariant-file-input form-control"
                id="image"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, image_url: file }));
                  }
                }}
              />
            </div>

            <div className="addvariant-attributes mb-4">
              <label className="addvariant-label form-label fw-bold">Thuộc tính:</label>
              {attributesLoading ? (
                <div className="addvariant-loading text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải thuộc tính...</span>
                  </div>
                </div>
              ) : attributes && attributes.length > 0 ? (
                attributes.map(attribute => (
                  <div className="addvariant-attribute mb-3" key={attribute.attribute_id}>
                    <label className="addvariant-label form-label">{attribute.name}:</label>
                    <select
                      className={`addvariant-select form-select ${errors.attributes ? 'is-invalid' : ''}`}
                      onChange={(e) => handleAttributeChange(attribute.attribute_id, e.target.value)}
                      value={formData.attributes.find(
                        attr => String(attr.attribute_id) === String(attribute.attribute_id)
                      )?.value_id || ""}
                    >
                      <option value="">-- Chọn {attribute.name} --</option>
                      {attributeValues[attribute.attribute_id]?.map((value) => (
                        <option key={value.value_id} value={value.value_id}>
                          {value.value}
                        </option>
                      ))}
                    </select>
                    {errors.attributes && <div className="addvariant-error invalid-feedback">{errors.attributes}</div>}
                  </div>
                ))
              ) : (
                <div className="addvariant-no-attributes alert alert-info">
                  Không có thuộc tính nào được định nghĩa
                </div>
              )}
            </div>

            <div className="addvariant-active-section mb-4">
              <div className="addvariant-checkbox form-check">
                <input
                  type="checkbox"
                  className="addvariant-checkbox-input form-check-input"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={handleInputChange}
                />
                <label className="addvariant-checkbox-label form-check-label" htmlFor="is_active">
                  Kích hoạt
                </label>
              </div>
            </div>

            <div className="addvariant-actions d-flex gap-2">
              <button type="submit" className="addvariant-submit-btn btn btn-primary">
                Thêm biến thể
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVariant;
