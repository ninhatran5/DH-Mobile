/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBannerById, updateBanner } from "../../slices/BannerSlice";
import "../../assets/admin/editbanner.css";
import { toast } from "react-toastify";

const EditBanner = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedBanner, loading } = useSelector((state) => state.banner);

  const [formData, setFormData] = useState({
    title: "",
    link_url: "",
    is_active: false,
    image_url: "",
  });

  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBannerById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedBanner) {
      setFormData({
        title: selectedBanner.title || "",
        link_url: selectedBanner.link_url || "",
        is_active: selectedBanner.is_active === 1 || selectedBanner.is_active === true,
        image_url: selectedBanner.image_url || "",
      });
      setPreview(selectedBanner.image_url || "");
    }
  }, [selectedBanner]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title); // Send original title
    data.append("link_url", formData.link_url);
    data.append("is_active", formData.is_active ? 1 : 0);

    if (file) {
      data.append("image_url", file);
    }

    setUploading(true);
    try {
      const resultAction = await dispatch(updateBanner({ id, data })).unwrap();
      await dispatch(fetchBannerById(id));
      toast.success("Cập nhật thành công!");
      navigate("/admin/banners");
    } catch (err) {
      toast.error("Lỗi cập nhật banner:", err);
      alert("Lỗi cập nhật: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="edit-banner-container">
      <h2>Chỉnh sửa Banner</h2>
      <form className="edit-banner-form" onSubmit={handleSubmit}>
        <label>Tiêu đề:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          disabled
          readOnly
          className="disabled-input"
        />

        <label>Ảnh banner:</label>
        {preview ? (
          <img src={preview} alt="preview" className="preview-image" />
        ) : (
          <p>Chưa có ảnh</p>
        )}

        <label>Chọn ảnh mới:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
        />

        <label>Link Banner:</label>
        <input
          type="text"
          name="link_url"
          value={formData.link_url}
          onChange={handleChange}
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <span>Hiển thị banner</span>
        </label>

        <button type="submit" disabled={uploading} className="btn-submit">
          {uploading ? "Đang cập nhật..." : "Cập nhật Banner"}
        </button>
      </form>
    </div>
  );
};

export default EditBanner;
