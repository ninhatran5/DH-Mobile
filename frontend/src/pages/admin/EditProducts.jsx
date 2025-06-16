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
  addAdminProductSpecification,
  deleteAdminProductSpecification
} from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { deleteAdminProductVariant } from "../../slices/AdminProductVariants";

import {
  fetchVariantAttributeValues,
  deleteVariantAttributeValue,
} from "../../slices/variantAttributeValueSlice";
import { 
  fetchAttributeValues,
} from "../../slices/attributeValueSlice";
import "../../assets/admin/EditProducts.css";

const VariantDisplay = ({ variant, onEdit, onDelete, attributeValues }) => {
  console.log("variant:", variant);

  const handleDelete = () => {
    onDelete(variant.variant_id);
  };

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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#666" }}>Thuộc tính:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {variant.attributes && variant.attributes.length > 0 ? (
                variant.attributes.map((attr) => {
                  let attributeId = attr.attribute_id;
                  if (!attributeId) {
                    attributeId = Object.keys(attributeValues).find(id => {
                      const arr = attributeValues[id];
                      return arr && arr.length > 0 && arr[0].attribute && arr[0].attribute.name.toLowerCase() === attr.name.toLowerCase();
                    });
                  }
                  const values = attributeValues[attributeId] || [];
                  return (
                    <span 
                      key={attr.value_id}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                    >
                      {attr.name}: {attr.value}
                      
                    </span>
                  );
                })
              ) : (
                <span style={{ color: "#bbb" }}>Không có thuộc tính</span>
              )}
            </div>
          </div>
        </div>

        {/* Nút thao tác */}
        <div style={{ 
          display: "flex",
          gap: "8px",
          flexShrink: 0
        }}>
          <Link
            to={`/admin/variants/update/${variant.variant_id}`}
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
              gap: "4px",
              textDecoration: "none"
            }}
          >
            <i className="bi bi-pencil"></i>
            Cập nhật
          </Link>
          <button
            onClick={handleDelete}
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

  const { attributes } = useSelector((state) => state.attribute);

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
  const [showAddSpecForm, setShowAddSpecForm] = useState(false);
  const [newSpec, setNewSpec] = useState({
    spec_name: "",
    spec_value: ""
  });

  useEffect(() => {
    if (!adminproducts || adminproducts.length === 0) {
      dispatch(fetchAdminProducts());
    }
    dispatch(fetchAdminProductSpecifications());
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
    dispatch(fetchVariantAttributeValues()).unwrap()
      .then(response => {
        console.log("Response từ API variants:", response);
      });
  }, [dispatch, adminproducts, categories]);
  
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

  const handleAddSpecification = async (e) => {
    e.preventDefault();
    if (!newSpec.spec_name.trim() || !newSpec.spec_value.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin thông số kỹ thuật");
      return;
    }

    try {
      const newSpecData = {
        product_id: parseInt(id, 10),
        spec_name: newSpec.spec_name,
        spec_value: newSpec.spec_value
      };

      await dispatch(addAdminProductSpecification(newSpecData)).unwrap();
      toast.success("Thêm thông số kỹ thuật thành công!");
      
      setNewSpec({ spec_name: "", spec_value: "" });
      setShowAddSpecForm(false);
      dispatch(fetchAdminProductSpecifications());
    } catch (err) {
      toast.error("Thêm thông số thất bại: " + err);
    }
  };

  const handleDeleteSpecification = async (specId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông số này không?')) {
      try {
        await dispatch(deleteAdminProductSpecification(specId)).unwrap();
        toast.success('Xóa thông số thành công!');
        dispatch(fetchAdminProductSpecifications());
      } catch (err) {
        toast.error('Xóa thông số thất bại: ' + err);
      }
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

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa biến thể này không? Thao tác này không thể hoàn tác.')) {
      try {
        await dispatch(deleteAdminProductVariant(variantId)).unwrap();
        await dispatch(fetchVariantAttributeValues());
        toast.success("Xóa biến thể thành công!");
      } catch (error) {
        console.error("Error deleting variant:", error);
        let errorMessage = "Lỗi khi xóa biến thể";
        
        if (error.message) {
          if (error.message.includes("foreign key constraint")) {
            errorMessage = "Không thể xóa biến thể do còn liên kết với dữ liệu khác";
          } else if (error.message.includes("not found")) {
            errorMessage = "Không tìm thấy biến thể để xóa";
          } else {
            errorMessage = error.message;
          }
        }
        
        toast.error(errorMessage);
      }
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
        <div className="row g-3 align-items-stretch">
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between" style={{ padding: 18 }}>
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
            <div className="card shadow-sm h-100">
              <div
                className="card-body d-flex flex-column"
                style={{
                  padding: 18,
                  fontSize: 14,
                  background: "#fafbfc",
                  borderRadius: 10,
                  minHeight: 0,
                  height: "100%",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0" style={{ fontSize: 17 }}>Thông số kỹ thuật</h4>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 17, padding: '4px 12px' }}
                    onClick={() => setShowAddSpecForm(!showAddSpecForm)}
                  >
                    <i className="bi bi-plus"></i> Thêm thông số
                  </button>
                </div>
                
                <hr />
                {/* Form thêm thông số mới */}
                {showAddSpecForm && (
                  <div className="add-spec-form mb-3 p-3 border rounded bg-light">
                    <h5 className="mb-2" style={{ fontSize: 14 }}>Thêm thông số mới</h5>
                    <form onSubmit={handleAddSpecification}>
                      <div className="mb-2">
                        <label className="form-label" style={{ fontSize: 13 }}>Tên thông số</label>
                        <input
                          type="text"
                          className="form-control form-control-sm mb-2"
                          style={{ fontSize: 13, padding: '4px 8px', background: '#f6f8fa', border: '1px solid #e0e0e0', borderRadius: 6 }}
                          placeholder="Ví dụ: RAM, CPU, Màn hình..."
                          value={newSpec.spec_name}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, spec_name: e.target.value }))}
                        />
                        <label className="form-label" style={{ fontSize: 13 }}>Giá trị</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          style={{ fontSize: 13, padding: '4px 8px', background: '#f6f8fa', border: '1px solid #e0e0e0', borderRadius: 6 }}
                          placeholder="Nhập giá trị thông số"
                          value={newSpec.spec_value}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, spec_value: e.target.value }))}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success btn-sm" style={{ fontSize: 13, padding: '4px 12px' }}>
                          <i className="bi bi-check-lg"></i> Lưu
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 13, padding: '4px 12px' }}
                          onClick={() => {
                            setShowAddSpecForm(false);
                            setNewSpec({ spec_name: "", spec_value: "" });
                          }}
                        >
                          <i className="bi bi-x-lg"></i> Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <div className="specifications-container">
                  {specificationsData.map((spec, index) => (
                    <div
                      className="specification-row mb-3"
                      key={spec.spec_id || index}
                      style={{
                        background: "#fff",
                        border: "1px solid #ececec",
                        borderRadius: 8,
                        padding: "12px 12px",
                        marginBottom: 18,
                        fontSize: 16,
                      }}
                    >
                      <div className="row g-2 w-100">
                        <div className="col-md-5 mb-2">
                          <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Tên thông số</div>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ fontSize: 15, padding: '6px 10px', background: '#f6f8fa', border: '1px solid #e0e0e0', borderRadius: 6 }}
                            placeholder="Tên thông số"
                            value={spec.spec_name || ""}
                            onChange={(e) =>
                              handleSpecificationChange(index, "spec_name", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-5 mb-2">
                          <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Thông số kỹ thuật</div>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ fontSize: 15, padding: '6px 10px', background: '#f6f8fa', border: '1px solid #e0e0e0', borderRadius: 6 }}
                            placeholder="Giá trị"
                            value={spec.spec_value || ""}
                            onChange={(e) =>
                              handleSpecificationChange(index, "spec_value", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-2 d-flex align-items-end justify-content-end">
                          <button
                            type="button"
                            className="admin-edit-product-btn btn-danger btn-sm"
                            style={{ fontSize: 15, padding: '6px 10px ',margin: '0px 1px 7px 0px', borderRadius: 6, background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffd6d6' }}
                            onClick={() => handleDeleteSpecification(spec.spec_id)}
                            disabled={!spec.spec_id}
                          >
                            <i className="bi bi-trash"> Xoá</i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {specificationsData.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleUpdateSpecifications}
                        className="btn btn-warning btn-sm w-100"
                        style={{
                          fontSize: 14,
                          padding: "7px 0",
                          borderRadius: 6,
                          width: "100%",
                          marginTop: 10,
                          fontWeight: 500,
                          background: "#ffe066",
                          color: "#7c5c00",
                          border: "1px solid #ffe066",
                        }}
                      >
                        <i className="bi bi-save"></i> Cập nhật tất cả thông số kỹ thuật
                      </button>
                    </div>
                  )}
                  {specificationsData.length === 0 && (
                    <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
                      <i className="bi bi-clipboard-data" style={{ fontSize: "1.3rem" }}></i>
                      <p className="mt-2">Chưa có thông số kỹ thuật nào. Hãy thêm thông số mới!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Variants section */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">Biến thể sản phẩm</h4>
                  <Link
                    to={`/admin/addvariant/${id}`}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px"
                    }}
                  >
                    <i className="bi bi-plus"></i>
                    Thêm biến thể mới
                  </Link>
                </div>
                <div className="variants-list" style={{ 
                  border: "1px solid #e1e1e1",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  {variantAttributeValues
                    .filter((variant) => String(variant.product_id) === id)
                    .map((variant) => (
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
                        <VariantDisplay
                          variant={variant}
                          onEdit={(v) => navigate(`/admin/variants/update/${v.variant_id}`)}
                          onDelete={handleDeleteVariant}
                          attributeValues={attributeValues}
                        />
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
