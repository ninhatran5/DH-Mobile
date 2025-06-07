import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAdminProduct } from "../../slices/adminproductsSlice";
import { addAdminProductSpecification } from "../../slices/adminProductSpecificationsSlice";
import { fetchCategories } from "../../slices/adminCategories";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/admin/AddProduct.css";

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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

    // Validation
    if (!formData.category_id || !formData.name || !formData.price) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    for (const spec of specifications) {
      if (!spec.spec_name.trim() || !spec.spec_value.trim()) {
        toast.error("Vui lòng điền đầy đủ thông số kỹ thuật!");
        return;
      }
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (imageFile) {
      form.append("image_url", imageFile);
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

      toast.success("Thêm sản phẩm thành công!");
      setFormData({
        category_id: "",
        name: "",
        description: "",
        price: "",
        price_original: "",
        status: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setSpecifications([{ spec_name: "", spec_value: "" }]);
      navigate("/admin/product");
    } catch (error) {
      toast.error(error || "Lỗi khi thêm sản phẩm.");
    }
  };

  return (
    <div className="container mt-2 p-4 rounded shadow" style={{ maxWidth: "1200px", backgroundColor: "#f9f9f9", minHeight: "600px" }}>
      <h2 className="mb-4 text-center">Thêm sản phẩm mới</h2>
      {(productError || specError) && (
        <div className="alert alert-danger">{productError || specError}</div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row">
          {/* Cột trái */}
          <div className="col-md-6">
            {/* Danh mục */}
            <div className="mb-3">
              <label className="form-label fw-bold">Danh mục:</label>
              {categoryLoading ? (
                <div className="form-text">Đang tải danh mục...</div>
              ) : (
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="form-select"
                  
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Tên sản phẩm */}
            <div className="mb-3">
              <label className="form-label fw-bold">Tên sản phẩm:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                
              />
            </div>

            {/* Mô tả */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mô tả:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="4"
              />
            </div>

            {/* Giá bán và Giá gốc */}
            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label fw-bold">Giá bán:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label fw-bold">Giá gốc:</label>
                <input
                  type="number"
                  name="price_original"
                  value={formData.price_original}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className="mb-3">
              <label className="form-label fw-bold">Thông số kỹ thuật:</label>
              {specifications.map((spec, index) => (
                <div key={index} className="row mb-2">
                  <div className="col-5">
                    <input
                      type="text"
                      name="spec_name"
                      placeholder="Tên thông số"
                      value={spec.spec_name}
                      onChange={(e) => handleSpecChange(index, e)}
                      className="form-control"
                      
                    />
                  </div>
                  <div className="col-5">
                    <input
                      type="text"
                      name="spec_value"
                      placeholder="Giá trị"
                      value={spec.spec_value}
                      onChange={(e) => handleSpecChange(index, e)}
                      className="form-control"
                      
                    />
                  </div>
                  <div className="col-2">
                    {specifications.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger w-100"
                        onClick={() => removeSpecField(index)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-primary" onClick={addSpecField}>
                <i className="bi bi-plus-lg me-1"></i>
                Thêm thông số kỹ thuật
              </button>
            </div>
          </div>

          {/* Cột phải */}
          <div className="col-md-6">
            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value={0}>Ẩn</option>
                <option value={1}>Hiển thị</option>
              </select>
            </div>

            {/* Ảnh */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ảnh sản phẩm:</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                className="form-control"
              />
              {imagePreview && (
                <div className="mt-3 text-center">
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
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={productLoading || specLoading}
          >
            {(productLoading || specLoading) ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang thêm...
              </>
            ) : (
              "Thêm sản phẩm"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
