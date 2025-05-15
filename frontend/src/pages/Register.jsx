import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/images/login.jpg";
import logo from "../assets/images/logo3.png";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Register = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    toast.success(t("auth.registerNotificationSuccess"));
    navigate("/login");
  };

  return (
    <>
      <div style={{ background: "#f8f8f8", width: "100vw", height: "100vh" }}>
        <section className="p-4">
          <div className="container mt-2">
            <div className="row justify-content-center">
              <div className="col-12 col-xxl-11">
                <div className="card border-light-subtle shadow-sm">
                  <div className="row g-0">
                    <div className="col-12 col-md-6">
                      <img
                        className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                        loading="lazy"
                        src={loginImage}
                        alt="Welcome back you've been missed!"
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
                                      alt="BootstrapBrain Logo"
                                      width={200}
                                      height={80}
                                    />
                                  </a>
                                </div>
                                <h4 className="text-center">
                                  {t("auth.titleRegister")}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <div className="row gy-3 overflow-hidden">
                              <div className="col-12">
                                <div className="form-floating mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="username"
                                    id="username"
                                    spellCheck={false}
                                    placeholder="Username"
                                    {...register("username", {
                                      required: t("auth.validation.usernameRequired"),
                                      minLength: {
                                        value: 3,
                                        message: t("auth.validation.usernameMinLength"),
                                      },
                                    })}
                                  />
                                  {errors?.username && (
                                    <small className="mt-2" style={{ color: "red" }}>
                                      {errors.username.message}
                                    </small>
                                  )}
                                  <label htmlFor="username" className="form-label">
                                    {t("auth.username")}
                                  </label>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-floating mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    id="email"
                                    spellCheck={false}
                                    placeholder="name@example.com"
                                    {...register("email", {
                                      required: t("auth.validation.emailRequired"),
                                      pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: t("auth.validation.emailInvalid"),
                                      },
                                    })}
                                  />
                                  {errors?.email && (
                                    <small className="mt-2" style={{ color: "red" }}>
                                      {errors.email.message}
                                    </small>
                                  )}
                                  {/* Giữ nguyên label Email tiếng Anh */}
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
                                    placeholder="Password"
                                    {...register("password", {
                                      required: t("auth.validation.passwordRequired"),
                                      pattern: {
                                        value:
                                          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                                        message: t("auth.validation.passwordInvalid"),
                                      },
                                    })}
                                  />
                                  {errors?.password && (
                                    <small className="mt-2" style={{ color: "red" }}>
                                      {errors.password.message}
                                    </small>
                                  )}
                                  <div
                                    style={{
                                      fontSize: 20,
                                      cursor: "pointer",
                                      top: "8px",
                                      left: "90%",
                                      position: "absolute",
                                    }}
                                    onClick={handleShowPassword}
                                  >
                                    {isShowPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                                  </div>
                                  <label htmlFor="password" className="form-label">
                                    {t("auth.password")}
                                  </label>
                                </div>
                              </div>
                              <div className="col-12 d-flex">
                                <div className="col-6">
                                  <Link style={{ textDecoration: "none" }} to={"/login"}>
                                    <h6>{t("auth.login")}</h6>
                                  </Link>
                                </div>
                                <div style={{ textAlign: "end" }} className="col-6">
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
                                    {t("auth.register_button")}
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

export default Register;
