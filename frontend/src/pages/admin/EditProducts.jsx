import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  updateAdminProduct,
} from "../../slices/adminproductsSlice";
import {
  fetchAdminProductSpecifications,
  updateAdminProductSpecification,
} from "../../slices/adminProductSpecificationsSlice";
import {
  fetchAdminProductVariants,
  updateAdminProductVariant,
} from "../../slices/AdminProductVariants";
import { fetchCategories } from "../../slices/adminCategories";
import "../../assets/admin/EditProducts.css";

const AdminProductEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminproducts, loading, error } = useSelector(
    (state) => state.adminproduct
  );
  const { productSpecifications, loading: specsLoading, error: specsError } =
    useSelector((state) => state.adminProductSpecifications);
  const { productVariants, loading: variantsLoading, error: variantsError } =
    useSelector((state) => state.adminProductVariants);
  const { categories, loading: categoriesLoading, error: categoriesError } =
    useSelector((state) => state.category);

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
  const [variantsData, setVariantsData] = useState([]);

  useEffect(() => {
    if (!adminproducts || adminproducts.length === 0) {
      dispatch(fetchAdminProducts());
    }
    dispatch(fetchAdminProductSpecifications());
    dispatch(fetchAdminProductVariants());
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, adminproducts, categories]);

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

    const variantsWithImages = productVariants
      .filter((variant) => String(variant.product_id) === id)
      .map((variant) => ({
        ...variant,
        imageFile: null,
        imagePreview: variant.image_url || "",
      }));
    setVariantsData(variantsWithImages);
  }, [adminproducts, productSpecifications, productVariants, id]);

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

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = variantsData.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariantsData(updatedVariants);
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
      alert("Cập nhật thông số kỹ thuật thành công!");
    } catch (err) {
      alert("Cập nhật thông số kỹ thuật thất bại: " + err);
    }
  };

  const handleUpdateVariants = async () => {
    let hasError = false;
    for (const variant of variantsData) {
      try {
        const updatedVariantData = new FormData();
        updatedVariantData.append("product_id", variant.product_id);
        updatedVariantData.append("sku", variant.sku);
        updatedVariantData.append("price", variant.price);
        updatedVariantData.append("price_original", variant.price_original);
        updatedVariantData.append("stock", variant.stock);
        updatedVariantData.append("is_active", variant.is_active);

        if (variant.imageFile) {
          updatedVariantData.append("image_url", variant.imageFile);
        }

        await dispatch(
          updateAdminProductVariant({
            id: variant.variant_id,
            updatedData: updatedVariantData,
          })
        ).unwrap();
      } catch (err) {
        hasError = true;
        alert(
          `Lỗi khi cập nhật biến thể SKU: ${variant.sku || "không có"} - ${
            err.message || err
          }`
        );
      }
    }
    if (!hasError) {
      alert("Cập nhật biến thể thành công!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Tên sản phẩm không được để trống");
      return;
    }
    if (!formData.price || isNaN(formData.price)) {
      alert("Giá sản phẩm không hợp lệ");
      return;
    }
    if (!formData.category_id) {
      alert("Vui lòng chọn danh mục");
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
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/product");
    } catch (err) {
      alert("Cập nhật thất bại: " + err);
    }
  };

  return (
    <div className="admineditproduct-container">
      <div className="admineditproduct-header">
        <h1 className="admineditproduct-title">Chỉnh sửa sản phẩm</h1>
        <Link to="/admin/product" className="admineditproduct-back-link">
          <i className="bi bi-arrow-left"></i> Quay lại
        </Link>
      </div>

      {(loading || specsLoading || variantsLoading || categoriesLoading) && (
        <p>Đang tải...</p>
      )}
      {(error || specsError || variantsError || categoriesError) && (
        <p className="error">
          {error || specsError || variantsError || categoriesError}
        </p>
      )}

      {!loading &&
        !specsLoading &&
        !variantsLoading &&
        !categoriesLoading &&
        !error &&
        !specsError &&
        !variantsError &&
        !categoriesError && (
          <div className="admineditproduct-content">
            <form onSubmit={handleSubmit} className="admineditproduct-form">
              {[
                { label: "Tên sản phẩm", type: "text", name: "name", required: true },
                { label: "Giá khuyến mại", type: "number", name: "price", required: true },
                { label: "Giá Gốc", type: "number", name: "price_original" },
              ].map(({ label, type, name, required }) => (
                <div key={name} className="admineditproduct-form-group">
                  <label>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    required={required}
                  />
                </div>
              ))}

              <div className="admineditproduct-form-group">
                <label>Chọn tệp ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="admineditproduct-file-input"
                />
              </div>

              {imagePreview && (
                <div className="admineditproduct-image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              <div className="admineditproduct-form-group">
                <label>Danh mục</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admineditproduct-form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Còn hàng">Còn hàng</option>
                  <option value="Hết hàng">Hết hàng</option>
                </select>
              </div>

              <div className="admineditproduct-form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
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

            <div className="admineditproduct-right-panel">
              <div className="specification">
                <h4>Thông số kỹ thuật</h4>
                {specificationsData.map((spec, index) => (
                  <div className="specification-row" key={spec.spec_id || index}>
                    <input
                      type="text"
                      className="spec-input"
                      placeholder="Tên thông số"
                      value={spec.spec_name || ""}
                      onChange={(e) =>
                        handleSpecificationChange(index, "spec_name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="spec-input"
                      placeholder="Giá trị"
                      value={spec.spec_value || ""}
                      onChange={(e) =>
                        handleSpecificationChange(index, "spec_value", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleUpdateSpecifications}
                  className="btn btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  Cập nhật thông số kỹ thuật
                </button>
              </div>

              <div className="specification">
                <h4>Biến thể sản phẩm</h4>
                {variantsData.map((variant, index) => (
                  <div
                    className="specification-row"
                    key={variant.variant_id || index}
                    style={{ flexWrap: "wrap", gap: "10px", alignItems: "center" }}
                  >
                    <input
                      type="text"
                      className="spec-input"
                      placeholder="SKU"
                      value={variant.sku || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "sku", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="spec-input"
                      placeholder="Giá"
                      value={variant.price || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="spec-input"
                      placeholder="Giá gốc"
                      value={variant.price_original || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "price_original", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="spec-input"
                      placeholder="Tồn kho"
                      value={variant.stock || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "stock", e.target.value)
                      }
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleVariantChange(index, "imageFile", file);

                          const reader = new FileReader();
                          reader.onloadend = () =>
                            handleVariantChange(index, "imagePreview", reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="spec-input"
                      style={{ maxWidth: "120px" }}
                    />

                    {variant.imagePreview && (
                      <img
                        src={variant.imagePreview}
                        alt="Variant Preview"
                        style={{
                          maxWidth: "80px",
                          maxHeight: "80px",
                          borderRadius: "4px",
                          marginTop: "4px",
                        }}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleUpdateVariants}
                  className="btn btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  Cập nhật biến thể
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminProductEdit;
