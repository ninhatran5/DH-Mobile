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
  const [dragActive, setDragActive] = useState(false);

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

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      toast.error("Vui lòng chọn file ảnh hợp lệ!");
    }
  };

  const handleInputFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      handleFileChange(selected);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(selectedBanner?.image_url || "");
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
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

        <label>Ảnh banner hiện tại:</label>
        
        {/* Image Upload Area */}
        <div className="image-upload-section">
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-image' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="image-preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                <div className="image-overlay">
                  <div className="image-actions">
                    <button 
                      type="button" 
                      className="btn-change-image"
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16l-4-4h3V4h2v8h3l-4 4z" fill="currentColor"/>
                        <path d="M20 18H4v-7H2v9h20v-9h-2v7z" fill="currentColor"/>
                      </svg>
                      Thay đổi ảnh
                    </button>
                    {file && (
                      <button 
                        type="button" 
                        className="btn-remove-image"
                        onClick={removeImage}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="upload-text">
                  <strong>Kéo thả ảnh vào đây</strong> hoặc
                </p>
                <button 
                  type="button" 
                  className="btn-select-file"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  Chọn ảnh từ máy tính
                </button>
                <p className="upload-hint">Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)</p>
              </div>
            )}
          </div>
          
          {/* Hidden file input */}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleInputFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <label>Link Banner:</label>
        <input
          type="text"
          name="link_url"
          value={formData.link_url}
          onChange={handleChange}
          placeholder="Nhập URL liên kết..."
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
