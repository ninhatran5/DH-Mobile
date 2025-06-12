import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoReturnDownBack } from "react-icons/io5";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAddress } from "../slices/addressSlice";

import { useForm } from "react-hook-form";
import "../../src/assets/css/checkout.css";
import { fetchCart } from "../slices/cartSlice";
import numberFormat from "../../utils/numberFormat";
import { fetchVnpayCheckout } from "../slices/checkOutSlice";

const ChangeCheckout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.profile);
  const { data } = useSelector((state) => state.address);
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const handleNextPageDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item?.variant?.price,
    0
  );

  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selectedWardName, setSelectedWardName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      city: "",
      district: "",
      ward: "",
      addressDetail: "",
      paymentMethod: "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const selectedCity = data.find((city) => city.name === selectedCityName);
  const filteredDistricts = selectedCity?.districts || [];
  const selectedDistrict = filteredDistricts.find(
    (district) => district.name === selectedDistrictName
  );
  const filteredWards = selectedDistrict?.wards || [];

  useEffect(() => {
    setValue("city", selectedCityName);
    setValue("district", selectedDistrictName);
    setValue("ward", selectedWardName);
  }, [selectedCityName, selectedDistrictName, selectedWardName, setValue]);

  const onSubmit = async (formData) => {
    // const cityName =
    //   data.find((city) => city.code === Number(formData.city))?.name || "";
    // const districtName =
    //   filteredDistricts.find(
    //     (district) => district.code === Number(formData.district)
    //   )?.name || "";
    // const wardName =
    //   filteredWards.find((ward) => ward.code === Number(formData.ward))?.name ||
    //   "";

    if (paymentMethod === "cod") {
      navigate("/thank-you");
      return;
    }

    if (paymentMethod === "vnpay") {
      try {
        const actionResult = await dispatch(
          fetchVnpayCheckout({
            user_id: profile.user.id,
            items: selectedItems.map((item) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
            })),
            total_amount: totalPrice,
            full_name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: `${formData.addressDetail}, ${formData.city}, ${formData.district}, ${formData.ward}`,
          })
        );
        console.log({
          user_id: profile.user.id,
          items: selectedItems.map((item) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          total_amount: totalPrice,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: `${formData.addressDetail}, ${formData.city}, ${formData.district}, ${formData.ward}`,
        });

        const result = actionResult.payload;
        if (result && result.payment_url) {
          window.location.href = result.payment_url;
        } else {
          console.error("Không có URL VNPAY trả về");
        }
      } catch (err) {
        console.error("Thanh toán VNPAY thất bại", err);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddress());
  }, [dispatch]);

  return (
    <>
      <Breadcrumb
        title={t("checkout.titleChange")}
        mainItem={t("breadcrumb.home")}
        mainItem2={t("breadcrumb.cart")}
        secondaryItem={t("checkout.titleChange")}
        linkMainItem={"/"}
        linkMainItem2={"/shopping-cart"}
      />
      <div className="container-fluid">
        <section className="checkout" style={{ marginTop: 60 }}>
          <div className="checkout__form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-lg-8 col-md-6 mb-5">
                  <h5 className="checkout__title">{t("checkout.enterInfo")}</h5>
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
                      <p className="error_message_checkout">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="checkout__input">
                    <p>
                      {t("checkout.city")}
                      <span>*</span>
                    </p>
                    <select
                      className="checkout_change_select form-select"
                      aria-label="City"
                      {...register("city", {
                        required: t("checkout.cityRequired"),
                      })}
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
                      <p className="error_message_checkout">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* Select Quận/Huyện */}
                  <div className="checkout__input">
                    <p>
                      {t("checkout.district")}
                      <span>*</span>
                    </p>
                    <select
                      className="checkout_change_select form-select"
                      aria-label="District"
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

                  {/* Select Phường/Xã */}
                  <div className="checkout__input">
                    <p>
                      {t("checkout.ward")}
                      <span>*</span>
                    </p>
                    <select
                      className="checkout_change_select form-select"
                      aria-label="Ward"
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
                      <p className="error_message_checkout">
                        {errors.ward.message}
                      </p>
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

                  <div className="checkout_change_address">
                    <Link
                      to={"/checkout"}
                      state={{ selectedItems }}
                      className="checkout_change_address_link"
                    >
                      <h6 className="checkout_change_address_name">
                        <IoReturnDownBack
                          style={{
                            marginRight: 5,
                            marginBottom: 2,
                            fontSize: 23,
                          }}
                        />
                        {t("checkout.backAddress")}
                      </h6>
                    </Link>
                  </div>

                  {/* marginTop: -30, */}
                  <div style={{ width: "60%" }}>
                    <div className="checkout__input__checkbox">
                      <label htmlFor="cod">
                        <h4 className="checkout-text">
                          {t("checkout.payOnDelivery")}
                        </h4>
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="cod"
                          value="cod"
                          {...register("paymentMethod", {
                            required: t("checkout.paymentMethodRequired"),
                          })}
                        />
                        <span className="checkmark" />
                      </label>
                    </div>
                    <div className="checkout__input__checkbox">
                      <label htmlFor="vnpay">
                        <h4 className="checkout-text">
                          {t("checkout.payViaVNPAY")}
                        </h4>
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="vnpay"
                          value="vnpay"
                          {...register("paymentMethod", {
                            required: t("checkout.paymentMethodRequired"),
                          })}
                        />
                        <span className="checkmark" />
                      </label>
                    </div>
                    {errors.paymentMethod && (
                      <p className="error_message_checkout">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="col-lg-4 col-md-6">
                  <div className="cart__discount" style={{ marginBottom: 30 }}>
                    <h6>{t("shoppingCart.discountCode")}</h6>
                    <div className="discount__input-btn">
                      <input
                        type="text"
                        className="input__discount"
                        placeholder={t("shoppingCart.discountPlaceholder")}
                      />
                      <button className="btn__discountCode" type="submit">
                        {t("shoppingCart.apply")}
                      </button>
                    </div>
                  </div>
                  <div className="checkout__order">
                    <h4 className="order__title">{t("checkout.cartTotal")}</h4>
                    <div className="checkout__order__products">
                      <div className="checkout_title_card">
                        <p className="checkout_title_card_name_product">
                          {t("checkout.product")}
                        </p>
                        <p className="checkout_title_card_name_quantity">
                          {t("checkout.quantity")}
                        </p>
                        <p className="checkout_title_card_name_total">
                          {t("checkout.totalPrice")}
                        </p>
                      </div>
                    </div>
                    {selectedItems.map((item) => (
                      <ul
                        key={item.cart_item_id}
                        className="checkout__total__products"
                        style={{ padding: 0, marginBottom: 12 }}
                      >
                        <li>
                          <div className="checkout_card">
                            <div
                              className="checkout_card_image"
                              onClick={() =>
                                handleNextPageDetail(
                                  item?.variant?.product?.product_id
                                )
                              }
                            >
                              <img
                                src={item?.variant?.image_url}
                                alt={item?.variant?.product?.name}
                                style={{
                                  width: "100%",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                              />
                            </div>
                            <div className="checkout_card_info">
                              <p
                                onClick={() =>
                                  handleNextPageDetail(
                                    item?.variant?.product?.product_id
                                  )
                                }
                                className="checkout_card_name"
                                style={{ cursor: "pointer" }}
                              >
                                {item?.variant?.product?.name}
                              </p>
                              <div className="checkout_card_attrs">
                                {item?.variant?.attribute_values?.map(
                                  (attr) => (
                                    <span
                                      className="checkout_card_attr"
                                      key={attr.value_id}
                                    >
                                      {attr.value}
                                    </span>
                                  )
                                )}
                              </div>
                              <p className="checkout_card_price">
                                {numberFormat(item?.variant?.price)}
                              </p>
                            </div>
                            <div className="checkout_card_right">
                              <div className="checkout_card_quantity">
                                x{item?.quantity}
                              </div>
                              <span className="checkout_card_total">
                                {numberFormat(
                                  item?.quantity * item?.variant?.price
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    ))}
                    <ul className="checkout__total__all">
                      <li>
                        {t("checkout.discount")} <span>- 0đ</span>
                      </li>
                      <li>
                        {t("checkout.totalMoney")}{" "}
                        <span>{numberFormat(totalPrice)}</span>
                      </li>
                    </ul>
                    <button type="submit" className="site-btn">
                      {t("checkout.payNow")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ChangeCheckout;
