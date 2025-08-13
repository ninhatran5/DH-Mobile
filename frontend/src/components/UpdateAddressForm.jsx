import { useForm } from "react-hook-form";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAddress } from "../slices/addressSlice";
import { useTranslation } from "react-i18next";

const UpdateAddressForm = forwardRef(
  ({ onSubmitExternal, defaultValues = {} }, ref) => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.address);

    const [selectedCityName, setSelectedCityName] = useState(
      defaultValues.city || ""
    );
    const [selectedDistrictName, setSelectedDistrictName] = useState(
      defaultValues.district || ""
    );
    const [selectedWardName, setSelectedWardName] = useState(
      defaultValues.ward || ""
    );

    const { t } = useTranslation();

    const {
      register,
      handleSubmit,
      setValue,
      reset,
      formState: { errors },
    } = useForm({
      mode: "onChange",
      defaultValues,
    });

    useEffect(() => {
      dispatch(fetchAddress());
    }, [dispatch]);

    useEffect(() => {
      if (data && data.length > 0) {
        reset(defaultValues);
        setSelectedCityName(defaultValues.city || "");
        setSelectedDistrictName(defaultValues.district || "");
        setSelectedWardName(defaultValues.ward || "");
      }
    }, [defaultValues, reset, data]);

    useEffect(() => {
      setValue("city", selectedCityName);
      setValue("district", selectedDistrictName);
      setValue("ward", selectedWardName);
    }, [selectedCityName, selectedDistrictName, selectedWardName, setValue]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        handleSubmit(onSubmitExternal)();
      },
    }));

    const selectedCity = data.find((city) => city.name === selectedCityName);
    const filteredDistricts = selectedCity?.districts || [];
    const selectedDistrict = filteredDistricts.find(
      (district) => district.name === selectedDistrictName
    );
    const filteredWards = selectedDistrict?.wards || [];

    return (
      <form onSubmit={handleSubmit(onSubmitExternal)} ref={ref}>
        <div className="container">
          <section className="checkout mt-3">
            <div className="row">
              <div className="col-lg-6">
                <div className="checkout__input">
                  <p>
                    {t("checkout.fullName")}
                    <span>*</span>
                  </p>
                  <input
                    type="text"
                    {...register("fullName", {
                      required: t("checkout.fullNameRequired"),
                      minLength: {
                        value: 2,
                        message: t("checkout.fullNameMinLength"),
                      },
                    })}
                  />
                  {errors.fullName && (
                    <p className="error_message_checkout">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="checkout__input">
                  <p>
                    {t("checkout.phone")}
                    <span>*</span>
                  </p>
                  <input
                    type="number"
                    {...register("phone", {
                      required: t("checkout.phoneRequired"),
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
                    <p className="error_message_checkout">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="checkout__input">
              <p>
                {t("checkout.email")}
                <span>*</span>
              </p>
              <input
                type="email"
                {...register("email", {
                  required: t("checkout.emailRequired"),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t("checkout.emailInvalid"),
                  },
                })}
              />
              {errors.email && (
                <p className="error_message_checkout">{errors.email.message}</p>
              )}
            </div>

            <div className="checkout__input">
              <p>
                {t("checkout.city")}
                <span>*</span>
              </p>
              <select
                {...register("city")}
                className="checkout_change_select form-select"
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedCityName(name);
                  setSelectedDistrictName("");
                  setSelectedWardName("");
                  setValue("district", "");
                  setValue("ward", "");
                }}
              >
                <option value="">{t("checkout.city")}</option>
                {data.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="error_message_checkout">{errors.city.message}</p>
              )}
            </div>

            <div className="checkout__input">
              <p>
                {t("checkout.district")}
                <span>*</span>
              </p>
              <select
                className="checkout_change_select form-select"
                {...register("district", {
                  required: t("checkout.districtRequired"),
                })}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedDistrictName(name);
                  setSelectedWardName("");
                  setValue("ward", "");
                }}
                disabled={!selectedCityName}
              >
                <option value="">{t("checkout.district")}</option>
                {filteredDistricts.map((district) => (
                  <option key={district.code} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="error_message_checkout">
                  {errors.district.message}
                </p>
              )}
            </div>

            <div className="checkout__input">
              <p>
                {t("checkout.ward")}
                <span>*</span>
              </p>
              <select
                className="checkout_change_select form-select"
                {...register("ward", {
                  required: t("checkout.wardRequired"),
                })}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelectedWardName(name);
                }}
                disabled={!selectedDistrictName}
              >
                <option value="">{t("checkout.ward")}</option>
                {filteredWards.map((ward) => (
                  <option key={ward.code} value={ward.name}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {errors.ward && (
                <p className="error_message_checkout">{errors.ward.message}</p>
              )}
            </div>

            <div className="checkout__input">
              <p>
                {t("checkout.addressDetail")}
                <span>*</span>
              </p>
              <input
                type="text"
                {...register("addressDetail", {
                  required: t("checkout.addressDetailRequired"),
                  minLength: {
                    value: 5,
                    message: t("checkout.addressDetailMinLength"),
                  },
                })}
              />
              {errors.addressDetail && (
                <p className="error_message_checkout">
                  {errors.addressDetail.message}
                </p>
              )}
            </div>
          </section>
        </div>
      </form>
    );
  }
);

export default UpdateAddressForm;
