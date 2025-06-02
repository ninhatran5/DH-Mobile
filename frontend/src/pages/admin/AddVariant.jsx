import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { addAdminProductVariant } from "../../slices/AdminProductVariants";

const AddVariant = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { attributeValues, loading: attributeValuesLoading } = useSelector(
    (state) => state.attributeValue || {}
  );

  const [formData, setFormData] = useState({
    product_id: id,
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });

  // Fetch attribute values when component mounts
  useEffect(() => {
    dispatch(fetchAttributeValues());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttributeChange = (attributeId, value_id) => {
    const selectedValue = attributeValues[attributeId]?.find(av => av.value_id === parseInt(value_id));
    if (!selectedValue) return;

    // Map attribute names based on attribute ID
    const attributeNames = {
      1: "Color",
      2: "Storage",
      3: "RAM"
    };

    setFormData(prev => {
      const newAttributes = [...(prev.attributes || [])];
      const existingIndex = newAttributes.findIndex(attr => attr.attribute_id === attributeId);

      const newAttribute = {
        attribute_id: attributeId,
        name: attributeNames[attributeId],
        value_id: selectedValue.value_id,
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

    const formDataToSend = new FormData();
    formDataToSend.append("product_id", id);
    formDataToSend.append("sku", formData.sku);
    formDataToSend.append("price", formData.price);
    if (formData.price_original) {
      formDataToSend.append("price_original", formData.price_original);
    }
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("is_active", formData.is_active);

    if (formData.image_url instanceof File) {
      formDataToSend.append("image_url", formData.image_url);
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập");
      }

      // Tạo biến thể mới sử dụng Redux action
      const variantData = await dispatch(addAdminProductVariant(formDataToSend)).unwrap();
      const variantId = variantData.variant_id;

      // Thêm các thuộc tính cho biến thể
      await axiosConfig.post(`/variant-attribute-values/${variantId}`, {
        attributes: formData.attributes.map(attr => ({
          value_id: attr.value_id
        }))
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Thêm biến thể thành công!");
      navigate(`/admin/product/edit/${id}`);
    } catch (err) {
      toast.error("Lỗi: " + (err.message || "Đã có lỗi xảy ra"));
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Thêm biến thể mới</h2>
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
              {/* Color Attribute */}
              <div className="mb-3">
                <label className="form-label">Màu sắc:</label>
                <select
                  className="form-select"
                  onChange={(e) => handleAttributeChange(1, e.target.value)}
                  value={formData.attributes.find(attr => attr.attribute_id === 1)?.value_id || ""}
                >
                  <option value="">-- Chọn màu sắc --</option>
                  {attributeValues[1]?.map((value) => (
                    <option key={value.value_id} value={value.value_id}>
                      {value.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Storage Attribute */}
              <div className="mb-3">
                <label className="form-label">Bộ nhớ:</label>
                <select
                  className="form-select"
                  onChange={(e) => handleAttributeChange(2, e.target.value)}
                  value={formData.attributes.find(attr => attr.attribute_id === 2)?.value_id || ""}
                >
                  <option value="">-- Chọn bộ nhớ --</option>
                  {attributeValues[2]?.map((value) => (
                    <option key={value.value_id} value={value.value_id}>
                      {value.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* RAM Attribute */}
              <div className="mb-3">
                <label className="form-label">RAM:</label>
                <select
                  className="form-select"
                  onChange={(e) => handleAttributeChange(3, e.target.value)}
                  value={formData.attributes.find(attr => attr.attribute_id === 3)?.value_id || ""}
                >
                  <option value="">-- Chọn RAM --</option>
                  {attributeValues[3]?.map((value) => (
                    <option key={value.value_id} value={value.value_id}>
                      {value.value}
                    </option>
                  ))}
                </select>
              </div>
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
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/admin/product/edit/${id}`)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVariant;
