import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/images/login.jpg";
import logo from "../assets/images/logo3.png";
import { FaEyeSlash, FaCheckCircle, FaCheck } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowPasswordNew, setIsShowPasswordNew] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
  const handleShowPasswordNew = () => {
    setIsShowPasswordNew(!isShowPasswordNew);
  };
  const handleShowConfirmPassword = () => {
    setIsShowConfirmPassword(!isShowConfirmPassword);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");
  const newPasswordValue = watch("newpassword");
  const confirmPasswordValue = watch("confirmpassword");

  const onSubmit = () => {
    toast.success(t("auth.changePasswordNotificationSuccess"));
    navigate("/login");
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
                              {/* Mật khẩu cũ */}
                              <div className="col-12">
                                <div className="form-floating mb-3 position-relative">
                                  <input
                                    type={`${
                                      isShowPassword ? "text" : "password"
                                    }`}
                                    className="form-control position-relative"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    spellCheck={false}
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
                                      {errors?.password?.message}
                                    </small>
                                  )}
                                  <div
                                    style={{
                                      fontSize: 20,
                                      cursor: "pointer",
                                      top: "8px",
                                      left: "90%",
                                    }}
                                    onClick={handleShowPassword}
                                    className="position-absolute"
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

                              {/* Mật khẩu mới */}
                              <div className="col-12">
                                <div className="form-floating mb-3 position-relative">
                                  <input
                                    type={`${
                                      isShowPasswordNew ? "text" : "password"
                                    }`}
                                    className="form-control position-relative"
                                    name="newpassword"
                                    id="newpassword"
                                    spellCheck={false}
                                    placeholder="Password"
                                    {...register("newpassword", {
                                      required: t(
                                        "auth.validation.newPasswordRequired"
                                      ),
                                      pattern: {
                                        value:
                                          /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
                                        message: t(
                                          "auth.validation.newPasswordInvalid"
                                        ),
                                      },
                                      validate: (value) =>
                                        value !== passwordValue ||
                                        t(
                                          "auth.validation.newPasswordCannotMatchOld"
                                        ),
                                    })}
                                  />
                                  {errors?.newpassword && (
                                    <small
                                      className="mt-2"
                                      style={{ color: "red" }}
                                    >
                                      {errors?.newpassword?.message}
                                    </small>
                                  )}
                                  <div
                                    style={{
                                      fontSize: 20,
                                      cursor: "pointer",
                                      top: "8px",
                                      left: "90%",
                                    }}
                                    onClick={handleShowPasswordNew}
                                    className="position-absolute"
                                  >
                                    {isShowPasswordNew ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <IoEyeSharp />
                                    )}
                                  </div>
                                  <label
                                    htmlFor="newpassword"
                                    className="form-label"
                                  >
                                    {t("auth.newPassword")}
                                  </label>
                                </div>
                              </div>

                              {/* Xác nhận mật khẩu */}
                              <div className="col-12">
                                <div className="form-floating mb-3 position-relative">
                                  <input
                                    type={`${
                                      isShowConfirmPassword
                                        ? "text"
                                        : "password"
                                    }`}
                                    className="form-control position-relative"
                                    name="confirmpassword"
                                    id="confirmpassword"
                                    placeholder="Password"
                                    spellCheck={false}
                                    {...register("confirmpassword", {
                                      required: t(
                                        "auth.validation.confirmPasswordRequired"
                                      ),
                                      validate: (value) =>
                                        value === newPasswordValue ||
                                        t(
                                          "auth.validation.confirmPasswordInvalid"
                                        ),
                                    })}
                                  />
                                  {errors?.confirmpassword ? (
                                    <small
                                      className="mt-2"
                                      style={{ color: "red" }}
                                    >
                                      {errors?.confirmpassword?.message}
                                    </small>
                                  ) : (
                                    confirmPasswordValue &&
                                    confirmPasswordValue ===
                                      newPasswordValue && (
                                      <FaCheck
                                        style={{
                                          color: "green",
                                          position: "absolute",
                                          right: "5%",
                                          top: "50%",
                                          transform: "translateY(-50%)",
                                          fontSize: "17px",
                                        }}
                                      />
                                    )
                                  )}
                                  {!(
                                    confirmPasswordValue &&
                                    confirmPasswordValue === newPasswordValue
                                  ) && (
                                    <div
                                      style={{
                                        fontSize: 20,
                                        cursor: "pointer",
                                        top: "8px",
                                        left: "90%",
                                      }}
                                      onClick={handleShowConfirmPassword}
                                      className="position-absolute"
                                    >
                                      {isShowConfirmPassword ? (
                                        <FaEyeSlash />
                                      ) : (
                                        <IoEyeSharp />
                                      )}
                                    </div>
                                  )}
                                  <label
                                    htmlFor="confirmpassword"
                                    className="form-label"
                                  >
                                    {t("auth.confirmPassword")}
                                  </label>
                                </div>
                              </div>

                              <div className="col-12 d-flex">
                                <div className="col-12">
                                  <Link
                                    style={{ textDecoration: "none" }}
                                    to={"/login"}
                                  >
                                    <h6>{t("auth.login")}</h6>
                                  </Link>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="d-grid">
                                  <button className="btn btn-dark btn-lg">
                                    {t("auth.send")}
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

export default ChangePassword;
