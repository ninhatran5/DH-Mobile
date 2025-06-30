/* eslint-disable no-unused-vars */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TbExchange } from "react-icons/tb";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProfile } from "../slices/profileSlice";
import Loading from "../components/Loading";
import numberFormat from "../../utils/numberFormat";
import { fetchCODCheckout, fetchVnpayCheckout } from "../slices/checkOutSlice";
import { applyVoucher, fetchVoucherForUser } from "../slices/voucherSlice";
import { toast } from "react-toastify";
import { fetchCart } from "../slices/cartSlice";
import ChangeAddressModal from "../components/ChangeAddressModal";
import "../assets/css/checkout.css";

const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { profile, loading } = useSelector((state) => state.profile);
  const { vouchers, loading: voucherLoading } = useSelector((state) => state.voucher || {});
  console.log("🚀 ~ CheckOut ~ vouchers:", vouchers)
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const navigate = useNavigate();
  const handleNextPageDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item?.variant?.price,
    0
  );
  const vouchertest = vouchers?.voucher_id
  console.log("🚀 ~ CheckOut ~ vouchertest:", vouchertest)

  const finalPrice = totalPrice - discountAmount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

   const voucherData = {
voucher_id: vouchers?.[0]?.voucher?.voucher_id,
  items: selectedItems.map((item) => ({
    variant_id: item.variant.variant_id,
    price_snapshot: item.variant.price.toString(),
    quantity: item.quantity
  }))
};


    try {
      const result = await dispatch(applyVoucher(voucherData)).unwrap();
      if (result && result.discount_amount) {
        setDiscountAmount(result.discount_amount);
        toast.success("Áp dụng voucher thành công!");
      } else {
        toast.error("Không thể áp dụng voucher này");
      }
    } catch (error) {
      toast.error(error || "Voucher không hợp lệ");
    }
  };

  const handleCheckOutCOD = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCheckOutVNPAY = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    const addressData = selectedAddress || profile.user || {};
    const { address, city, district, ward, phone } = addressData;

    if (!address || !city || !district || !ward || !phone) {
      toast.error(t("toast.missingAddress"));
      return;
    }
    const payloadBase = {
      user_id: profile.user.id,
      items: selectedItems.map((item) => ({
        variant_id: Number(item.variant.variant_id),
        quantity: Number(item.quantity),
        price_snapshot: Number(item.price_snapshot),
      })),
      total_amount: Number(finalPrice),
      address: addressData.address,
      customer: addressData.recipient_name || profile.user.full_name || "",
      email: addressData.email || profile.user.email || "",
      city: addressData.city,
      district: addressData.district,
      ward: addressData.ward,
      phone: addressData.phone,
    };

    if (paymentMethod === "cod") {
      try {
        await dispatch(fetchCODCheckout(payloadBase)).unwrap();
        await dispatch(fetchCart());
        navigate("/waiting-for-payment");
      } catch (error) {
        toast.error(t("toast.paymentError"));
      }
      return;
    }

    if (paymentMethod === "vnpay") {
      try {
        const actionResult = await dispatch(fetchVnpayCheckout(payloadBase));
        const result = actionResult.payload;
        if (result && result.payment_url) {
          window.open(result.payment_url);
        } else {
          toast.error(t("toast.maxOnlineAmount"));
        }
      } catch (err) {
        toast.error(t("toast.paymentError"));
      }
    }
  };

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchVoucherForUser())
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCart()).then((res) => {
      if (!res.payload || res.payload.length === 0) {
        navigate("/shopping-cart");
      }
    });
  }, [dispatch, navigate]);

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("checkout.title")}
        mainItem={t("breadcrumb.home")}
        mainItem2={t("breadcrumb.cart")}
        secondaryItem={t("checkout.title")}
        linkMainItem="/"
        linkMainItem2="/shopping-cart"
      />
      <div className="container-fluid">
        <section className="checkout" style={{ marginTop: 60 }}>
          <div className="checkout__form">
            <form action="#">
              <div className="row">
                <div className="col-lg-8 col-md-6 mb-5">
                  <h5 className="checkout__title">
                    {t("checkout.checkInfo")}{" "}
                  </h5>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>
                          {t("checkout.fullName")}
                          <span>*</span>
                        </p>
                        <input
                          type="text"
                          value={
                            selectedAddress?.recipient_name ||
                            profile?.user?.full_name ||
                            "Chưa cập nhật"
                          }
                          disabled
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="checkout__input">
                        <p>
                          {t("checkout.phone")}
                          <span>*</span>
                        </p>
                        <input
                          type="text"
                          min={0}
                          value={
                            selectedAddress?.phone ||
                            profile?.user?.phone ||
                            "Chưa cập nhật"
                          }
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.email")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={
                        selectedAddress?.email ||
                        profile?.user?.email ||
                        "Chưa cập nhật"
                      }
                      disabled
                    />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.ward")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={
                        selectedAddress?.ward ||
                        profile?.user?.ward ||
                        "Chưa cập nhật"
                      }
                      disabled
                    />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.district")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={
                        selectedAddress?.district ||
                        profile?.user?.district ||
                        "Chưa cập nhật"
                      }
                      disabled
                    />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.city")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={
                        selectedAddress?.city ||
                        profile?.user?.city ||
                        "Chưa cập nhật"
                      }
                      disabled
                    />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.addressDetail")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      disabled
                      value={
                        selectedAddress?.address ||
                        profile?.user?.address ||
                        "Chưa cập nhật"
                      }
                    />
                  </div>
                  <div className="checkout_change_address">
                    <Link
                      onClick={handleShow}
                      state={{ selectedItems }}
                      className="checkout_change_address_link"
                    >
                      <h6 className="checkout_change_address_name">
                        <TbExchange
                          style={{
                            marginRight: 5,
                            marginBottom: 2,
                            fontSize: 20,
                          }}
                        />
                        {t("checkout.changeAddress")}
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
                          name="checkout"
                          id="cod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={handleCheckOutCOD}
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
                          name="checkout"
                          id="vnpay"
                          value={"vnpay"}
                          onChange={handleCheckOutVNPAY}
                          checked={paymentMethod === "vnpay"}
                        />
                        <span className="checkmark" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="cart__discount" style={{ marginBottom: 30 }}>
                    <h6>{t("shoppingCart.discountCode")}</h6>
                    <div className="discount__input-btn">
                      <input
                        type="text"
                        className="input__discount"
                        placeholder={t("shoppingCart.discountPlaceholder")}
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                      />
                      <button 
                        className="btn__discountCode" 
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading}
                      >
                        {voucherLoading ? "..." : t("shoppingCart.apply")}
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
                                  item.quantity * item?.variant?.price
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    ))}

                    <ul className="checkout__total__all">
                      <li>
                        {t("checkout.discount")}: <span>- {numberFormat(discountAmount)}</span>
                      </li>
                      <li>
                        {t("checkout.totalMoney")}:{" "}
                        <span>{numberFormat(finalPrice)}</span>
                      </li>
                    </ul>
                    <button className="site-btn" onClick={handleCheckout}>
                      {t("checkout.payNow")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
      <ChangeAddressModal
        show={show}
        handleClose={handleClose}
        onSaveAddress={setSelectedAddress}
      />
    </>
  );
};
export default CheckOut;
