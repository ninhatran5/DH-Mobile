import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAdminProduct } from "../../slices/adminproductsSlice";
import { addAdminProductSpecification } from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/admin/AddProduct.css";
import { fetchAttributeValues } from "../../slices/attributeValueSlice";
import { fetchAttributes } from "../../slices/Attribute";
import { addAdminProductVariant } from "../../slices/AdminProductVariants";
import { addVariantAttributeValue } from "../../slices/variantAttributeValueSlice";
import Loading from "../../components/Loading";

const AdminAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { loading: productLoading, error: productError } = useSelector((state) => state.adminproduct);
  const { loading: specLoading, error: specError } = useSelector((state) => state.adminProductSpecifications);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    price_original: "",
    status: 0,
  });
  const { attributeValues } = useSelector(state => state.attributeValue || {});
  const { attributes } = useSelector(state => state.attribute || {});
  const [variantFormData, setVariantFormData] = useState({
    sku: "",
    price: "",
    price_original: "",
    stock: 0,
    image_url: "",
    is_active: 1,
    attributes: []
  });
  
  useEffect(() => {
    dispatch(fetchAttributeValues());
    dispatch(fetchAttributes());
  }, [dispatch]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantExpanded, setVariantExpanded] = useState([]);

  const [errors, setErrors] = useState({});

  const handleVariantInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVariantFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };
  
  const handleAttributeChange = (attributeId, value_id) => {
    if (!attributeId || !value_id) return;
  
    const selectedValue = attributeValues[attributeId]?.find(
      av => String(av.value_id) === String(value_id)
    );
    const attribute = attributes.find(attr => String(attr.attribute_id) === String(attributeId));
    if (!selectedValue || !attribute) return;
  
    setVariantFormData(prev => {
      const newAttributes = [...(prev.attributes || [])];
      const existingIndex = newAttributes.findIndex(
        attr => String(attr.attribute_id) === String(attributeId)
      );
      const newAttribute = {
        attribute_id: parseInt(attributeId),
        value_id: parseInt(value_id),
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
  };
  
  const handleAddVariant = () => {
    if (variants.length >= 3) {
      toast.warning('Chỉ có thể thêm tối đa 3 biến thể.');
      return;
    }
    setShowVariantForm(true);
  };

  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();

    if (!variantFormData.sku.trim()) return toast.warning('SKU không được để trống');
    // Kiểm tra trùng SKU
    if (variants.some(v => v.sku.trim().toLowerCase() === variantFormData.sku.trim().toLowerCase())) {
      return toast.warning('SKU đã tồn tại trong danh sách biến thể!');
    }
    if (!variantFormData.price || isNaN(variantFormData.price)) return toast.warning('Giá không hợp lệ');
    if (!variantFormData.stock || isNaN(variantFormData.stock)) return toast.warning('Số lượng tồn kho không hợp lệ');
    if (!variantFormData.attributes || variantFormData.attributes.length === 0)
      return toast.warning('Vui lòng chọn thuộc tính cho biến thể');

    setVariants([...variants, variantFormData]);
    setVariantFormData({
      sku: '', price: '', price_original: '', stock: 0, image_url: '', is_active: 1, attributes: []
    });
    setShowVariantForm(false);
    toast.success('Biến thể đã được thêm vào danh sách.');
  };

  const [specifications, setSpecifications] = useState([{ spec_name: "", spec_value: "" }]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSpecChange = (index, e) => {
    const { name, value } = e.target;
    const newSpecs = [...specifications];
    newSpecs[index][name] = value;
    setSpecifications(newSpecs);
  };

  const addSpecField = () => {
    setSpecifications([...specifications, { spec_name: "", spec_value: "" }]);
  };

  const removeSpecField = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.category_id) newErrors.category_id = 'Vui lòng chọn danh mục.';
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên sản phẩm.';
    if (!formData.price) newErrors.price = 'Vui lòng nhập giá bán.';
    if (!formData.price_original) newErrors.price_original = 'Vui lòng nhập giá gốc.';
    // Validate giá bán < giá gốc
    if (
      formData.price &&
      formData.price_original &&
      !isNaN(formData.price) &&
      !isNaN(formData.price_original) &&
      Number(formData.price) >= Number(formData.price_original)
    ) {
      newErrors.price = 'Giá bán phải nhỏ hơn giá gốc.';
    }
    specifications.forEach((spec, index) => {
      if (!spec.spec_name.trim()) newErrors[`spec_name_${index}`] = 'Vui lòng nhập tên thông số.';
      if (!spec.spec_value.trim()) newErrors[`spec_value_${index}`] = 'Vui lòng nhập giá trị thông số.';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (imageFile) {
      form.append('image_url', imageFile);
    }

    try {
      const resultAction = await dispatch(addAdminProduct(form)).unwrap();
      const newProductId = resultAction.product_id;

      for (const spec of specifications) {
        await dispatch(addAdminProductSpecification({
          product_id: newProductId,
          spec_name: spec.spec_name,
          spec_value: spec.spec_value,
        })).unwrap();
      }

      for (const variant of variants) {
        const variantData = {
          ...variant,
          product_id: newProductId
        };
        let variantResponse;
        if (variant.image_url instanceof File) {
          const imageFormData = new FormData();
          imageFormData.append('image_url', variant.image_url);
          Object.entries(variantData).forEach(([key, value]) => {
            imageFormData.append(key, value);
          });
          variantResponse = await dispatch(addAdminProductVariant(imageFormData)).unwrap();
        } else {
          variantResponse = await dispatch(addAdminProductVariant(variantData)).unwrap();
        }

        const variant_id = variantResponse?.variant_id;
        if (!variant_id) throw new Error('Không nhận được ID biến thể');

        for (const attr of variant.attributes) {
          await dispatch(addVariantAttributeValue({
            variant_id,
            attribute_id: parseInt(attr.attribute_id),
            value_id: parseInt(attr.value_id)
          })).unwrap();
        }
      }

      toast.success('Thêm sản phẩm và biến thể thành công!');
      setFormData({
        category_id: '',
        name: '',
        description: '',
        price: '',
        price_original: '',
        status: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setSpecifications([{ spec_name: '', spec_value: '' }]);
      setVariants([]);
      navigate('/admin/product');
    } catch (error) {
      toast.error(error || 'Lỗi khi thêm sản phẩm.');
    }
  };

  const toggleVariantExpand = (index) => {
    setVariantExpanded((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const handleDeleteVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {(productLoading || specLoading) && <Loading />}
      <div className="container mt-2 p-4 rounded shadow adminAddProduct-container" style={{ maxWidth: "1200px", backgroundColor: "#f9f9f9", minHeight: "600px" }}>
        <h2 className="mb-4 text-center adminAddProduct-title">Thêm sản phẩm mới</h2>
        {(productError || specError) && (
          <div className="alert alert-danger adminAddProduct-alert">{productError || specError}</div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="adminAddProduct-form">
          <div className="row adminAddProduct-row">
            {/* Cột trái */}
            <div className="col-md-6 adminAddProduct-left-column">
              {/* Danh mục */}
              <div className="mb-3 adminAddProduct-category">
                <label className="form-label fw-bold adminAddProduct-label">Danh mục:</label>
                {categoryLoading ? (
                  <div className="form-text adminAddProduct-loading">Đang tải danh mục...</div>
                ) : (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="form-select adminAddProduct-select"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                  </select>
                )}
                {errors.category_id && <div className="adminAddProduct-error">{errors.category_id}</div>}
              </div>

              {/* Tên sản phẩm */}
              <div className="mb-3 adminAddProduct-name">
                <label className="form-label fw-bold adminAddProduct-label">Tên sản phẩm * :</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control adminAddProduct-input"
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <div className="adminAddProduct-error">{errors.name}</div>}
              </div>

              {/* Mô tả */}
              <div className="mb-3 adminAddProduct-description">
                <label className="form-label fw-bold adminAddProduct-label">Mô tả * :</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả"
                  className="form-control adminAddProduct-textarea"
                  rows="4"
                />
              </div>

              {/* Giá bán và Giá gốc */}
              <div className="row adminAddProduct-price-row">
                <div className="col-6 mb-3 adminAddProduct-price">
                  <label className="form-label fw-bold adminAddProduct-label">Giá bán * :</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-control adminAddProduct-input"
                    placeholder="Nhập giá bán"
                  />
                  {errors.price && <div className="adminAddProduct-error">{errors.price}</div>}
                </div>
                <div className="col-6 mb-3 adminAddProduct-price-original">
                  <label className="form-label fw-bold adminAddProduct-label">Giá gốc *:</label>
                  <input
                    type="number"
                    name="price_original"
                    value={formData.price_original}
                    onChange={handleChange}
                    className="form-control adminAddProduct-input"
                    placeholder="Nhập giá gốc"
                  />
                  {errors.price_original && <div className="adminAddProduct-error">{errors.price_original}</div>}
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="mb-3 adminAddProduct-specifications">
                <label className="form-label fw-bold adminAddProduct-label">Thông số kỹ thuật * :</label>
                {specifications.map((spec, index) => (
                  <div key={index} className="row mb-2 adminAddProduct-spec-row">
                    <div className="col-5 adminAddProduct-spec-name">
                      <input
                        type="text"
                        name="spec_name"
                        placeholder="Tên thông số"
                        value={spec.spec_name}
                        onChange={(e) => handleSpecChange(index, e)}
                        className="form-control adminAddProduct-input"
                      />
                      {errors[`spec_name_${index}`] && <div className="adminAddProduct-error">{errors[`spec_name_${index}`]}</div>}
                    </div>
                    <div className="col-5 adminAddProduct-spec-value">
                      <input
                        type="text"
                        name="spec_value"
                        placeholder="Giá trị"
                        value={spec.spec_value}
                        onChange={(e) => handleSpecChange(index, e)}
                        className="form-control adminAddProduct-input"
                      />
                      {errors[`spec_value_${index}`] && <div className="adminAddProduct-error">{errors[`spec_value_${index}`]}</div>}
                    </div>
                    <div className="col-2 adminAddProduct-spec-remove">
                      {specifications.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger w-100 adminAddProduct-remove-btn"
                          onClick={() => removeSpecField(index)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-primary adminAddProduct-add-spec-btn" onClick={addSpecField}>
                  <i className="bi bi-plus-lg me-1"></i>
                  Thêm thông số kỹ thuật
                </button>
              </div>
            </div>

            {/* Cột phải */}
            <div className="col-md-6 adminAddProduct-right-column">
             

              {/* Ảnh */}
              <div className="mb-3 adminAddProduct-image">
                <label className="form-label fw-bold adminAddProduct-label">Ảnh sản phẩm * :</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="form-control adminAddProduct-input"
                />
                {imagePreview && (
                  <div className="mt-3 text-center adminAddProduct-image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "200px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Form thêm biến thể */}
              {variants.map((variant, index) => (
                <div key={index} className="variant-item adminAddProduct-variant-item">
                  <div className="d-flex justify-content-between align-items-center adminAddProduct-variant-header">
                    <span>Biến thể {index + 1}</span>
                    <div>
                      <button type="button" className="btn btn-link adminAddProduct-expand-btn" onClick={() => toggleVariantExpand(index)}>
                        {variantExpanded[index] ? 'Thu gọn' : 'Mở rộng'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-link adminAddProduct-delete-btn"
                        onClick={() => handleDeleteVariant(index)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  {variantExpanded[index] && (
                    <div className="variant-details adminAddProduct-variant-details">
                      <p>SKU: {variant.sku}</p>
                      <p>Giá: {variant.price}</p>
                      <p>Giá gốc: {variant.price_original}</p>
                      <p>Tồn kho: {variant.stock}</p>
                      <p>Ảnh URL: {variant.image_url instanceof File ? URL.createObjectURL(variant.image_url) : variant.image_url}</p>
                      <p>Thuộc tính:</p>
                      <ul>
                        {variant.attributes.map((attr, i) => (
                          <li key={i}>{attr.name}: {attr.value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className="btn btn-secondary adminAddProduct-add-variant-btn" onClick={handleAddVariant}>
                Thêm biến thể
              </button>

              {showVariantForm && (
                <div className="mt-4 adminAddProduct-variant-form">
                  <h4>Thêm biến thể sản phẩm</h4>
                  <div className="mb-3 adminAddProduct-variant-sku">
                    <label>SKU:</label>
                    <input className="form-control adminAddProduct-input" name="sku" value={variantFormData.sku} onChange={handleVariantInputChange} />
                  </div>
                  <div className="mb-3 adminAddProduct-variant-price">
                    <label>Giá:</label>
                    <input type="number" className="form-control adminAddProduct-input" name="price" value={variantFormData.price} onChange={handleVariantInputChange} />
                  </div>
                  <div className="mb-3 adminAddProduct-variant-price-original">
                    <label>Giá gốc:</label>
                    <input type="number" className="form-control adminAddProduct-input" name="price_original" value={variantFormData.price_original} onChange={handleVariantInputChange} />
                  </div>
                  <div className="mb-3 adminAddProduct-variant-stock">
                    <label>Tồn kho:</label>
                    <input type="number" className="form-control adminAddProduct-input" name="stock" value={variantFormData.stock} onChange={handleVariantInputChange} />
                  </div>
                  <div className="mb-3 adminAddProduct-variant-image">
                    <label>Ảnh:</label>
                    <input
                      type="file"
                      className="form-control adminAddProduct-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setVariantFormData((prev) => ({ ...prev, image_url: file }));
                        }
                      }}
                    />
                  </div>
                  <div className="mb-3 adminAddProduct-variant-attributes">
                    <label>Thuộc tính:</label>
                    {attributes.map(attribute => (
                      <div key={attribute.attribute_id} className="mb-2 adminAddProduct-attribute">
                        <label>{attribute.name}</label>
                        <select
                          className="form-select adminAddProduct-select"
                          onChange={(e) => handleAttributeChange(attribute.attribute_id, e.target.value)}
                          value={
                            variantFormData.attributes.find(a => a.attribute_id === attribute.attribute_id)?.value_id || ''
                          }
                        >
                          <option value="">-- Chọn {attribute.name} --</option>
                          {attributeValues[attribute.attribute_id]?.map(val => (
                            <option key={val.value_id} value={val.value_id}>{val.value}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                 
                  <div className="d-flex justify-content-between adminAddProduct-variant-buttons">
                    <button className="btn btn-primary adminAddProduct-add-variant-submit-btn" type="button" onClick={handleAddVariantSubmit}>Thêm biến thể</button>
                    <button className="btn btn-secondary adminAddProduct-cancel-btn" type="button" onClick={() => setShowVariantForm(false)}>Hủy</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4 adminAddProduct-submit">
            <button
              type="submit"
              className="btn btn-primary btn-lg adminAddProduct-submit-btn"
              disabled={productLoading || specLoading}
            >
              {(productLoading || specLoading) ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2 adminAddProduct-spinner" role="status" aria-hidden="true"></span>
                  Đang thêm...
                </>
              ) : (
                "Thêm sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAddProduct;
