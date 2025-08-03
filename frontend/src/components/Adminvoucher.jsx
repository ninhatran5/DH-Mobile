import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addVoucherPercent } from "../slices/AdminVoucher";
import { toast, ToastContainer } from "react-toastify";
import "../assets/admin/AddVoucher.css";
import { Link } from "react-router-dom";

const AddVoucherPercentPage = () => {
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
    getValues,
  } = useForm();

  const startDateValue = watch("start_date");
  const endDateValue = watch("end_date");

  useEffect(() => {
    if (randomCode) {
      setValue("code", randomCode, { shouldValidate: true });
    }
  }, [randomCode, setValue]);

  // Hàm format số tiền
  const formatCurrency = (value) => {
    if (!value) return "";
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.toString().replace(/\D/g, "");
    // Thêm dấu chấm phân cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Hàm chuyển đổi từ format hiển thị về số
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\./g, ""), 10) || 0;
  };

  // Hàm xử lý thay đổi input số tiền
  const handleCurrencyChange = (fieldName, event) => {
    const inputValue = event.target.value;
    const formattedValue = formatCurrency(inputValue);
    setValue(fieldName, formattedValue, { shouldValidate: true });
  };

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
      // Kiểm tra mã voucher trùng
      if (existingVoucherCodes.includes(data.code)) {
        toast.error("Mã voucher đã tồn tại, vui lòng tạo mã khác hoặc nhập mã khác!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      // Validate phần trăm giảm (phải từ 1-100)
      const discountPercent = parseFloat(data.discount_amount);
      if (discountPercent < 1 || discountPercent > 100) {
        toast.error("Phần trăm giảm phải từ 1% đến 100%!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      // Chuyển đổi giá trị đã format về số
      const maxDiscount = parseCurrency(data.max_discount);
      if (!maxDiscount || maxDiscount <= 0) {
        toast.error("Giá trị giảm tối đa phải lớn hơn 0!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      const minOrderValue = parseCurrency(data.min_order_value);
      if (minOrderValue < 0) {
        toast.error("Giá trị đơn tối thiểu không được âm!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      const quantity = parseInt(data.quantity);
      if (quantity <= 0) {
        toast.error("Số lượng voucher phải lớn hơn 0!", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      const formattedData = {
        code: data.code.trim(),
        title: data.title.trim(),
        discount_amount: discountPercent,
        max_discount: maxDiscount,
        min_order_value: minOrderValue,
        quantity: quantity,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active ? 1 : 0,
        discount_type: "percent",
      };

      await dispatch(addVoucherPercent(formattedData)).unwrap();

      toast.success("Thêm voucher phần trăm thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/admin/vouchers");
      }, 2200);
    } catch (err) {
      console.error("Error adding voucher percent:", err);
      toast.error("Lỗi: " + (err?.message || err), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const fields = [
    { 
      name: "code", 
      label: "Mã Voucher", 
      type: "text", 
      placeholder: "Nhập mã voucher", 
      required: true 
    },
    { 
      name: "title", 
      label: "Tiêu đề", 
      type: "text", 
      placeholder: "VD: Giảm 20% tối đa 50K", 
      required: true 
    },
    { 
      name: "discount_amount", 
      label: "Phần trăm giảm (%)", 
      type: "number", 
      step: "1", 
      placeholder: "Nhập từ 1 đến 100", 
      required: true,
      max: 100,
      min: 1
    },
    { 
      name: "max_discount", 
      label: "Giảm tối đa (VNĐ)", 
      type: "text",
      placeholder: "VD: 50.000", 
      required: true,
      isCurrency: true
    },
    { 
      name: "min_order_value", 
      label: "Giá trị đơn tối thiểu (VNĐ)", 
      type: "text",
      placeholder: "VD: 100.000", 
      required: true,
      isCurrency: true
    },
    { 
      name: "quantity", 
      label: "Số lượng voucher", 
      type: "number", 
      placeholder: "VD: 100", 
      required: true,
      min: 1
    },
    { 
      name: "start_date", 
      label: "Ngày bắt đầu", 
      type: "datetime-local", 
      placeholder: "", 
      required: true 
    },
  ];

  return (
    <div className="addVoucher-container max-w-2xl mx-auto p-8 mt-10 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl">
      <ToastContainer />
      <h2 className="addVoucher-title text-3xl font-bold text-center text-green-600 mb-6">
        Thêm Voucher Giảm Theo Phần Trăm
      </h2>
    <Link
    to="/admin/addvoucher"
    className="adminvoucher-add-btn px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
  >
    + Thêm mã giảm giá khác
  </Link>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Lưu ý:</strong> Voucher phần trăm giảm theo % với giới hạn tối đa. 
              VD: Giảm 20% tối đa 50K cho đơn từ 100K.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="addVoucher-form space-y-5">
        {fields.map(({ name, label, type, step, placeholder, required, max, min, isCurrency }) => {
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
                    {...register(name, { 
                      required: required ? `${label} là bắt buộc` : false,
                      minLength: {
                        value: 3,
                        message: "Mã voucher phải có ít nhất 3 ký tự"
                      },
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: "Mã voucher chỉ được chứa chữ hoa và số"
                      }
                    })}
                    className={`addVoucher-input p-3 rounded-md border w-full ${
                      hasError ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 ${
                      hasError ? "focus:ring-red-400" : "focus:ring-green-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="addVoucher-generate-btn bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition whitespace-nowrap"
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

          // Validation options cho từng trường
          const registerOptions = {
            required: required ? `${label} là bắt buộc` : false,
          };

          // Validation đặc biệt cho discount_amount (phần trăm)
          if (name === "discount_amount") {
            registerOptions.min = {
              value: 1,
              message: "Phần trăm giảm phải từ 1% trở lên"
            };
            registerOptions.max = {
              value: 100,
              message: "Phần trăm giảm không thể vượt quá 100%"
            };
            registerOptions.valueAsNumber = true;
          }

          // Validation cho các trường tiền tệ
          if (isCurrency) {
            registerOptions.validate = (value) => {
              const numericValue = parseCurrency(value);
              if (name === "max_discount") {
                return numericValue >= 1000 || "Giá trị giảm tối đa phải từ 1.000 VNĐ trở lên";
              }
              if (name === "min_order_value") {
                return numericValue >= 0 || "Giá trị đơn tối thiểu không được âm";
              }
              return true;
            };
          }

          // Validation cho quantity
          if (name === "quantity") {
            registerOptions.min = {
              value: 1,
              message: "Số lượng voucher phải từ 1 trở lên"
            };
            registerOptions.valueAsNumber = true;
          }

          // Validation cho start_date
          if (name === "start_date") {
            registerOptions.validate = (value) => {
              const currentValues = getValues();
              if (currentValues.end_date && new Date(value) > new Date(currentValues.end_date)) {
                return "Ngày bắt đầu không được sau ngày kết thúc";
              }
              return true;
            };
          }

          return (
            <div key={name} className="addVoucher-field flex flex-col relative">
              <label className="addVoucher-label text-gray-700 font-medium mb-1">
                {label} {required && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>}
              </label>
              <input
                type={type}
                step={step}
                placeholder={placeholder}
                max={max}
                min={min}
                {...register(name, registerOptions)}
                onChange={isCurrency ? (e) => handleCurrencyChange(name, e) : undefined}
                className={`addVoucher-input p-3 rounded-md border w-full ${
                  hasError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 ${
                  hasError ? "focus:ring-red-400" : "focus:ring-green-400"
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
              validate: (value) => {
                if (!startDateValue) return true;
                return new Date(value) >= new Date(startDateValue) || "Ngày kết thúc phải sau ngày bắt đầu";
              },
            })}
            className={`addVoucher-input p-3 rounded-md border w-full ${
              errors.end_date ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 ${
              errors.end_date ? "focus:ring-red-400" : "focus:ring-green-400"
            }`}
          />
          {errors.end_date && (
            <span className="addVoucher-error text-red-500 text-sm mt-1">{errors.end_date.message}</span>
          )}
        </div>

        <div className="addVoucher-field flex flex-col relative">
          <label className="addVoucher-label text-gray-700 font-medium mb-1">
            Trạng thái <span style={{ color: '#ef4444', fontWeight: 'bold' }}>*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="addVoucher-checkbox w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-gray-700">Hoạt động</span>
          </div>
        </div>

        <div className="addVoucher-button-wrapper text-center">
          <button
            type="submit"
            disabled={loading}
            className="addVoucher-button px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Thêm Voucher Phần Trăm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVoucherPercentPage;
