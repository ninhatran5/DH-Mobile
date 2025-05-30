import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  fetchAdminProducts,
  updateAdminProduct,
} from "../../slices/adminproductsSlice";
import {
  fetchAdminProductSpecifications,
  updateAdminProductSpecification,
} from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";

import {
  fetchVariantAttributeValues,
  deleteVariantAttributeValue,
  updateVariantAttributeValue,
} from "../../slices/variantAttributeValueSlice";
import { 
  fetchAdminProductVariants,
  updateAdminProductVariant,
} from "../../slices/AdminProductVariants";
import { 
  fetchAttributeValues,
} from "../../slices/attributeValueSlice";
import "../../assets/admin/EditProducts.css";

const VariantDisplay = ({ variant, onEdit, onDelete }) => {
  return (
    <>
      <div>
        <strong>SKU:</strong> {variant.sku}
      </div>
      <div>
        <strong>Giá:</strong> {variant.price}
      </div>
      <div>
        <strong>Giá gốc:</strong> {variant.price_original}
      </div>
      <div>
        <strong>Tồn kho:</strong> {variant.stock}
      </div>
      <div>
        <strong>Trạng thái:</strong>{" "}
        {variant.is_active ? "✅ Active" : "❌ Inactive"}
      </div>
      <div>
        <strong>Thuộc tính:</strong>
        <ul
          style={{
            margin: "6px 0 0 12px",
            padding: 0,
            listStyle: "disc",
          }}
        >
          {variant.attributes.map((attr) => (
            <li key={attr.value_id}>
              {attr.name}: {attr.value}
            </li>
          ))}
        </ul>
      </div>
      {variant.image_url && (
        <img
          src={variant.image_url}
          alt={variant.sku}
          style={{ maxWidth: "100px", marginTop: "10px" }}
        />
      )}
      <div style={{ marginTop: "10px" }}>
        <button
          className="btn btn-warning"
          onClick={() => onEdit(variant)}
          style={{ marginRight: "6px" }}
        >
          Cập nhật
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(variant.variant_id)}
        >
          Xoá
        </button>
      </div>
    </>
  );
};

const VariantEditForm = ({ 
  variantFormData, 
  editingVariant,
  attributeValues,
  attributeValuesLoading,
  onChange,
  onUpdateVariant,
  onUpdateAttributes,
  onCancel 
}) => {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <label>SKU: </label>
        <input
          type="text"
          name="sku"
          value={variantFormData.sku}
          onChange={onChange}
          style={{ width: "100%", padding: "6px" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Giá: </label>
        <input
          type="number"
          name="price"
          value={variantFormData.price}
          onChange={onChange}
          style={{ width: "100%", padding: "6px" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Giá gốc: </label>
        <input
          type="number"
          name="price_original"
          value={variantFormData.price_original || ""}
          onChange={onChange}
          style={{ width: "100%", padding: "6px" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Tồn kho: </label>
        <input
          type="number"
          name="stock"
          value={variantFormData.stock}
          onChange={onChange}
          style={{ width: "100%", padding: "6px" }}
        />
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>
          Trạng thái:
          <input
            type="checkbox"
            name="is_active"
            checked={!!variantFormData.is_active}
            onChange={onChange}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label>Chọn ảnh: </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                onChange({
                  target: {
                    name: 'image_url',
                    value: reader.result
                  }
                });
              };
              reader.readAsDataURL(file);
            }
          }}
          style={{ width: "100%", padding: "6px" }}
        />
      </div>
      
      {variantFormData.image_url && (
        <div style={{ marginBottom: "12px" }}>
          <img 
            src={variantFormData.image_url} 
            alt="Preview"
            style={{ 
              maxWidth: "150px", 
              borderRadius: "4px",
              marginTop: "8px" 
            }} 
          />
        </div>
      )}

      <div style={{ marginTop: "12px", marginBottom: "20px" }}>
        <button
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            onUpdateVariant();
          }}
          style={{ marginRight: "6px" }}
        >
          Lưu thông tin sản phẩm
        </button>
      </div>

      <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px", display: "block" }}>Thuộc tính:</label>
        {editingVariant.attributes.map((attr, index) => {
          const attributeName = attr.name.toLowerCase();
          const attrValues = attributeValues[attributeName === 'color' ? 1 : 
                                          attributeName === 'storage' ? 2 : 
                                          attributeName === 'ram' ? 3 : null] || [];
          
          return (
            <div
              key={attr.value_id}
              style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span style={{ minWidth: "100px" }}>{attr.name}:</span>
              <select
                value={variantFormData.attributes?.[index]?.value_id || attr.value_id}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedValue = attrValues.find(av => av.value_id === selectedId);
                  
                  if (selectedValue) {
                    const newAttrs = [...(variantFormData.attributes || [])];
                    newAttrs[index] = {
                      value_id: selectedValue.value_id,
                      name: attr.name,
                      value: selectedValue.value,
                      attribute_id: selectedValue.attribute_id // Thêm attribute_id vào
                    };
                    onChange({
                      target: {
                        name: 'attributes',
                        value: newAttrs
                      }
                    });
                  }
                }}
                style={{ flex: 1, padding: "6px" }}
                disabled={attributeValuesLoading}
              >
                <option value="">-- Chọn giá trị --</option>
                {attrValues.map((av) => (
                  <option key={av.value_id} value={av.value_id}>
                    {av.value}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div style={{ marginTop: "12px" }}>
          <button
            className="btn btn-success"
            onClick={(e) => {
              e.preventDefault();
              const updatedAttributes = variantFormData.attributes || editingVariant.attributes;
              onUpdateAttributes(editingVariant.variant_id, updatedAttributes);
            }}
            style={{ marginRight: "6px" }}
          >
            Lưu thuộc tính
          </button>
          <button
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
          >
            Hủy
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

  const { adminproducts, loading, error } = useSelector(
    (state) => state.adminproduct
  );
  const {
    productSpecifications,
    loading: specsLoading,
    error: specsError,
  } = useSelector((state) => state.adminProductSpecifications);
  const { categories, loading: categoriesLoading, error: categoriesError } =
    useSelector((state) => state.category);
    
  const { attributeValues, loading: attributeValuesLoading } = useSelector(
    (state) => state.attributeValue || {}
  );

  const {
    variantAttributeValues,
    loading: variantLoading,
    error: variantError,
  } = useSelector((state) => state.variantAttributeValue);

  const {
    productVariants,
    loading: productVariantsLoading,
    error: productVariantsError,
  } = useSelector((state) => state.adminProductVariants);

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

  const [editingVariant, setEditingVariant] = useState(null);
  const [variantFormData, setVariantFormData] = useState({
    variant_id: "",
    product_id: id,
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });

  useEffect(() => {
    if (!adminproducts || adminproducts.length === 0) {
      dispatch(fetchAdminProducts());
    }
    dispatch(fetchAdminProductSpecifications());
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
    dispatch(fetchVariantAttributeValues());
    dispatch(fetchAdminProductVariants());
  }, [dispatch, adminproducts, categories]);
  
  // Fetch attribute values khi component mount
  useEffect(() => {
    dispatch(fetchAttributeValues());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttributeValues());
  }, [dispatch]);

  useEffect(() => {
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

    const specs = productSpecifications.filter(
      (spec) => String(spec.product_id) === id
    );
    setSpecificationsData(specs);
  }, [adminproducts, productSpecifications, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = specificationsData.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    setSpecificationsData(updatedSpecs);
  };

  const handleUpdateSpecifications = async () => {
    try {
      for (const spec of specificationsData) {
        const updatedSpecData = {
          product_id: spec.product_id,
          spec_name: spec.spec_name,
          spec_value: spec.spec_value,
        };
        await dispatch(
          updateAdminProductSpecification({
            id: spec.spec_id,
            updatedData: updatedSpecData,
          })
        ).unwrap();
      }
      toast.success("Cập nhật thông số kỹ thuật thành công!");
    } catch (err) {
      toast.error("Cập nhật thông số kỹ thuật thất bại: " + err);
    }
  };

  const handleSubmit = async (e) => {
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
  };

  const handleDeleteVariant = (variantId) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá không?")) {
      dispatch(deleteVariantAttributeValue(variantId));
    }
  };

  const startEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantFormData({
      variant_id: variant.variant_id,
      product_id: id,
      sku: variant.sku || "",
      price: variant.price || "",
      price_original: variant.price_original || "",
      stock: variant.stock || 0,
      image_url: variant.image_url || "",
      is_active: variant.is_active === 1 ? 1 : 0,
      attributes: variant.attributes ? [...variant.attributes] : []
    });
  };

  const handleVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setVariantFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setVariantFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateAttributes = async (variantId, attributes) => {
    try {
      console.log('Updating attributes:', attributes);
      
      await dispatch(
        updateVariantAttributeValue({
          id: variantId,
          updatedData: {
            attributes: attributes.map(attr => ({
              value_id: parseInt(attr.value_id),
              name: attr.name,
              value: attr.value
            }))
          }
        })
      ).unwrap();
      
      toast.success("Cập nhật thuộc tính thành công!");
      setEditingVariant(null);
      dispatch(fetchVariantAttributeValues());
    } catch (err) {
      toast.error("Cập nhật thuộc tính thất bại: " + err);
    }
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;

    try {
      // Validate dữ liệu
      if (!variantFormData.sku) {
        toast.error("Vui lòng nhập SKU");
        return;
      }
      if (!variantFormData.price) {
        toast.error("Vui lòng nhập giá");
        return;
      }

      // Convert các trường sang kiểu dữ liệu phù hợp 
      const productId = parseInt(id);
      if (isNaN(productId)) {
        toast.error("product_id không hợp lệ");
        return;
      }

      // Tạo FormData để gửi cả file và dữ liệu
      const formData = new FormData();
      
      // Đảm bảo các trường bắt buộc được gửi đi
      if (!productId || !variantFormData.sku || !variantFormData.price) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }
      
      formData.append('product_id', productId.toString());  // Đảm bảo gửi dưới dạng string
      formData.append('sku', variantFormData.sku);
      formData.append('price', variantFormData.price.toString());
      
      if (variantFormData.price_original) {
        formData.append('price_original', variantFormData.price_original.toString());
      }
      formData.append('stock', (variantFormData.stock || 0).toString());
      formData.append('is_active', variantFormData.is_active ? '1' : '0');

      // Convert base64 image to file if exists
      if (variantFormData.image_url && variantFormData.image_url.startsWith('data:image')) {
        const response = await fetch(variantFormData.image_url);
        const blob = await response.blob();
        const file = new File([blob], 'variant_image.jpg', { type: 'image/jpeg' });
        formData.append('image_url', file);
      } else if (variantFormData.image_url) {
        formData.append('image_url', variantFormData.image_url);
      }

      // Gửi request cập nhật
      await dispatch(
        updateAdminProductVariant({
          id: editingVariant.variant_id,
          updatedData: formData
        })
      ).unwrap();

      toast.success("Cập nhật variant thành công!");
      setEditingVariant(null);
      
      // Refresh data from both endpoints to ensure synchronization
      await Promise.all([
        dispatch(fetchAdminProductVariants()),
        dispatch(fetchVariantAttributeValues())
      ]);
      
      // Force reload the current page to refresh all data
      window.location.reload();
    } catch (err) {
      toast.error("Cập nhật thất bại: " + err);
    }
  };

  return (
    <div className="admineditproduct-container" style={{ padding: "10px" }}>
      <div className="admineditproduct-header" style={{ marginBottom: "20px" }}>
        <h1 className="admineditproduct-title">Chỉnh sửa sản phẩm</h1>
        <Link to="/admin/product" className="admineditproduct-back-link">
          <i className="bi bi-arrow-left"></i> Quay lại
        </Link>
      </div>

      {(loading || specsLoading || categoriesLoading) && <p>Đang tải...</p>}
      {(error || specsError || categoriesError) && (
        <p className="error">{error || specsError || categoriesError}</p>
      )}

      {!loading &&
        !specsLoading &&
        !categoriesLoading &&
        !error &&
        !specsError &&
        !categoriesError && (
          <>
            <form
              onSubmit={handleSubmit}
              className="admineditproduct-form"
              style={{ maxWidth: "600px" }}
            >
              {[
                {
                  label: "Tên sản phẩm",
                  type: "text",
                  name: "name",
                  required: true,
                },
                {
                  label: "Giá khuyến mại",
                  type: "number",
                  name: "price",
                  required: true,
                },
                { label: "Giá Gốc", type: "number", name: "price_original" },
              ].map(({ label, type, name, required }) => (
                <div
                  key={name}
                  className="admineditproduct-form-group"
                  style={{ marginBottom: "12px" }}
                >
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

              <div
                className="admineditproduct-form-group"
                style={{ marginBottom: "12px" }}
              >
                <label>Chọn tệp ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="admineditproduct-file-input"
                />
              </div>

              {imagePreview && (
                <div
                  className="admineditproduct-image-preview"
                  style={{ marginBottom: "12px" }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "150px", borderRadius: "4px" }}
                  />
                </div>
              )}

              <div
                className="admineditproduct-form-group"
                style={{ marginBottom: "12px" }}
              >
                <label>Danh mục</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "6px" }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="admineditproduct-form-group"
                style={{ marginBottom: "12px" }}
              >
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "6px" }}
                >
                  <option value="Còn hàng">Còn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                </select>
              </div>

              <div
                className="admineditproduct-form-group"
                style={{ marginBottom: "12px" }}
              >
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ width: "100%", padding: "6px" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-success"
                style={{ marginTop: "12px" }}
              >
                Cập nhật sản phẩm
              </button>
            </form>

            <div
              className="specification"
              style={{ marginTop: "30px", maxWidth: "600px" }}
            >
              <h4>Thông số kỹ thuật</h4>
              {specificationsData.map((spec, index) => (
                <div
                  className="specification-row"
                  key={spec.spec_id || index}
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <input
                    type="text"
                    className="spec-input"
                    placeholder="Tên thông số"
                    value={spec.spec_name || ""}
                    onChange={(e) =>
                      handleSpecificationChange(index, "spec_name", e.target.value)
                    }
                    style={{ flex: 1, padding: "6px" }}
                  />
                  <input
                    type="text"
                    className="spec-input"
                    placeholder="Giá trị"
                    value={spec.spec_value || ""}
                    onChange={(e) =>
                      handleSpecificationChange(index, "spec_value", e.target.value)
                    }
                    style={{ flex: 1, padding: "6px" }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleUpdateSpecifications}
                className="btn btn-primary"
              >
                Cập nhật thông số kỹ thuật
              </button>
            </div>
              <h4>Biến thể </h4>

            <div
              className="variant-list"
              style={{ marginTop: "30px", maxWidth: "700px" }}
            >

              {variantAttributeValues
                .filter((variant) => String(variant.product_id) === id)
                .map((variant) => (
                  <div
                    key={variant.variant_id}
                    className="variant-card"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "4px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    {editingVariant &&
                    editingVariant.variant_id === variant.variant_id ? (
                      // FORM EDITING VARIANT
                      <VariantEditForm
                        variantFormData={variantFormData}
                        editingVariant={editingVariant}
                        attributeValues={attributeValues}
                        attributeValuesLoading={attributeValuesLoading}
                        onChange={handleVariantChange}
                        onUpdateVariant={handleUpdateVariant}
                        onUpdateAttributes={handleUpdateAttributes}
                        onCancel={() => setEditingVariant(null)}
                      />
                    ) : (
                      <VariantDisplay
                        variant={variant}
                        onEdit={startEditVariant}
                        onDelete={handleDeleteVariant}
                      />
                    )}
                  </div>
                ))}
            </div>
          </>
        )}
    </div>
  );
};

export default AdminProductEdit;
