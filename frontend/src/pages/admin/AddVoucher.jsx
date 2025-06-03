import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addAdminVoucher } from "../../slices/AdminVoucher";
import { toast, ToastContainer } from "react-toastify";
import "../../assets/admin/AddVoucher.css"; 
const AddVoucherPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.adminVoucher);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        discount_amount: parseFloat(data.discount_amount),
        min_order_value: parseInt(data.min_order_value),
        is_active: Number(data.is_active),
      };

      await dispatch(addAdminVoucher(formattedData)).unwrap();

      toast.success("🎉 Thêm voucher thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/admin/vouchers");
      }, 2200);
    } catch (err) {
      toast.error("❌ Lỗi: " + err, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="addVoucher-container max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl">
      <ToastContainer />
      <h2 className="addVoucher-title text-3xl font-bold text-center text-blue-600 mb-6">
        Thêm mã giảm giá mới
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="addVoucher-form space-y-5">
        {[
          { name: "code", label: "Mã Voucher", type: "text" },
          { name: "title", label: "Tiêu đề", type: "text" },
          { name: "discount_amount", label: "Số tiền giảm", type: "number", step: "1000" },
          { name: "min_order_value", label: "Giá trị đơn tối thiểu", type: "number" },
          { name: "start_date", label: "Ngày bắt đầu", type: "datetime-local" },
          { name: "end_date", label: "Ngày kết thúc", type: "datetime-local" },
        ].map(({ name, label, type, step }) => (
          <div key={name} className="addVoucher-field flex flex-col">
            <label className="addVoucher-label text-gray-700 font-medium mb-1">{label}</label>
            <input
              type={type}
              step={step}
              {...register(name, { required: `${label} là bắt buộc` })}
              className="addVoucher-input p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors[name] && (
              <span className="addVoucher-error text-red-500 text-sm mt-1">
                {errors[name]?.message}
              </span>
            )}
          </div>
        ))}

        <div className="addVoucher-select-container flex flex-col">
          <label className="addVoucher-label text-gray-700 font-medium mb-1">
            Trạng thái hoạt động
          </label>
          <select
            {...register("is_active")}
            className="addVoucher-select p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value={1}>Kích hoạt</option>
            <option value={0}>Không kích hoạt</option>
          </select>
        </div>

        <div className="addVoucher-button-wrapper text-center">
          <button
            type="submit"
            disabled={loading}
            className="addVoucher-button px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Thêm Voucher"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVoucherPage;
