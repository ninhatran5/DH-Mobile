import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addAdminVoucher } from "../../slices/AdminVoucher";
import { toast, ToastContainer } from "react-toastify";
import "../../assets/admin/AddVoucher.css";

const AddVoucherPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, vouchers } = useSelector((state) => state.adminVoucher);

  const existingVoucherCodes = vouchers?.map((v) => v.code) || [];

  const [randomCode, setRandomCode] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  const startDateValue = watch("start_date");

  useEffect(() => {
    if (randomCode) {
      setValue("code", randomCode, { shouldValidate: true });
    }
  }, [randomCode, setValue]);

  // Hàm tạo mã voucher ngẫu nhiên 16 ký tự (chữ hoa + số)
  const generateRandomCode = (length = 16) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Tạo mã không trùng, thử tối đa 100 lần
  const generateUniqueCode = () => {
    let newCode = generateRandomCode();
    let attempts = 0;
    while (existingVoucherCodes.includes(newCode) && attempts < 100) {
      newCode = generateRandomCode();
      attempts++;
    }
    if (attempts >= 100) {
      toast.error("Không thể tạo mã voucher không trùng, vui lòng thử lại!");
      return null;
    }
    return newCode;
  };

  const handleGenerateCode = () => {
    const newCode = generateUniqueCode();
    if (newCode) {
      setRandomCode(newCode);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (existingVoucherCodes.includes(data.code)) {
        toast.error("Mã voucher đã tồn tại, vui lòng tạo mã khác hoặc nhập mã khác!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

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
      toast.error("Lỗi: " + err, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fields = [
    { name: "code", label: "Mã Voucher", type: "text", placeholder: "Nhập mã voucher", required: true },
    { name: "title", label: "Tiêu đề", type: "text", placeholder: "Nhập tiêu đề voucher", required: true },
    { name: "discount_amount", label: "Số tiền giảm", type: "number", step: "1000", placeholder: "Nhập số tiền giảm", required: true },
    { name: "min_order_value", label: "Giá trị đơn tối thiểu", type: "number", placeholder: "Nhập giá trị đơn tối thiểu", required: true },
    { name: "start_date", label: "Ngày bắt đầu", type: "datetime-local", placeholder: "", required: true },
  ];

  return (
    <div className="addVoucher-container max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl">
      <ToastContainer />
      <h2 className="addVoucher-title text-3xl font-bold text-center text-blue-600 mb-6">
        Thêm mã giảm giá mới
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="addVoucher-form space-y-5">
        {fields.map(({ name, label, type, step, placeholder, required }) => {
          const hasError = !!errors[name];

          if (name === "code") {
            return (
              <div key={name} className="addVoucher-field flex flex-col relative">
                <label className="addVoucher-label text-gray-700 font-medium mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type={type}
                    placeholder={placeholder}
                    {...register(name, { required: required ? `${label} là bắt buộc` : false })}
                    className={`addVoucher-input p-3 rounded-md border w-full ${
                      hasError ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 ${
                      hasError ? "focus:ring-red-400" : "focus:ring-blue-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="addVoucher-generate-btn"
                    title="Tạo mã voucher tự động"
                  >
                    Tạo mã
                  </button>
                </div>
                {hasError && <span className="error-star">*</span>}
                {hasError && (
                  <span className="addVoucher-error text-red-500 text-sm mt-1">{errors[name].message}</span>
                )}
              </div>
            );
          }

          return (
            <div key={name} className="addVoucher-field flex flex-col relative">
              <label className="addVoucher-label text-gray-700 font-medium mb-1">{label}</label>
              <input
                type={type}
                step={step}
                placeholder={placeholder}
                {...register(name, { required: required ? `${label} là bắt buộc` : false })}
                className={`addVoucher-input p-3 rounded-md border w-full ${
                  hasError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 ${
                  hasError ? "focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />
              {hasError && <span className="error-star">*</span>}
              {hasError && (
                <span className="addVoucher-error text-red-500 text-sm mt-1">{errors[name].message}</span>
              )}
            </div>
          );
        })}

        <div className="addVoucher-field flex flex-col relative">
          <label className="addVoucher-label text-gray-700 font-medium mb-1">Ngày kết thúc</label>
          <input
            type="datetime-local"
            placeholder=""
            {...register("end_date", {
              required: "Ngày kết thúc là bắt buộc",
              validate: (value) => {
                if (!startDateValue) return true;
                return new Date(value) >= new Date(startDateValue) || "Ngày kết thúc phải sau ngày bắt đầu";
              },
            })}
            className={`addVoucher-input p-3 rounded-md border w-full ${
              errors.end_date ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 ${
              errors.end_date ? "focus:ring-red-400" : "focus:ring-blue-400"
            }`}
          />
          {errors.end_date && <span className="error-star">*</span>}
          {errors.end_date && (
            <span className="addVoucher-error text-red-500 text-sm mt-1">{errors.end_date.message}</span>
          )}
        </div>

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
