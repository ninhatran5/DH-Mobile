import { Link } from "react-router-dom";
import loginImage from "../assets/images/login.jpg";
import logo from "../assets/images/logo3.png";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState } from "react";

const Login = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
  return (
    <>
      <section className="bg-light p-3">
        <div className="container">
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
                                Chào mừng bạn đến DH Moblie, hãy đăng nhập nhé!
                              </h4>
                            </div>
                          </div>
                        </div>
                        <form noValidate>
                          <div className="row gy-3 overflow-hidden">
                            <div className="col-12">
                              <div className="form-floating mb-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  name="email"
                                  id="email"
                                  placeholder="name@example.com"
                                  required
                                />
                                <label htmlFor="email" className="form-label">
                                  Email
                                </label>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="form-floating mb-3">
                                <input
                                  type={`${
                                    isShowPassword ? "text" : "password"
                                  }`}
                                  className="form-control position-relative"
                                  name="password"
                                  id="password"
                                  placeholder="Password"
                                  required
                                />
                                <div
                                  style={{ fontSize: 20, cursor: "pointer", top: "8px", left: "90%" }}
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
                                  Mật khẩu
                                </label>
                              </div>
                            </div>
                            <div className="col-12 d-flex">
                              <div className="col-6">
                                <Link
                                  style={{ textDecoration: "none" }}
                                  to={"/register"}
                                >
                                  <h6>Bạn chưa có tài khoản?</h6>
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
                                  <h6>Quên mật khẩu</h6>
                                </Link>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="d-grid">
                                <button className="btn btn-dark btn-lg">
                                  Đăng nhập
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
    </>
  );
};
export default Login;
