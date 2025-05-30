import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUsers, updateUser } from "../../slices/adminuserSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, loading, error } = useSelector((state) => state.adminuser);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_file: file,
      }));

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
    formPayload.append("username", formData.username);
    formPayload.append("email", formData.email);
    formPayload.append("full_name", formData.full_name);
    formPayload.append("phone", formData.phone);
    formPayload.append("address", formData.address);
    formPayload.append("ward", formData.ward);
    formPayload.append("district", formData.district);
    formPayload.append("city", formData.city);
    formPayload.append("role", formData.role);

    if (formData.image_file) {
      formPayload.append("image_url", formData.image_file);
    }

    dispatch(updateUser({ id, updatedData: formPayload }))
      .unwrap()
      .then(() => {
        toast.success("Cập nhật user thành công!");
        navigate("/admin/users");
      })
      .catch((err) => {
        toast.error("Cập nhật thất bại: " + err);
      });
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Cập nhật người dùng</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tên tài khoản:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Họ tên:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Số điện thoại:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phường:</label>
          <input
            type="text"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Quận:</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Thành phố:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Vai trò:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          >
            <option value="">-- Chọn vai trò --</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Ảnh đại diện:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Ảnh đại diện preview"
              className="mt-2 h-20 w-20 object-cover rounded"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
    </div>
  );
};

export default UpdateUser;
