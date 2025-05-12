import { Link } from "react-router-dom";
import loginImage from "../assets/images/login.jpg";
import logo from "../assets/images/logo3.png";
import { useForm } from "react-hook-form";
const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    console.log("onSubmit");
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
                                Chào mừng bạn đến DH Moblie, hãy đăng ký nhé!
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
                                  name="email"
                                  id="email"
                                  spellCheck={false}
                                  placeholder="name@example.com"
                                  {...register("email", {
                                    required: "Không được bỏ trống Email",
                                    pattern: {
                                      value:
                                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                      message: "Địa chỉ email không hợp lệ",
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
                            <div className="col-12 d-flex">
                              <div className="col-12">
                                <Link
                                  style={{ textDecoration: "none" }}
                                  to={"/login"}
                                >
                                  <h6>Bạn đã có tài khoản?</h6>
                                </Link>
                              </div>
                            </div>
                            <div className="col-12">
                              <div className="d-grid">
                                <button className="btn btn-dark btn-lg">
                                  Gửi
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
export default ForgotPassword;
