import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUsers, updateUser } from "../../slices/adminuserSlice";
import { toast } from "react-toastify";
import "../../assets/admin/EditAcccount.css";

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
        setImagePreview(userToEdit.image_url || "");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_file: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <div className="update-user-container">
      <h2>Cập nhật người dùng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit} className="update-user-form-horizontal">
        <div className="form-section">
          <div className="form-grid">
            <div>
              <label>Tên tài khoản</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} />

              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />

              <label>Họ tên</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />

              <label>Số điện thoại</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />

              <label>Địa chỉ</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div>
              <label>Thành phố</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="">-- Chọn thành phố --</option>
                {cities.map((city) => (
                  <option key={city.code} value={city.name}>{city.name}</option>
                ))}
              </select>

              <label>Quận</label>
              <select name="district" value={formData.district} onChange={handleChange}>
                <option value="">-- Chọn quận --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>

              <label>Phường</label>
              <select name="ward" value={formData.ward} onChange={handleChange}>
                <option value="">-- Chọn phường --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>

              <label>Vai trò</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="">-- Chọn vai trò --</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
                <option value="sale">Nhân viên bán hàng</option>
                <option value="shipper">Nhân viên giao hàng</option>
                <option value="checker">Nhân viên kiểm hàng</option>
              </select>
            </div>

            <div className="image-upload">
              <label>Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            </div>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
