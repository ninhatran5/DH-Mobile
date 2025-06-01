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
    <div className="variant-display" style={{ width: "100%" }}>
      <div style={{ 
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        borderBottom: "1px solid #eee"
      }}>
        {/* Ảnh sản phẩm */}
        <div style={{ 
          width: "100px",
          height: "100px",
          flexShrink: 0,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f8f8f8"
        }}>
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={variant.sku}
              style={{ 
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
            </div>
          )}
        </div>

        {/* Thông tin cơ bản */}
        <div style={{ flex: "1" }}>
          <div style={{ 
            fontSize: "16px",
            fontWeight: "500",
            color: "#333",
            marginBottom: "12px"
          }}>
            SKU: {variant.sku}
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            marginBottom: "8px" 
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: "#666", fontSize: "15px" }}>Giá:</span>
              <span style={{ 
                fontSize: "16px",
                fontWeight: "600",
                color: "#2563EB"
              }}>
                {parseInt(variant.price).toLocaleString('vi-VN')}đ
              </span>
              {variant.price_original && (
                <span style={{ 
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "line-through"
                }}>
                  {parseInt(variant.price_original).toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#666" }}>Tồn kho:</span>
              <span style={{ fontWeight: "500" }}>{variant.stock}</span>
            </div>
          </div>

          {/* Thuộc tính */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#666" }}>Thuộc tính:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {variant.attributes.map((attr) => (
                <span 
                  key={attr.value_id}
                  style={{              padding: "6px 12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              fontSize: "14px"
                  }}
                >
                  {attr.name}: {attr.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Nút thao tác */}
        <div style={{ 
          display: "flex",
          gap: "8px",
          flexShrink: 0
        }}>
          <button
            onClick={() => onEdit(variant)}
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
              gap: "4px"
            }}
          >
            <i className="bi bi-pencil"></i>
            Cập nhật
          </button>
          <button
            onClick={() => onDelete(variant.variant_id)}
            style={{
              padding: "10px 20px",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <i className="bi bi-trash"></i>
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
};

const VariantEditForm = ({ 
  variantFormData, 
  editingVariant,
  attributeValues,
  attributeValuesLoading,
  onChange,
  onUpdateVariant,
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

      <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "12px", display: "block" }}>Thuộc tính:</label>
        {editingVariant.attributes.map((attr, index) => {
          const attributeName = attr.name.toLowerCase();
          const attrValues = attributeValues[attributeName === 'color' ? 1 : 
                                          attributeName === 'storage' ? 2 : 
                                          attributeName === 'ram' ? 3 : null] || [];
          
          const currentValue = (variantFormData.attributes && variantFormData.attributes[index]) 
            ? variantFormData.attributes[index].value_id 
            : attr.value_id;

          return (
            <div
              key={attr.variant_attribute_value_id || attr.value_id}
              style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span style={{ minWidth: "100px" }}>{attr.name}:</span>
              <select
                value={currentValue}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedValue = attrValues.find(av => av.value_id === selectedId);
                  
                  if (selectedValue) {
                    const newAttrs = variantFormData.attributes 
                      ? [...variantFormData.attributes] 
                      : [...editingVariant.attributes];

                    newAttrs[index] = {
                      ...attr,
                      value_id: selectedValue.value_id,
                      value: selectedValue.value,
                      attribute_id: selectedValue.attribute_id,
                      variant_attribute_value_id: attr.variant_attribute_value_id
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

        <div style={{ marginTop: "16px" }}>
          <button
            className="btn btn-success"
            onClick={(e) => {
              e.preventDefault();
              onUpdateVariant();
            }}
            style={{ marginRight: "6px" }}
          >
            Lưu thay đổi
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
    // Chỉ fetch variant attribute values
    dispatch(fetchVariantAttributeValues()).unwrap()
      .then(response => {
        console.log("Response từ API variants:", response);
      });
  }, [dispatch, adminproducts, categories]);
  
  // Fetch attribute values khi component mount
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
    } else if (name === 'attributes') {
      // Khi cập nhật thuộc tính, cập nhật trực tiếp vào variantFormData
      setVariantFormData(prev => ({
        ...prev,
        attributes: value
      }));
    } else {
      setVariantFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateAttributes = async (variantId, attributes) => {
    try {
      // Validate attributes
      if (!attributes || attributes.length === 0) {
        toast.error("Thuộc tính không được để trống");
        return;
      }

      // Validate that all attributes have values
      const invalidAttributes = attributes.filter(attr => !attr.value_id);
      if (invalidAttributes.length > 0) {
        toast.error("Vui lòng chọn giá trị cho tất cả thuộc tính");
        return;
      }

      // Check for duplicate values
      const attributesByType = {};
      for (const attr of attributes) {
        if (attributesByType[attr.name]) {
          toast.error(`Đã có giá trị cho thuộc tính ${attr.name}`);
          return;
        }
        attributesByType[attr.name] = true;
      }

      // Format attributes
      const formattedAttributes = attributes.map(attr => ({
        variant_attribute_value_id: attr.variant_attribute_value_id,
        value_id: parseInt(attr.value_id),
        attribute_id: attr.attribute_id,
        name: attr.name,
        value: attr.value
      }));

      // Gửi request cập nhật
      await dispatch(
        updateVariantAttributeValue({
          id: variantId,
          updatedData: {
            variant_id: variantId,
            attributes: formattedAttributes
          }
        })
      ).unwrap();

      // Cập nhật dữ liệu mới
      await dispatch(fetchVariantAttributeValues());
      
      toast.success("Cập nhật thuộc tính thành công!");

      // Đóng form và reset state
      setEditingVariant(null); // Reset trạng thái chỉnh sửa trước
    } catch (err) {
      console.error("Error updating attributes:", err);
      toast.error("Cập nhật thuộc tính thất bại: " + err);
    }
  };

  const handleUpdateVariant = async () => {
    if (!editingVariant) return;

    try {
      // Validate dữ liệu cơ bản
      if (!variantFormData.sku) {
        toast.error("Vui lòng nhập SKU");
        return;
      }
      if (!variantFormData.price) {
        toast.error("Vui lòng nhập giá");
        return;
      }

      // Validate thuộc tính
      if (!variantFormData.attributes || variantFormData.attributes.length === 0) {
        toast.error("Thuộc tính không được để trống");
        return;
      }

      // Validate that all attributes have values
      const invalidAttributes = variantFormData.attributes.filter(attr => !attr.value_id);
      if (invalidAttributes.length > 0) {
        toast.error("Vui lòng chọn giá trị cho tất cả thuộc tính");
        return;
      }

      const productId = parseInt(id);
      if (isNaN(productId)) {
        toast.error("product_id không hợp lệ");
        return;
      }

      // Format attributes
      const formattedAttributes = variantFormData.attributes.map(attr => ({
        variant_attribute_value_id: attr.variant_attribute_value_id,
        value_id: attr.value_id,
        attribute_id: attr.attribute_id,
        name: attr.name,
        value: attr.value
      }));

      // First update variant attributes
      await dispatch(
        updateVariantAttributeValue({
          id: editingVariant.variant_id,
          updatedData: {
            variant_id: editingVariant.variant_id,
            attributes: formattedAttributes
          }
        })
      ).unwrap();

      // Then update variant info
      const formData = new FormData();
      formData.append('product_id', productId.toString());
      formData.append('sku', variantFormData.sku);
      formData.append('price', variantFormData.price.toString());
      
      if (variantFormData.price_original) {
        formData.append('price_original', variantFormData.price_original.toString());
      }
      formData.append('stock', (variantFormData.stock || 0).toString());
      formData.append('is_active', variantFormData.is_active ? '1' : '0');

      // Xử lý ảnh
      if (variantFormData.image_url) {
        if (variantFormData.image_url.startsWith('data:image')) {
          // Nếu là ảnh mới (base64), chuyển đổi thành file
          const response = await fetch(variantFormData.image_url);
          const blob = await response.blob();
          const file = new File([blob], 'variant_image.jpg', { type: 'image/jpeg' });
          formData.append('image_url', file);
        } else if (variantFormData.image_url !== editingVariant.image_url) {
          // Nếu là URL mới khác với URL cũ
          formData.append('image_url', variantFormData.image_url);
        }
      }

      // Update variant info
      await dispatch(
        updateAdminProductVariant({
          id: editingVariant.variant_id,
          updatedData: formData
        })
      ).unwrap();

      toast.success("Cập nhật variant và thuộc tính thành công!");
      
      // Reset form và trạng thái editing
      setEditingVariant(null);
      setVariantFormData({
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
      
      // Fetch lại dữ liệu variants mới
      await dispatch(fetchVariantAttributeValues());
    } catch (err) {
      console.error("Error updating:", err);
      toast.error("Cập nhật thất bại: " + err);
    }
  };

  return (
    <div className="admineditproduct-container" style={{ 
      padding: "5px 10px",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <div className="admineditproduct-header" style={{ 
        marginBottom: "0px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "2px solid #eee"
      }}>
        <h1 className="admineditproduct-title" style={{ margin: 0 }}>Chỉnh sửa sản phẩm</h1>
        <Link to="/admin/product" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left"></i> Quay lại
        </Link>
      </div>

      {(loading || specsLoading || categoriesLoading) && (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}
      
      {(error || specsError || categoriesError) && (
        <div className="alert alert-danger">
          {error || specsError || categoriesError}
        </div>
      )}

      {!loading && !specsLoading && !categoriesLoading && !error && !specsError && !categoriesError && (
        <div className="row g-3">
          {/* Main product information column */}
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">Thông tin cơ bản</h4>
                <form onSubmit={handleSubmit} className="admineditproduct-form">
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
              </div>
            </div>
          </div>

          {/* Thông số kỹ thuật section */}
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">Thông số kỹ thuật</h4>
                <div className="specification"
                  style={{ marginTop: "30px", maxWidth: "600px" }}
                >
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
              </div>
            </div>
          </div>

          {/* Variants section */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-4">Biến thể sản phẩm</h4>
                <div className="variants-list" style={{ 
                  border: "1px solid #e1e1e1",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  {variantAttributeValues
                    .filter((variant) => String(variant.product_id) === id)
                    .map((variant) => {
                      console.log("Biến thể sau khi filter:", variant);
                      // Chỉ hiển thị form edit nếu đang edit variant này và chưa có variant nào khác đang được edit
                      const isEditing = editingVariant && editingVariant.variant_id === variant.variant_id;
                      
                      return (
                        <div
                          key={variant.variant_id}
                          data-variant-id={variant.variant_id}
                          className="variant-item"
                          style={{
                            backgroundColor: "#fff",
                            transition: "background-color 0.2s",
                            ":hover": {
                              backgroundColor: "#f9fafb"
                            }
                          }}
                        >
                          {isEditing ? (
                            <VariantEditForm
                              variantFormData={variantFormData}
                              editingVariant={editingVariant}
                              attributeValues={attributeValues}
                              attributeValuesLoading={attributeValuesLoading}
                              onChange={handleVariantChange}
                              onUpdateVariant={handleUpdateVariant}
                              onCancel={() => setEditingVariant(null)}
                            />
                          ) : (
                            <VariantDisplay
                              variant={variant}
                              onEdit={() => {
                                if (!editingVariant) {
                                  startEditVariant(variant);
                                }
                              }}
                              onDelete={handleDeleteVariant}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Phần quản lý biến thể sản phẩm */}
                <div className="variants-grid">
                  {productVariants.map((variant, index) => (
                    <div key={index} className="variant-card card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0">Biến thể #{index + 1}</h5>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteVariant(variant.variant_id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>

                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label">Hình ảnh</label>
                            <div 
                              className="variant-image-container mb-2"
                              style={{
                                width: "100%",
                                aspectRatio: "1",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                overflow: "hidden"
                              }}
                            >
                              {variant.image_url ? (
                                <img
                                  src={variant.image_url}
                                  alt={`Biến thể ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                  }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                  <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(index, e)}
                            />
                          </div>

                          <div className="col-md-8">
                            <div className="row g-2">
                              <div className="col-sm-6">
                                <label className="form-label">Giá</label>
                                <div className="input-group">
                                  <span className="input-group-text">₫</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div className="col-sm-6">
                                <label className="form-label">Số lượng</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={variant.stock}
                                  onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                  min="0"
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="form-label">Thuộc tính</label>
                              <div className="variant-attributes">
                                {variant.attributes?.map((attr, attrIndex) => (
                                  <div key={attrIndex} className="input-group mb-2">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Tên thuộc tính"
                                      value={attr.name}
                                      onChange={(e) => handleVariantAttributeChange(index, attrIndex, 'name', e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Giá trị"
                                      value={attr.value}
                                      onChange={(e) => handleVariantAttributeChange(index, attrIndex, 'value', e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger"
                                      onClick={() => handleRemoveVariantAttribute(index, attrIndex)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleAddVariantAttribute(index)}
                                >
                                  <i className="bi bi-plus"></i> Thêm thuộc tính
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductEdit;
