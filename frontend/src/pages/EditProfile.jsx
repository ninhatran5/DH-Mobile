import { Link } from "react-router-dom";
import "../assets/css/editprofile.css";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useState } from "react";

const EditProfile = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowPasswordNew, setIsShowPasswordNew] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const handleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
  const handleShowPasswordNew = () => {
    setIsShowPasswordNew(!isShowPasswordNew);
  };
  const handleShowConfirmPassword = () => {
    setIsShowConfirmPassword(!isShowConfirmPassword);
  };
  const [formData, setFormData] = useState({
    name: "Lê Nguyên Tùng",
    phone: "0396180619",
    email: "tung.ln@mor.com.vn",
    ward: "",
    district: "",
    city: "",
    introduce:
      "Xin chào! Tôi là X$ng Rất vui được đồng hành cùng bạn tại đây. Với tài khoản của mình, tôi có thể dễ dàng quản lý thông tin cá nhân, theo dõi các hoạt động gần đây và tận hưởng những tiện ích mà hệ thống mang lại. Hãy cùng khám phá và trải nghiệm những tính năng tuyệt vời dành riêng cho người dùng đã đăng nhập!",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const address = [
    {
      id: 1,
      title: "Phường/Xã ",
      options: "Chọn Phường/Xã",
      items: [
        { id: 1, name: "Phường Tràng Tiền", value: "phuong-trang-tien" },
        { id: 2, name: "Phường Khâm Thiên", value: "phuong-kham-thien" },
        { id: 3, name: "Phường Bạch Đằng", value: "phuong-bach-dang" },
        { id: 4, name: "Phường Nghĩa Đô", value: "phuong-nghia-do" },
        { id: 5, name: "Phường Tứ Liên", value: "phuong-tu-lien" },
        { id: 6, name: "Phường Ngọc Lâm", value: "phuong-ngoc-lam" },
        { id: 7, name: "Phường Mộ Lao", value: "phuong-mo-lao" },
      ],
    },
    {
      id: 2,
      title: "Quận/Huyện ",
      options: "Chọn Quận/Huyện",
      items: [
        { id: 1, name: "Quận Hoàn Kiếm", value: "quan-hoan-kiem" },
        { id: 2, name: "Quận Đống Đa", value: "quan-dong-da" },
        { id: 3, name: "Quận Hai Bà Trưng", value: "quan-hai-ba-trung" },
        { id: 4, name: "Quận Cầu Giấy", value: "quan-cau-giay" },
        { id: 5, name: "Quận Tây Hồ", value: "quan-tay-ho" },
        { id: 6, name: "Quận Long Biên", value: "quan-long-bien" },
        { id: 7, name: "Quận Hà Đông", value: "quan-ha-dong" },
      ],
    },
    {
      id: 3,
      title: "Tỉnh/Thành Phố ",
      options: "Tỉnh/Thành Phố",
      items: [
        { id: 1, name: "Hà Nội", value: "ha-noi" },
        { id: 2, name: "Hải Phòng", value: "hai-phong" },
        { id: 3, name: "Đà Nẵng", value: "da-nang" },
        { id: 4, name: "Hồ Chí Minh", value: "ho-chi-minh" },
      ],
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <section className="breadcrumb-option">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Chỉnh Sửa Hồ Sơ</h4>
                <div className="breadcrumb__links">
                  <Link style={{ textDecoration: "none" }} to={"/"}>
                    Trang chủ
                  </Link>
                  <Link style={{ textDecoration: "none" }} to={"/profile"}>
                    Hồ sơ cá nhân
                  </Link>
                  <span>Chỉnh sửa hồ sơ cá nhân</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <form className="file-upload mt-3" onSubmit={handleSubmit}>
              <div className="row mb-5 gx-5">
                <div className="col-xxl-8 mb-5 mb-xxl-0">
                  <div className="bg-secondary-soft-custom px-4 py-5 rounded-custom">
                    <div className="row g-3">
                      <h4 className="mb-4 mt-0">Thông tin tài khoản</h4>
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          Họ tên <span className="span-validate">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          placeholder=""
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          Số điện thoại <span className="span-validate">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          placeholder=""
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          Email <span className="span-validate">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      {address.map((item) => (
                        <div className="col-md-6" key={item.id}>
                          <label className="title-edit-profile form-label">
                            {item.title}
                            <span className="span-validate">*</span>
                          </label>
                          <select
                            name={item.title.trim()}
                            className="input_profile_edit-select form-select"
                            onChange={handleChange}
                          >
                            <option value="">{item.options}</option>
                            {item.items.map((add) => (
                              <option key={add.id} value={add.value}>
                                {add.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      <div className="col-md-12">
                        <label className="title-edit-profile form-label">
                          Giới thiệu
                        </label>
                        <textarea
                          type="introduce"
                          name="introduce"
                          rows="6"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          value={formData.introduce}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xxl-4">
                  <div className="bg-secondary-soft-custom px-4 py-5 rounded-custom">
                    <div className="row g-3">
                      <h4 className="mb-4 mt-0">Ảnh hồ sơ</h4>
                      <div className="text-center">
                        <div className="square-custom position-relative display-2 mb-3">
                          <img
                            src="https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg"
                            alt=""
                          />
                        </div>
                        <input type="file" id="customFile" name="file" hidden />
                        <label className="" htmlFor="customFile">
                          Tải lên
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-5">
                <div className="col-xxl-12">
                  <div className="bg-secondary-soft-custom px-4 py-5 rounded-custom">
                    <div className="row g-3">
                      <h4 className="my-4">Thay đổi mật khẩu</h4>

                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          Mật khẩu <span className="span-validate">*</span>
                        </label>
                        <div className="input-password-wrapper">
                          <input
                            spellCheck={false}
                            type={isShowPassword ? "text" : "password"}
                            name="oldPassword"
                            className="form-control"
                            id="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                          />
                          <span
                            className="toggle-password-icon"
                            onClick={handleShowPassword}
                          >
                            {isShowPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                          </span>
                        </div>
                      </div>

                      {/* Mật khẩu mới */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          Mật khẩu mới <span className="span-validate">*</span>
                        </label>
                        <div className="input-password-wrapper">
                          <input
                            spellCheck={false}
                            type={isShowPasswordNew ? "text" : "password"}
                            name="newPassword"
                            className="form-control"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                          />
                          <span
                            className="toggle-password-icon"
                            onClick={handleShowPasswordNew}
                          >
                            {isShowPasswordNew ? (
                              <FaEyeSlash />
                            ) : (
                              <IoEyeSharp />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Xác nhận mật khẩu */}
                      <div className="col-md-12">
                        <label className="title-edit-profile form-label">
                          Xác nhận mật khẩu
                          <span className="span-validate">*</span>
                        </label>
                        <div className="input-password-wrapper">
                          <input
                            spellCheck={false}
                            type={isShowConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            className="form-control"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                          <span
                            className="toggle-password-icon"
                            onClick={handleShowConfirmPassword}
                          >
                            {isShowConfirmPassword ? (
                              <FaEyeSlash />
                            ) : (
                              <IoEyeSharp />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gap-3 d-md-flex justify-content-md-end text-center">
                <button
                  className="btn btn-primary mb-5"
                  style={{ marginTop: -10 }}
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
