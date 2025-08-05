import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addAdminVoucher } from "../../slices/AdminVoucher";
import { toast, ToastContainer } from "react-toastify";
import "../../assets/admin/AddVoucher.css";
import { Link } from "react-router-dom";

const AddVoucherPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, vouchers } = useSelector((state) => state.adminVoucher);

  const existingVoucherCodes = vouchers?.map((v) => v.code) || [];
  const [randomCode, setRandomCode] = useState("");
  
  // State để lưu giá trị format cho display
  const [formattedValues, setFormattedValues] = useState({
    discount_amount: "",
    min_order_value: ""
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      is_active: true 
    }
  });

  // Watch cả start_date và end_date để validation
  const startDateValue = watch("start_date");
  const endDateValue = watch("end_date");

  useEffect(() => {
    if (randomCode) {
      setValue("code", randomCode, { shouldValidate: true });
    }
  }, [randomCode, setValue]);

  const formatNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleNumberInput = (e, fieldName) => {
    const inputValue = e.target.value.replace(/\./g, "");
    
    if (/^\d*$/.test(inputValue)) {
      const formattedValue = formatNumber(inputValue);
      
      setFormattedValues(prev => ({
        ...prev,
        [fieldName]: formattedValue
      }));
      
      setValue(fieldName, inputValue);
    }
  };

  const generateRandomCode = (length = 16) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

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

  // ✅ Hàm kiểm tra thứ tự ngày
  const validateDateOrder = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
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

      // ✅ Kiểm tra thứ tự ngày trước khi gửi
      if (!validateDateOrder(data.start_date, data.end_date)) {
        toast.error("Ngày bắt đầu không được sau ngày kết thúc!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      const formattedData = {
        code: data.code,
        title: data.title,
        discount_amount: data.discount_amount ? parseFloat(data.discount_amount) : 0,
        min_order_value: data.min_order_value ? parseInt(data.min_order_value) : 0,
        quantity: parseInt(data.quantity),
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active
      };

      const result = await dispatch(addAdminVoucher(formattedData)).unwrap();

      toast.success("🎉 Thêm voucher thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/admin/vouchers");
      }, 2200);
      
    } catch (err) {
      console.error("Lỗi khi thêm voucher:", err);
      console.error("Error details:", err.message, err.stack);
      
      toast.error(`Lỗi: ${err.message || err}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fields = [
    { name: "code", label: "Mã Voucher", type: "text", placeholder: "Nhập mã voucher", required: true },
    { name: "title", label: "Tiêu đề", type: "text", placeholder: "Nhập tiêu đề voucher", required: true },
    { name: "discount_amount", label: "Số tiền giảm", type: "text", placeholder: "Nhập số tiền giảm", isNumber: true },
    { name: "min_order_value", label: "Giá trị đơn tối thiểu", type: "text", placeholder: "Nhập giá trị đơn tối thiểu", isNumber: true },
    { name: "quantity", label: "Số lượng", type: "number", placeholder: "Nhập số lượng voucher", required: true },
    { name: "start_date", label: "Ngày bắt đầu", type: "datetime-local", placeholder: "", required: true },
  ];

  return (
    <div className="addVoucher-container max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl">
      <ToastContainer />
      <h2 className="addVoucher-title text-3xl font-bold text-center text-blue-600 mb-6">
        Thêm mã giảm giá mới
      </h2>
      <Link to="/admin/addvoucherpercent" className="adminvoucher-add-btn">
        + Thêm mã giảm giá phần trăm
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="addVoucher-form space-y-5">
        {fields.map(({ name, label, type, placeholder, required, isNumber }) => {
          const hasError = !!errors[name];

          if (name === "code") {
            return (
              <div key={name} className="addVoucher-field flex flex-col relative">
                <label className="addVoucher-label text-gray-700 font-medium mb-1">
                  {label} {required && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>}
                </label>
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
                {hasError && (
                  <span className="addVoucher-error text-red-500 text-sm mt-1">{errors[name].message}</span>
                )}
              </div>
            );
          }

          if (isNumber) {
            return (
              <div key={name} className="addVoucher-field flex flex-col relative">
                <label className="addVoucher-label text-gray-700 font-medium mb-1">
                  {label} {required && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={formattedValues[name] || ""}
                  onChange={(e) => handleNumberInput(e, name)}
                  className={`addVoucher-input p-3 rounded-md border w-full ${
                    hasError ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 ${
                    hasError ? "focus:ring-red-400" : "focus:ring-blue-400"
                  }`}
                />
                <input
                  type="hidden"
                  {...register(name)}
                />
                {hasError && (
                  <span className="addVoucher-error text-red-500 text-sm mt-1">{errors[name].message}</span>
                )}
              </div>
            );
          }

          return (
            <div key={name} className="addVoucher-field flex flex-col relative">
              <label className="addVoucher-label text-gray-700 font-medium mb-1">
                {label} {required && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>}
              </label>
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
              {hasError && (
                <span className="addVoucher-error text-red-500 text-sm mt-1">{errors[name].message}</span>
              )}
            </div>
          );
        })}

        <div className="addVoucher-field flex flex-col relative">
          <label className="addVoucher-label text-gray-700 font-medium mb-1">
            Ngày kết thúc <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>
          </label>
          <input
            type="datetime-local"
            placeholder=""
            {...register("end_date", {
              required: "Ngày kết thúc là bắt buộc",
              // ✅ Validation ngay tại trường input  
              validate: (value) => {
                if (startDateValue && value) {
                  return validateDateOrder(startDateValue, value) || "Ngày kết thúc phải sau ngày bắt đầu";
                }
                return true;
              }
            })}
            className={`addVoucher-input p-3 rounded-md border w-full ${
              errors.end_date ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 ${
              errors.end_date ? "focus:ring-red-400" : "focus:ring-blue-400"
            }`}
          />
          {errors.end_date && (
            <span className="addVoucher-error text-red-500 text-sm mt-1">{errors.end_date.message}</span>
          )}
        </div>

        {startDateValue && endDateValue && !validateDateOrder(startDateValue, endDateValue) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ Ngày bắt đầu ({new Date(startDateValue).toLocaleString('vi-VN')}) không được sau ngày kết thúc ({new Date(endDateValue).toLocaleString('vi-VN')})
            </p>
          </div>
        )}

        <div className="addVoucher-field flex flex-col relative">
          <label className="addVoucher-label text-gray-700 font-medium mb-1">
            Trạng thái
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="addVoucher-checkbox w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Hoạt động</span>
          </div>
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
