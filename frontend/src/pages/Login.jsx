import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/images/login.jpg";
import logo from "../assets/images/logo3.png";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogin } from "../slices/loginSlice";

const Login = () => {
  const dispatch = useDispatch();
  const { loginInitial, loading, error } = useSelector(
    (state) => state.register
  );
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const login = async (data) => {
    try {
      const result = await dispatch(fetchLogin(data)).unwrap();
      localStorage.setItem("token", result.access_token);
      toast.success(t("auth.loginNotificationSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <div style={{ background: "#f8f8f8", width: "100vw", height: "100vh" }}>
        <section className="p-3">
          <div className="container mt-3">
            <div className="row justify-content-center">
              <div className="col-12 col-xxl-11">
                <div className="card border-light-subtle shadow-sm">
                  <div className="row g-0">
                    <div className="col-12 col-md-6">
                      <img
                        className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                        loading="lazy"
                        src={loginImage}
                        alt={t("auth.altLoginImage")}
                      />
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                      <div className="col-12 col-lg-11 col-xl-10">
                        <div className="card-body p-3 p-md-4 p-xl-5">
                          <div className="row">
                            <div className="col-12">
                              <div className="mb-5">
                                <div className="text-center mb-4">
                                  <a href="#!">
                                    <img
                                      src={logo}
                                      alt={t("auth.logoAlt")}
                                      width={200}
                                      height={80}
                                    />
                                  </a>
                                </div>
                                <h4 className="text-center">
                                  {t("auth.titleLogin")}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <form onSubmit={handleSubmit(login)} noValidate>
                            <div className="row gy-3 overflow-hidden">
                              <div className="col-12">
                                <div className="form-floating mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    spellCheck={false}
                                    id="email"
                                    placeholder="name@example.com"
                                    {...register("email", {
                                      required: t(
                                        "auth.validation.emailRequired"
                                      ),
                                      pattern: {
                                        value:
                                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: t(
                                          "auth.validation.emailInvalid"
                                        ),
                                      },
                                    })}
                                  />
                                  {errors?.email && (
                                    <small
                                      className="mt-2"
                                      style={{ color: "red" }}
                                    >
                                      {errors.email.message}
                                    </small>
                                  )}
                                  <label htmlFor="email" className="form-label">
                                    Email
                                  </label>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-floating mb-3 position-relative">
                                  <input
                                    type={isShowPassword ? "text" : "password"}
                                    className="form-control"
                                    name="password"
                                    id="password"
                                    spellCheck={false}
                                    placeholder={t("auth.password")}
                                    {...register("password", {
                                      required: t(
                                        "auth.validation.passwordRequired"
                                      ),
                                      pattern: {
                                        value:
                                          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                                        message: t(
                                          "auth.validation.passwordInvalid"
                                        ),
                                      },
                                    })}
                                  />
                                  {errors?.password && (
                                    <small
                                      className="mt-2"
                                      style={{ color: "red" }}
                                    >
                                      {errors.password.message}
                                    </small>
                                  )}
                                  <div
                                    style={{
                                      fontSize: 20,
                                      cursor: "pointer",
                                      top: "8px",
                                      right: "10px",
                                      position: "absolute",
                                    }}
                                    onClick={handleShowPassword}
                                  >
                                    {isShowPassword ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <IoEyeSharp />
                                    )}
                                  </div>
                                  <label
                                    htmlFor="password"
                                    className="form-label"
                                  >
                                    {t("auth.password")}
                                  </label>
                                </div>
                              </div>
                              <div className="col-12 d-flex">
                                <div className="col-6">
                                  <Link
                                    style={{ textDecoration: "none" }}
                                    to={"/register"}
                                  >
                                    <h6>{t("auth.register")}</h6>
                                  </Link>
                                </div>
                                <div
                                  style={{ textAlign: "end" }}
                                  className="col-6"
                                >
                                  <Link
                                    style={{ textDecoration: "none" }}
                                    to={"/forgot-password"}
                                  >
                                    <h6>{t("auth.forgot_password")}</h6>
                                  </Link>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="d-grid">
                                  <button className="btn btn-dark btn-lg">
                                    {t("auth.login_button")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default Login;
