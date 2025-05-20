import { Link, useParams } from "react-router-dom";
import "../assets/css/editprofile.css";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { fetchEditProfile, fetchProfile } from "../slices/updateProfileSlice";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

const EditProfile = () => {
  // const [isShowPassword, setIsShowPassword] = useState(false);
  // const [isShowPasswordNew, setIsShowPasswordNew] = useState(false);
  // const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.editProfile);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // const handleShowPassword = () => {
  //   setIsShowPassword(!isShowPassword);
  // };
  // const handleShowPasswordNew = () => {
  //   setIsShowPasswordNew(!isShowPasswordNew);
  // };
  // const handleShowConfirmPassword = () => {
  //   setIsShowConfirmPassword(!isShowConfirmPassword);
  // };
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    email: "",
    ward: "",
    district: "",
    city: "",
    address: "",
    image: null,
  });

  useEffect(() => {
    if (profile?.user) {
      setProfileData({
        full_name: profile.user.full_name || "",
        phone: profile.user.phone || "",
        email: profile.user.email || "",
        ward: "",
        district: "",
        city: "",
        address: profile.user.address || "",
      });
    }
  }, [profile]);

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
    console.log("🚀 ~ handleChange ~ e:", e);
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("full_name", profileData.full_name);
    data.append("phone", profileData.phone);
    data.append("address", profileData.address);
    data.append("image_url", profileData.image);
    dispatch(fetchEditProfile(data));

    try {
      const result = await dispatch(fetchEditProfile(data)).unwrap();
      console.log("🚀 ~ handleSubmit ~ result:", result);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error(error);
    }
  };

  const onChangeAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file)); // tạo URL tạm
      setProfileData({
        ...profileData,
        image: file,
      });
    }
  };

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={"Chỉnh Sửa Hồ Sơ Cá Nhân"}
        mainItem={"Trang chủ"}
        mainItem2={"Hồ sơ cá nhân"}
        secondaryItem={"Chỉnh sửa hồ sơ"}
        linkMainItem={"/"}
        linkMainItem2={"/profile"}
        showMainItem2={true}
      />
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
                          name="full_name"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          placeholder=""
                          value={profileData.full_name}
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
                          value={profileData.phone}
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
                          value={profileData.email}
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
                          Địa chỉ cụ thể
                          <span className="ms-1 span-validate">*</span>
                        </label>
                        <textarea
                          type="address"
                          name="address"
                          rows="6"
                          spellCheck={false}
                          className="input_profile_edit form-control"
                          value={profileData.address}
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
                            src={
                              previewImage ||
                              profile?.user?.image_url ||
                              "https://bootdey.com/img/Content/avatar/avatar1.png"
                            }
                            alt="avatar"
                          />
                        </div>
                        <input
                          type="file"
                          id="customFile"
                          name="file"
                          hidden
                          onChange={onChangeAvatar}
                        />
                        <label className="" htmlFor="customFile">
                          Tải lên
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="row mb-5">
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
                            value={profileData.oldPassword}
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
                            value={profileData.newPassword}
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
                            value={profileData.confirmPassword}
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
              </div> */}
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
