import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateAdminVoucher, fetchAdminVouchers } from "../../slices/AdminVoucher";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/admin/VoucherList.css";

const EditVoucher = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vouchers, loading, error } = useSelector((state) => state.adminVoucher);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discount_amount: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  // Hàm chuyển đổi datetime backend "YYYY-MM-DD HH:mm:ss" => input datetime-local "YYYY-MM-DDTHH:mm"
  const formatDateTimeLocal = (datetimeStr) => {
    if (!datetimeStr) return "";
    return datetimeStr.replace(" ", "T").slice(0, 16);
  };

  // Hàm chuyển đổi ngược lại input datetime-local => backend
  const formatDateTimeBackend = (datetimeLocalStr) => {
    if (!datetimeLocalStr) return "";
    return datetimeLocalStr.replace("T", " ") + ":00";
  };

  useEffect(() => {
    dispatch(fetchAdminVouchers());
  }, [dispatch]);

  useEffect(() => {
    if (vouchers.length > 0) {
      const voucherToEdit = vouchers.find(
        (voucher) => voucher.voucher_id === parseInt(id, 10)
      );
      if (voucherToEdit) {
        setFormData({
          code: voucherToEdit.code || "",
          title: voucherToEdit.title || "",
          discount_amount: voucherToEdit.discount_amount || "",
          min_order_value: voucherToEdit.min_order_value || "",
          start_date: formatDateTimeLocal(voucherToEdit.start_date),
          end_date: formatDateTimeLocal(voucherToEdit.end_date),
          is_active: voucherToEdit.is_active === 1,
        });
      }
    }
  }, [vouchers, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tạo FormData để gửi (nếu backend yêu cầu multipart/form-data)
    const updatedData = new FormData();

    updatedData.append("code", formData.code);
    updatedData.append("title", formData.title);
    updatedData.append("discount_amount", parseFloat(formData.discount_amount));
    updatedData.append("min_order_value", parseInt(formData.min_order_value, 10));
    updatedData.append("start_date", formatDateTimeBackend(formData.start_date));
    updatedData.append("end_date", formatDateTimeBackend(formData.end_date));
    updatedData.append("is_active", formData.is_active ? 1 : 0);

    try {
      const resultAction = await dispatch(updateAdminVoucher({ id, updatedData }));
      if (updateAdminVoucher.fulfilled.match(resultAction)) {
        toast.success("Cập nhật voucher thành công!");
        navigate("/admin/vouchers");
      } else {
        toast.error(resultAction.payload || "Cập nhật voucher thất bại!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật voucher!");
    }
  };

  return (
    <div className="admineditvoucher-container">
      <ToastContainer />
      <h2 className="admineditvoucher-title">Chỉnh sửa mã giảm giá</h2>
      <form className="admineditvoucher-form" onSubmit={handleSubmit}>
        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Mã giảm giá:</label>
          <input
            type="text"
            name="code"
            className="admineditvoucher-input admineditvoucher-code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Tiêu đề:</label>
          <input
            type="text"
            name="title"
            className="admineditvoucher-input admineditvoucher-title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Giá trị giảm (₫):</label>
          <input
            type="number"
            step="0.01"
            name="discount_amount"
            className="admineditvoucher-input admineditvoucher-discount"
            value={formData.discount_amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Đơn hàng tối thiểu (₫):</label>
          <input
            type="number"
            name="min_order_value"
            className="admineditvoucher-input admineditvoucher-minorder"
            value={formData.min_order_value}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Ngày bắt đầu:</label>
          <input
            type="datetime-local"
            name="start_date"
            className="admineditvoucher-input admineditvoucher-startdate"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group">
          <label className="admineditvoucher-label">Ngày kết thúc:</label>
          <input
            type="datetime-local"
            name="end_date"
            className="admineditvoucher-input admineditvoucher-enddate"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admineditvoucher-group admineditvoucher-active-group">
          <label className="admineditvoucher-label">
            <input
              type="checkbox"
              name="is_active"
              className="admineditvoucher-checkbox"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Kích hoạt
          </label>
        </div>

        <button type="submit" className="admineditvoucher-submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default EditVoucher;
