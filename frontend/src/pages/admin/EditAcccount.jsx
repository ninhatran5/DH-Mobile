import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUsers, updateUser } from "../../slices/adminuserSlice";
import { toast } from "react-toastify";
import "../../assets/admin/EditAcccount.css";
import defaultAvatar from "../../assets/images/adminacccount.jpg";


const API_BASE = "https://provinces.open-api.vn/api";

const UpdateUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error } = useSelector((state) => state.adminuser);

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    role: "",
    image_file: null,
    image_url: "",
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    } else {
      const userToEdit = users.find((u) => u.user_id?.toString() === id);
      if (userToEdit) {
        setFormData({
          username: userToEdit.username || "",
          email: userToEdit.email || "",
          full_name: userToEdit.full_name || "",
          phone: userToEdit.phone || "",
          address: userToEdit.address || "",
          ward: userToEdit.ward || "",
          district: userToEdit.district || "",
          city: userToEdit.city || "",
          role: userToEdit.role || "",
          image_file: null,
          image_url: userToEdit.image_url || "",
        });
        setImagePreview(
          userToEdit.image_url && userToEdit.image_url.trim() !== ""
            ? userToEdit.image_url
            : defaultAvatar
        );
      } else {
        toast.error("Không tìm thấy user cần chỉnh sửa!");
        navigate("/admin/accounts");
      }
    }
  }, [dispatch, id, users, navigate]);

  // Load danh sách tỉnh/thành phố
  useEffect(() => {
    fetch(`${API_BASE}/p`)
      .then((res) => res.json())
      .then((data) => setCities(data));
  }, []);

  // Khi chọn thành phố → lấy danh sách quận
  useEffect(() => {
    const selectedCity = cities.find((c) => c.name === formData.city);
    if (selectedCity) {
      fetch(`${API_BASE}/p/${selectedCity.code}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.city, cities]);

  // Khi chọn quận → lấy danh sách phường
  useEffect(() => {
    const selectedDistrict = districts.find((d) => d.name === formData.district);
    if (selectedDistrict) {
      fetch(`${API_BASE}/d/${selectedDistrict.code}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []));
    } else {
      setWards([]);
    }
  }, [formData.district, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset district/ward khi chọn lại city
    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        city: value,
        district: "",
        ward: "",
      }));
    }

    if (name === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        ward: "",
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.role === "customer") {
      toast.error("Không được cập nhật tài khoản của vai trò Khách hàng!");
      return;
    }
    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image_file" && value) {
        formPayload.append("image_url", value);
      } else if (key !== "image_file") {
        formPayload.append(key, value);
      }
    });

    dispatch(updateUser({ id, updatedData: formPayload }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật user thành công!");
        navigate("/admin/accounts");
      })
      .catch((err) => {
        toast.error("Cập nhật thất bại: " + err);
      });
  };

  return (
    <div className="admin-edit-account-container">
      <h2 className="admin-edit-account-title">Cập nhật người dùng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit} className="admin-edit-account-form-horizontal">
        <div className="admin-edit-account-section">
          <div className="admin-edit-account-grid">
            <div>
              <label className="admin-edit-account-label">Tên tài khoản</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="admin-edit-account-input"
                disabled={formData.role === "customer"}
              />

              <label className="admin-edit-account-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="admin-edit-account-input"
                disabled={formData.role === "customer"}
              />

              <label className="admin-edit-account-label">Họ tên</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="admin-edit-account-input"
                disabled={formData.role === "customer"}
              />

              <label className="admin-edit-account-label">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="admin-edit-account-input"
                disabled={formData.role === "customer"}
              />

              <label className="admin-edit-account-label">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="admin-edit-account-input"
                disabled={formData.role === "customer"}
              />
            </div>

            <div>
              <label className="admin-edit-account-label">Thành phố</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="admin-edit-account-select"
                disabled={formData.role === "customer"}
              >
                <option value="">Chọn thành phố</option>
                {cities.map((city) => (
                  <option key={city.code} value={city.name}>{city.name}</option>
                ))}
              </select>

              <label className="admin-edit-account-label">Quận</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="admin-edit-account-select"
                disabled={formData.role === "customer"}
              >
                <option value="">Chọn quận</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>

              <label className="admin-edit-account-label">Phường</label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="admin-edit-account-select"
                disabled={formData.role === "customer"}
              >
                <option value="">Chọn phường</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>

              <label className="admin-edit-account-label">Vai trò</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="admin-edit-account-select"
                disabled={formData.role === "customer"}
              >
                <option value="">Chọn vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
                <option value="sale">Nhân viên bán hàng</option>
                <option value="shipper">Nhân viên giao hàng</option>
                <option value="checker">Nhân viên kiểm hàng</option>
              </select>
            </div>

            <div className="admin-edit-account-image-upload">
              <label className="admin-edit-account-label">Ảnh đại diện</label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                  alt="Avatar Preview"
                  className="admin-edit-account-image-preview"
                />
              )}
            </div>
          </div>
        </div>

        <div className="admin-edit-account-form-buttons">
          <button
            type="button"
            className="admin-edit-account-btn-cancel"
            onClick={() => navigate('/admin/accounts')}
          >
            Hủy
          </button>
          {formData.role !== "customer" && (
            <button type="submit" className="admin-edit-account-btn-submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;

