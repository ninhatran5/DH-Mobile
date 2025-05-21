import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminLogin } from "../../slices/adminLoginSlice";
import Loading from "../../components/Loading";
import logo from "../../assets/images/logo3.png";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

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
        localStorage.setItem("adminID", result.user ? result.user.id : (result.admin ? result.admin.id : null));
        toast.success(t("auth.adminLoginSuccess") || "Admin login successful");
        navigate("/admin")
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
      <div className="d-flex vh-100" style={{ backgroundColor: "#f5f5f5" }}>
        <div className="container m-auto">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
                <div className="bg-primary text-white py-4 text-center">
                  <img src={logo} alt="Logo" style={{ height: "60px" }} className="mb-2" />
                  <h3 className="text-white">{t("auth.titleAdminLogin") || "Admin Dashboard"}</h3>
                </div>
                <div className="card-body p-4 p-sm-5">
                  <div className="text-center mb-4">
                    <h4>{t("auth.welcomeAdmin") || "Welcome Back!"}</h4>
                    <p className="text-muted">{t("auth.signInPrompt") || "Sign in to access the admin panel"}</p>
                  </div>

                  <form onSubmit={handleSubmit(login)} noValidate>
                    <div className="mb-4">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FaEnvelope className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className={`form-control form-control-lg border-0 ${errors.email ? "is-invalid" : ""}`}
                          placeholder={t("auth.emailAddress") || "Email address"}
                          {...register("email", {
                            required: t("auth.validation.emailRequired") || "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: t("auth.validation.emailInvalid") || "Email is invalid",
                            },
                          })}
                        />
                      </div>
                      {errors?.email && (
                        <div className="invalid-feedback d-block mt-1 ps-1">
                          {errors.email.message}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">
                          <FaLock className="text-muted" />
                        </span>
                        <input
                          type={isShowPassword ? "text" : "password"}
                          className={`form-control form-control-lg border-0 ${errors.password ? "is-invalid" : ""}`}
                          placeholder={t("auth.password") || "Password"}
                          {...register("password", {
                            required: t("auth.validation.passwordRequired") || "Password is required"
                          })}
                        />
                        <button
                          className="btn btn-light border-0"
                          type="button"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        >
                          {isShowPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors?.password && (
                        <div className="invalid-feedback d-block mt-1 ps-1">
                          {errors.password.message}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          {t("auth.rememberMe") || "Remember me"}
                        </label>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      {t("auth.adminLoginButton") || "Sign in"}
                    </button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0 small">
                      {t("auth.protectedArea") || "This is a protected area. Authorized personnel only."}
                    </p>
                  </div>
                </div>
                <div className="card-footer bg-light py-3 text-center">
                  <p className="text-muted mb-0">
                    &copy; {new Date().getFullYear()} {t("auth.companyName") || "DH Mobile"} - {t("auth.allRightsReserved") || "All rights reserved"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
