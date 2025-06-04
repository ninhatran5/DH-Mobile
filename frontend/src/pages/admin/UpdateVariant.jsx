import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAdminProductVariants, updateAdminProductVariant } from "../../slices/AdminProductVariants";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { fetchAttributes } from "../../slices/Attribute";
import { fetchVariantAttributeValues, updateVariantAttributeValue } from "../../slices/variantAttributeValueSlice";

const UpdateVariant = () => {
  const { variant_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('Current variant_id from URL:', variant_id);

  const { productVariants, loading: productVariantsLoading } = useSelector(
    (state) => state.adminProductVariants
  );
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
      console.log('Fetching data for variant_id:', variant_id);
      dispatch(fetchAdminProductVariants());
      dispatch(fetchAttributeValues());
      dispatch(fetchAttributes());
      dispatch(fetchVariantAttributeValues());
    } else {
      console.log('No variant_id found in URL');
      toast.error('Không tìm thấy ID biến thể');
      navigate('/admin/product');
    }
  }, [dispatch, variant_id, navigate]);

  useEffect(() => {
    if (!productVariants.length || !variant_id) return;
    
    console.log('Available variants:', productVariants.map(v => v.variant_id));
    const variant = productVariants.find(v => String(v.variant_id) === String(variant_id));
    console.log('Found variant:', variant);
    
    if (variant) {
      try {
        // Kiểm tra và lọc attributes một cách an toàn
        const variantAttributes = variant.attributes || [];
        console.log('Original variant attributes:', variantAttributes);

        const realAttributes = Array.isArray(variantAttributes) 
          ? variantAttributes.filter(attr => 
              attr && 
              attr.attribute_id && 
              attr.name && 
              Array.isArray(attr.values) && 
              attr.values.length > 0
            )
          : [];

        console.log('Filtered attributes:', realAttributes);

        // Set form data với các giá trị mặc định an toàn
        setFormData({
          sku: variant.sku || "",
          price: variant.price || "",
          price_original: variant.price_original || "",
          stock: variant.stock || 0,
          image_url: variant.image_url || "",
          is_active: variant.is_active === 1 ? 1 : 0,
          product_id: variant.product_id || "",
          attributes: realAttributes.map(attr => ({
            attribute_id: attr.attribute_id,
            name: attr.name,
            value_id: attr.values[0]?.value_id || "",
            value: attr.values[0]?.value || "",
            variant_attribute_value_id: attr.variant_attribute_value_id || null
          }))
        });

        if (variant.image_url) {
          setImagePreview(variant.image_url);
        }
      } catch (error) {
        console.error('Error processing variant data:', error);
        toast.error('Có lỗi khi xử lý dữ liệu biến thể');
      }
    } else {
      toast.error('Không tìm thấy thông tin biến thể');
    }
  }, [productVariants, variant_id]);

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
      
      setFormData(prev => {
        const newAttributes = Array.isArray(prev.attributes) ? [...prev.attributes] : [];
        const existingIndex = newAttributes.findIndex(attr => 
          attr && String(attr.attribute_id) === String(attribute_id)
        );
        
        const newAttribute = {
          attribute_id,
          name: attributes.find(a => a && String(a.attribute_id) === String(attribute_id))?.name || '',
          value_id: selectedValue?.value_id || '',
          value: selectedValue?.value || '',
          variant_attribute_value_id: existingIndex !== -1 ? newAttributes[existingIndex].variant_attribute_value_id : null
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (ví dụ: giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh");
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

    try {
      // 1. Cập nhật thông tin cơ bản của biến thể
      const variantFormData = new FormData();
      variantFormData.append('sku', formData.sku);
      variantFormData.append('price', formData.price);
      variantFormData.append('price_original', formData.price_original || '');
      variantFormData.append('stock', formData.stock);
      variantFormData.append('is_active', formData.is_active);
      variantFormData.append('product_id', formData.product_id);

      // Chỉ append image nếu có file mới được chọn
      if (formData.image_url instanceof File) {
        variantFormData.append('image_url', formData.image_url);
      }

      console.log('Updating variant with data:', Object.fromEntries(variantFormData));
      
      // Cập nhật thông tin biến thể
      const updatedVariant = await dispatch(updateAdminProductVariant({
        id: variant_id,
        updatedData: variantFormData
      })).unwrap();

      console.log('Variant updated successfully:', updatedVariant);

      // 2. Cập nhật thuộc tính của biến thể
      const attributeData = {
        variant_id: variant_id,
        update_mode: 'update',
        attributes: formData.attributes.map(attr => ({
          attribute_id: attr.attribute_id,
          value_id: attr.value_id,
          variant_attribute_value_id: attr.variant_attribute_value_id
        }))
      };

      console.log('Updating variant attributes with data:', attributeData);

      await dispatch(updateVariantAttributeValue({
        id: variant_id,
        updatedData: attributeData
      })).unwrap();

      toast.success("Cập nhật biến thể thành công!");
      
      // Chuyển hướng về trang edit product
      navigate(`/admin/editproduct/${formData.product_id}`);
    } catch (err) {
      console.error('Update error:', err);
      toast.error("Lỗi: " + (err.response?.data?.message || err.message || "Đã có lỗi xảy ra"));
    }
  };

  if (productVariantsLoading) {
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

  const currentVariant = variantAttributeValues.find(v => String(v.variant_id) === String(variant_id));

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
                  <div className="mb-3" key={attr.attribute_id}>
                    <label className="form-label">{attr.name}:</label>
                    <select
                      className="form-select"
                      onChange={e => handleAttributeChange(attr.attribute_id, e.target.value)}
                      value={currentValue?.value_id || ""}
                    >
                      <option value="">-- Chọn {attr.name} --</option>
                      {attributeValues[attr.attribute_id]?.map(value => (
                        <option key={value.value_id} value={value.value_id}>
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
              <button type="submit" className="btn btn-primary">
                Cập nhật biến thể
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