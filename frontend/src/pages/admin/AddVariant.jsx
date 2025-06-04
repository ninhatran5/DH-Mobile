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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku.trim()) {
      toast.warning("SKU không được để trống");
      return;
    }
    if (!formData.price || isNaN(formData.price)) {
      toast.warning("Giá không hợp lệ");
      return;
    }
    if (!formData.stock || isNaN(formData.stock)) {
      toast.warning("Số lượng tồn kho không hợp lệ");
      return;
    }
    if (!formData.attributes || formData.attributes.length === 0) {
      toast.warning("Vui lòng chọn thuộc tính cho biến thể");
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
        
        console.log('Creating new variant with image:', Object.fromEntries(imageFormData));
        variantResponse = await dispatch(addAdminProductVariant(imageFormData)).unwrap();
        console.log('Variant created:', variantResponse);
      } else {
        console.log('Creating new variant without image:', variantData);
        variantResponse = await dispatch(addAdminProductVariant(variantData)).unwrap();
        console.log('Variant created:', variantResponse);
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

      console.log('Adding attributes for variant:', attributeData);
      
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
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="card-title mb-0">Thêm biến thể mới</h2>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/admin/editproduct/${product_id}`)}
            >
              <i className="bi bi-arrow-left"></i> Quay lại
            </button>
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
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, image_url: file }));
                  }
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Thuộc tính:</label>
              {attributesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải thuộc tính...</span>
                  </div>
                </div>
              ) : attributes && attributes.length > 0 ? (
                attributes.map(attribute => (
                  <div className="mb-3" key={attribute.attribute_id}>
                    <label className="form-label">{attribute.name}:</label>
                    <select
                      className="form-select"
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
                  </div>
                ))
              ) : (
                <div className="alert alert-info">
                  Không có thuộc tính nào được định nghĩa
                </div>
              )}
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
              <button type="submit" className="btn btn-primary">
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
