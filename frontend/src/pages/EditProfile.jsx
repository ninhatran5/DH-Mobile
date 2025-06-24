import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/editprofile.css";
import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { fetchEditProfile, fetchProfile } from "../slices/updateProfileSlice";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import { fetchAddress } from "../slices/addressSlice";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const EditProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { profile, loading } = useSelector((state) => state.editProfile);
  const { data } = useSelector((state) => state.address);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset, // thêm reset
  } = useForm({
    mode: "onTouched",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [profileData, setProfileData] = useState({
    image: null,
  });

  // Watch các giá trị select để lọc động
  const watchCity = watch("city");
  const watchDistrict = watch("district");

  // Lọc districts theo city được chọn
  const filteredDistricts =
    data.find((province) => province.name === watchCity)?.districts || [];

  // Lọc wards theo district được chọn
  const filteredWards =
    filteredDistricts.find((district) => district.name === watchDistrict)
      ?.wards || [];

  useEffect(() => {
    // Chỉ reset khi profile và data đã có, và data có đủ tỉnh/thành
    if (
      profile?.user &&
      data.length > 0 &&
      profile.user.city &&
      profile.user.district &&
      profile.user.ward
    ) {
      // Kiểm tra xem city, district, ward có trong data không
      const province = data.find((p) => p.name === profile.user.city);
      const district = province?.districts?.find(
        (d) => d.name === profile.user.district
      );
      const ward = district?.wards?.find((w) => w.name === profile.user.ward);

      if (province && district && ward) {
        reset({
          full_name: profile.user.full_name || "",
          phone: profile.user.phone || "",
          email: profile.user.email || "",
          city: profile.user.city || "",
          district: profile.user.district || "",
          ward: profile.user.ward || "",
          address: profile.user.address || "",
        });
      }
    }
  }, [profile, data, reset]);

  useEffect(() => {
    dispatch(fetchAddress());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const onSubmit = async (dataForm) => {
    const dataToSend = new FormData();
    dataToSend.append("full_name", dataForm.full_name);
    dataToSend.append("phone", dataForm.phone);
    dataToSend.append("email", dataForm.email);
    dataToSend.append("ward", dataForm.ward);
    dataToSend.append("district", dataForm.district);
    dataToSend.append("city", dataForm.city);
    dataToSend.append("address", dataForm.address);
    if (profileData.image) {
      dataToSend.append("image_url", profileData.image);
    }
    dataToSend.append("_method", "PUT");

    try {
      // eslint-disable-next-line no-unused-vars
      const result = await dispatch(fetchEditProfile(dataToSend)).unwrap();
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error(error);
    }
  };

  const onChangeAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setProfileData({
        ...profileData,
        image: file,
      });
    }
  };

  const handleNextForgotPasssword = () => {
    navigate("/forgot-password");
  };
  const handleReturnProfile = (id) => {
    navigate(`/profile/${id}`);
  };

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("editProfile.brumTitle")}
        mainItem={t("profile.home")}
        mainItem2={t("profile.title")}
        secondaryItem={t("editProfile.brumTitle")}
        linkMainItem={"/"}
        linkMainItem2={`/profile/${id}`}
        showMainItem2={true}
      />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex">
              <button
                className="btn-custom-profile"
                onClick={() => handleReturnProfile(profile?.user?.id)}
              >
                {t("profile.returnProfile")}
              </button>
              <button
                className="btn-custom-profile"
                onClick={handleNextForgotPasssword}
              >
                {t("profile.forgotPassword")}
              </button>
            </div>
            <form
              className="file-upload mt-3"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="row mb-5 gx-5">
                <div className="col-xxl-8 mb-5 mb-xxl-0">
                  <div className="bg-secondary-soft-custom px-4 py-5 rounded-custom">
                    <div className="row g-3">
                      <h4 className="mb-4 mt-0">
                        {t("editProfile.accountInfo")}
                      </h4>

                      {/* Họ tên */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("profile.personalInformations.name")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          spellCheck={false}
                          className={`input_profile_edit form-control ${
                            errors.full_name ? "is-invalid" : ""
                          }`}
                          {...register("full_name", {
                            required: t("editProfile.validate.nameRequired"),
                          })}
                        />
                        {errors.full_name && (
                          <div className="invalid-feedback">
                            {errors.full_name.message}
                          </div>
                        )}
                      </div>

                      {/* Số điện thoại */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("profile.personalInformations.phone")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          name="phone"
                          spellCheck={false}
                          className={`input_profile_edit form-control ${
                            errors.phone ? "is-invalid" : ""
                          }`}
                          {...register("phone", {
                            required: t("editProfile.validate.phoneRequired"),
                            validate: {
                              startsWithZero: (value) =>
                                value.startsWith("0") ||
                                t("checkout.phoneMustStartWithZero"),
                              lengthCheck: (value) =>
                                value.length === 10 ||
                                value.length === 11 ||
                                t("checkout.phoneLengthInvalid"),
                              isNumber: (value) =>
                                /^[0-9]+$/.test(value) ||
                                t("checkout.phoneMustBeNumber"),
                            },
                          })}
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">
                            {errors.phone.message}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("profile.personalInformations.email")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          spellCheck={false}
                          className={`input_profile_edit form-control ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          {...register("email", {
                            required: t("editProfile.validate.emailRequired"),
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: t("editProfile.validate.emailPattern"),
                            },
                          })}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">
                            {errors.email.message}
                          </div>
                        )}
                      </div>

                      {/* Tỉnh/Thành Phố */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("editProfile.city")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <select
                          name="city"
                          className={`input_profile_edit-select form-select ${
                            errors.city ? "is-invalid" : ""
                          }`}
                          {...register("city", {
                            required: t("editProfile.validate.cityRequired"),
                          })}
                        >
                          <option value="">
                            {t("editProfile.selectCity")}
                          </option>
                          {data.map((province) => (
                            <option key={province.code} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                        {errors.city && (
                          <div className="invalid-feedback">
                            {errors.city.message}
                          </div>
                        )}
                      </div>

                      {/* Quận/Huyện */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("editProfile.district")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <select
                          name="district"
                          className={`input_profile_edit-select form-select ${
                            errors.district ? "is-invalid" : ""
                          }`}
                          {...register("district", {
                            required: t(
                              "editProfile.validate.districtRequired"
                            ),
                          })}
                          disabled={!watchCity && !profile?.user?.city}
                        >
                          <option value="">
                            {t("editProfile.selectDistrict")}
                          </option>
                          {filteredDistricts.map((district) => (
                            <option key={district.code} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                        {errors.district && (
                          <div className="invalid-feedback">
                            {errors.district.message}
                          </div>
                        )}
                      </div>

                      {/* Phường/Xã */}
                      <div className="col-md-6">
                        <label className="title-edit-profile form-label">
                          {t("editProfile.wards")}
                          <span className="span-validate ms-1">*</span>
                        </label>
                        <select
                          name="ward"
                          className={`input_profile_edit-select form-select ${
                            errors.ward ? "is-invalid" : ""
                          }`}
                          {...register("ward", {
                            required: t("editProfile.validate.wardRequired"),
                          })}
                          disabled={!watchDistrict && !profile?.user?.district}
                        >
                          <option value="">
                            {t("editProfile.selectWard")}
                          </option>
                          {filteredWards.map((ward) => (
                            <option key={ward.code} value={ward.name}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                        {errors.ward && (
                          <div className="invalid-feedback">
                            {errors.ward.message}
                          </div>
                        )}
                      </div>

                      {/* Địa chỉ cụ thể */}
                      <div className="col-md-12">
                        <label className="title-edit-profile form-label">
                          {t("editProfile.fullAddress")}
                          <span className="ms-1 span-validate ms-1">*</span>
                        </label>
                        <textarea
                          type="address"
                          name="address"
                          rows="4"
                          spellCheck={false}
                          className={`input_profile_edit form-control ${
                            errors.address ? "is-invalid" : ""
                          }`}
                          {...register("address", {
                            required: t("editProfile.validate.addressRequired"),
                          })}
                        />
                        {errors.address && (
                          <div className="invalid-feedback">
                            {errors.address.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ảnh hồ sơ */}
                <div className="col-xxl-4">
                  <div className="bg-secondary-soft-custom px-4 py-5 rounded-custom">
                    <div className="row g-3">
                      <h4 className="mb-4 mt-0">{t("editProfile.image")}</h4>
                      <div className="text-center">
                        <div className="square-custom position-relative display-2 mb-3">
                          <img
                            src={previewImage || profile?.user?.image_url}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://bootdey.com/img/Content/avatar/avatar1.png";
                            }}
                            alt="avatar"
                          />
                        </div>
                        <input
                          type="file"
                          id="customFile"
                          name="file"
                          accept="image/*"
                          hidden
                          onChange={onChangeAvatar}
                        />
                        <label className="" htmlFor="customFile">
                          {t("editProfile.upload")}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="d-md-flex  justify-content-md-end text-center">
                    <button
                      type="submit"
                      className="btn btn-primary mb-5"
                      style={{ marginTop: 20 }}
                    >
                      {t("editProfile.buttonUpdate")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
