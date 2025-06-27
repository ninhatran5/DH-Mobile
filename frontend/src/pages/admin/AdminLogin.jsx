import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminLogin } from "../../slices/adminLoginSlice";
import Loading from "../../components/Loading";
import "../../assets/admin/adminLogin.css";
import logo from "../../assets/images/logo3.png";
import { MdEmail } from "react-icons/md";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { LuLockKeyhole } from "react-icons/lu";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.adminLogin);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const login = async (data) => {
    try {
      const result = await dispatch(fetchAdminLogin(data)).unwrap();
      if (result && result.access_token) {
        localStorage.setItem("adminToken", result.access_token);
        localStorage.setItem(
          "adminID",
          result.user ? result.user.id : result.admin ? result.admin.id : null
        );
        toast.success(t("Đăng nhập thành công ") || "Admin login successful");
        navigate("/admin");
      } else {
        toast.error("Invalid login response");
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div className="dhm-admin-section">
        <div className="dhm-admin-card-3d-wrap">
          <div className="dhm-admin-card-3d-wrapper">
            <div className="dhm-admin-center-wrap">
              <img src={logo} alt="Logo" className="dhm-admin-logo" />
              <h4 className="dhm-admin-title">ĐĂNG NHẬP ADMIN</h4>
              <form onSubmit={handleSubmit(login)} style={{ width: "100%" }}>
                <div className="dhm-admin-form-group">
                  <input
                    type="email"
                    name="email"
                    className="dhm-admin-form-style"
                    placeholder="Nhập email"
                    autoComplete="off"
                    {...register("email", {
                      required: t("auth.validation.emailRequired"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("auth.validation.emailInvalid"),
                      },
                    })}
                  />
                  <span className="dhm-admin-input-icon">
                    <MdEmail />
                  </span>
                  {errors?.email && (
                    <div className="dhm-admin-error">
                      {errors.email.message}
                    </div>
                  )}
                </div>
                <div className="dhm-admin-form-group">
                  <input
                    type={isShowPassword ? "text" : "password"}
                    name="password"
                    className="dhm-admin-form-style"
                    placeholder="Nhập mật khẩu"
                    autoComplete="off"
                    {...register("password", {
                      required: t("auth.validation.passwordRequired"),
                      pattern: {
                        value:
                          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                        message: t("auth.validation.passwordInvalid"),
                      },
                    })}
                  />
                  <span className="dhm-admin-input-icon">
                    <LuLockKeyhole />
                  </span>
                  <span
                    className="dhm-admin-eye-toggle"
                    onClick={() => setIsShowPassword((v) => !v)}
                  >
                    {isShowPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                  </span>
                  {errors?.password && (
                    <div className="dhm-admin-error">
                      {errors.password.message}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="dhm-admin-btn"
                  disabled={loading}
                >
                  ĐĂNG NHẬP
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
