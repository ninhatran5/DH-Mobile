/* eslint-disable no-unused-vars */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TbExchange, TbTicketOff } from "react-icons/tb";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProfile } from "../slices/profileSlice";
import Loading from "../components/Loading";
import numberFormat from "../../utils/numberFormat";
import {
  fetchCODCheckout,
  fetchVnpayCheckout,
  fetchWalletCheckout,
} from "../slices/checkOutSlice";
import { applyVoucher, fetchVoucherForUser } from "../slices/voucherSlice";
import { toast } from "react-toastify";
import { fetchCart } from "../slices/cartSlice";
import { fetchRank } from "../slices/rankSlice";
import ChangeAddressModal from "../components/ChangeAddressModal";
import VoucherDropdown from "../components/VoucherDropdown";
import { fetchWallet } from "../slices/walletSlice";
import { HiWallet } from "react-icons/hi2";
import InsufficientFundsModal from "../components/InsufficientFundsModal";
import { fetchAddressNew } from "../slices/changeAddressSlice";
import "../assets/css/checkout.css";

const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const { ranks } = useSelector((state) => state.rank || {});
  const [loadingCOD, setLoadingCOD] = useState(false);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
    useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { profile, loading } = useSelector((state) => state.profile);
  const { vouchers, loading: voucherLoading } = useSelector(
    (state) => state.voucher || {}
  );
  const { wallets } = useSelector((state) => state.wallet);
  const { changeAddressNew } = useSelector((state) => state.changeAddress);
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
  const rankDiscountPercent = ranks?.current_tier?.discount_percent
    ? parseFloat(ranks.current_tier.discount_percent.replace("%", ""))
    : 0;
  const rankDiscountAmount = (totalPrice * rankDiscountPercent) / 100;

  const voucherDiscountAmount = discountAmount || 0;
  const walletBalance = Number(wallets?.balance) || 0;
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        await Promise.all([
          dispatch(fetchProfile()),
          dispatch(fetchAddressNew()),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadDefaultAddress();
    dispatch(fetchVoucherForUser());
    dispatch(fetchRank());
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    if (changeAddressNew && changeAddressNew.length > 0 && !selectedAddress) {
      // Tìm địa chỉ mặc định
      const defaultAddress = changeAddressNew.find(
        (address) => address.is_default === 1
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [changeAddressNew, selectedAddress]);

  const handleToggleWallet = () => {
    const priceAfterDiscounts =
      totalPrice - rankDiscountAmount - voucherDiscountAmount;

    if (!useWallet) {
      if (walletBalance < priceAfterDiscounts && priceAfterDiscounts > 0) {
        setShowInsufficientFundsModal(true);
        return;
      }
      setUseWallet(true);
      setPaymentMethod("wallet");
    } else {
      setUseWallet(false);
      setPaymentMethod("cod");
    }
  };

  const priceAfterDiscounts =
    totalPrice - rankDiscountAmount - voucherDiscountAmount;
  const isWalletEnough = useWallet && walletBalance >= priceAfterDiscounts;

  const walletDeductAmount = useWallet
    ? isWalletEnough
      ? 0
      : walletBalance
    : 0;

  const finalPrice = priceAfterDiscounts - walletDeductAmount;

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) {
      toast.error(t("voucher.selectError"));
      return;
    }

    const voucherData = {
      voucher_id:
        selectedVoucher.voucher_id || selectedVoucher.voucher?.voucher_id,
      items: selectedItems.map((item) => ({
        variant_id: item.variant.variant_id,
        price_snapshot: item.variant.price.toString(),
        quantity: item.quantity,
      })),
    };

    try {
      const result = await dispatch(applyVoucher(voucherData)).unwrap();
      if (result && result.discount_amount) {
        setDiscountAmount(result.discount_amount);
        toast.success(t("voucher.applySuccess"));
        setShowVoucherDropdown(false);
      } else {
        toast.error(t("voucher.applyFail"));
      }
    } catch (error) {
      toast.error(error || t("voucher.invalid"));
    }
  };

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherCode(voucher.code || voucher.voucher?.code || "");
    setShowVoucherDropdown(false);
  };

  const handleCheckOutCOD = (event) => {
    setPaymentMethod(event.target.value);
    setUseWallet(false);
  };

  const handleCheckOutVNPAY = (event) => {
    setPaymentMethod(event.target.value);
    setUseWallet(false);
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
        price_snapshot: Number(item.variant.price),
      })),
      total_amount: Number(finalPrice),
      voucher_id: selectedVoucher
        ? selectedVoucher.voucher_id || selectedVoucher.voucher?.voucher_id
        : null,
      voucher_discount: Number(discountAmount),
      rank_discount: Number(rankDiscountAmount),
      wallet_amount: Number(walletDeductAmount),
      address: addressData.address,
      customer: addressData.recipient_name || profile.user.full_name || "",
      email: addressData.email || profile.user.email || "",
      city: addressData.city,
      district: addressData.district,
      ward: addressData.ward,
      phone: addressData.phone,
    };

    if (paymentMethod === "wallet" && useWallet) {
      if (walletBalance < priceAfterDiscounts) {
        toast.error(t("modal.walletInsufficientDesc"));
        return;
      }
      setLoadingCOD(true);
      try {
        await dispatch(fetchWalletCheckout(payloadBase)).unwrap();
        await dispatch(fetchCart());
        navigate("/thank-you");
      } catch (error) {
        toast.error(t("toast.paymentError"));
      } finally {
        setLoadingCOD(false);
      }
      return;
    }

    if (paymentMethod === "cod" || (useWallet && finalPrice === 0)) {
      setLoadingCOD(true);
      try {
        await dispatch(fetchCODCheckout(payloadBase)).unwrap();
        await dispatch(fetchCart());
        navigate("/waiting-for-payment");
      } catch (error) {
        toast.error(t("toast.paymentError"));
      } finally {
        setLoadingCOD(false);
      }
      return;
    }

    if (paymentMethod === "vnpay") {
      if (finalPrice >= 200000000) {
        toast.error(t("toast.maxOnlineAmount"));
        return;
      }
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

  const handleProceedWithVNPay = async () => {
    setShowInsufficientFundsModal(false);
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
        price_snapshot: Number(item.variant.price),
      })),
      total_amount: Number(finalPrice),
      voucher_id: selectedVoucher
        ? selectedVoucher.voucher_id || selectedVoucher.voucher?.voucher_id
        : null,
      voucher_discount: Number(discountAmount),
      rank_discount: Number(rankDiscountAmount),
      wallet_amount: Number(walletBalance),
      address: addressData.address,
      customer: addressData.recipient_name || profile.user.full_name || "",
      email: addressData.email || profile.user.email || "",
      city: addressData.city,
      district: addressData.district,
      ward: addressData.ward,
      phone: addressData.phone,
    };

    if (finalPrice >= 200000000) {
      toast.error(t("toast.maxOnlineAmount"));
      return;
    }

    try {
      const actionResult = await dispatch(fetchWalletCheckout(payloadBase));
      const result = actionResult.payload;

      if (result && result.payment_url) {
        window.open(result.payment_url, "_blank");
        if (result.message) {
          toast.info(result.message);
        }
        await dispatch(fetchCart());
      } else {
        toast.error(t("toast.maxOnlineAmount"));
      }
    } catch (err) {
      toast.error(t("toast.paymentError"));
    }
  };

  const handleCancelWalletUse = () => {
    setShowInsufficientFundsModal(false);
    setUseWallet(false);
  };

  useEffect(() => {
    dispatch(fetchCart()).then((res) => {
      if (!res.payload || res.payload.length === 0) {
        navigate("/shopping-cart");
      }
    });
  }, [dispatch, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showVoucherDropdown &&
        !event.target.closest(".checkout-voucher-apply-container")
      ) {
        setShowVoucherDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVoucherDropdown]);

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
      <div className="container">
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
                          disabled={
                            useWallet &&
                            walletBalance >= priceAfterDiscounts &&
                            priceAfterDiscounts > 0
                          }
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
                          disabled={
                            useWallet &&
                            walletBalance >= priceAfterDiscounts &&
                            priceAfterDiscounts > 0
                          }
                        />
                        <span className="checkmark" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="cart__discount" style={{ marginBottom: 30 }}>
                    <h6>{t("shoppingCart.discountCode")}</h6>
                    <div className="discount__input-btn checkout-voucher-apply-container">
                      <input
                        type="text"
                        className="input__discount checkout-voucher-apply-input"
                        placeholder={
                          selectedVoucher
                            ? selectedVoucher.code ||
                              selectedVoucher.voucher?.code
                            : t("shoppingCart.discountPlaceholder")
                        }
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        onClick={() =>
                          setShowVoucherDropdown(!showVoucherDropdown)
                        }
                        readOnly
                      />
                      <button
                        className="btn__discountCode"
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading}
                      >
                        {t("shoppingCart.apply")}
                      </button>

                      {showVoucherDropdown && (
                        <div className="checkout-voucher-apply-dropdown">
                          {vouchers && vouchers.length > 0 ? (
                            vouchers.map((voucher, index) => (
                              <VoucherDropdown
                                key={
                                  voucher.voucher?.voucher_id ||
                                  voucher.voucher_id ||
                                  index
                                }
                                voucher={voucher}
                                handleSelectVoucher={handleSelectVoucher}
                              />
                            ))
                          ) : (
                            <div className="checkout-voucher-apply-empty">
                              <TbTicketOff />
                              {t("shoppingCart.noVoucher")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {walletBalance > 0 && (
                      <div
                        className="wallet-option-container"
                        style={{
                          border: "2px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "16px",
                          marginTop: "16px",
                          backgroundColor: useWallet ? "#f0f9ff" : "#ffffff",
                          borderColor: useWallet ? "#0ea5e9" : "#e5e7eb",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onClick={handleToggleWallet}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "#16a34a",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "12px",
                              }}
                            >
                              <HiWallet style={{ color: "white" }} />
                            </div>
                            <div>
                              <h6
                                className="mb-1"
                                style={{
                                  fontWeight: "600",
                                  color: "#1f2937",
                                  fontSize: "16px",
                                }}
                              >
                                {t("checkout.useWallet")}
                              </h6>
                              <p
                                className="mb-0"
                                style={{
                                  color: "#6b7280",
                                  fontSize: "14px",
                                }}
                              >
                                {t("checkout.walletBalance")}
                                <span
                                  style={{
                                    color: "#16a34a",
                                    fontWeight: "600",
                                  }}
                                >
                                  {numberFormat(walletBalance)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              border: "2px solid",
                              borderColor: useWallet ? "#0ea5e9" : "#d1d5db",
                              borderRadius: "50%",
                              backgroundColor: useWallet
                                ? "#0ea5e9"
                                : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {useWallet && (
                              <svg
                                width="12"
                                height="12"
                                fill="white"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                      {rankDiscountAmount > 0 && (
                        <li>
                          {t("checkout.rankDiscount")}:{" "}
                          <span>- {numberFormat(rankDiscountAmount)}</span>
                        </li>
                      )}
                      {voucherDiscountAmount > 0 && (
                        <li>
                          {t("checkout.voucherDiscount")}:{" "}
                          <span>- {numberFormat(voucherDiscountAmount)}</span>
                        </li>
                      )}
                      {useWallet &&
                        walletDeductAmount > 0 &&
                        walletDeductAmount < priceAfterDiscounts && (
                          <li>
                            {t("checkout.walletDiscount")}:{" "}
                            <span>- {numberFormat(walletDeductAmount)}</span>
                          </li>
                        )}

                      <li>
                        {t("checkout.totalMoney")}:{" "}
                        <span>{numberFormat(finalPrice)}</span>
                      </li>
                    </ul>

                    <button
                      className="site-btn"
                      onClick={handleCheckout}
                      disabled={loadingCOD}
                      style={{ position: "relative" }}
                    >
                      {t("checkout.payNow")}
                      {loadingCOD && (
                        <span
                          style={{ marginLeft: 10, verticalAlign: "middle" }}
                        >
                          <Loading size={18} />
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      <InsufficientFundsModal
        show={showInsufficientFundsModal}
        walletBalance={walletBalance}
        priceAfterDiscounts={priceAfterDiscounts}
        handleCancelWalletUse={handleCancelWalletUse}
        handleProceedWithVNPay={handleProceedWithVNPay}
      />

      <ChangeAddressModal
        show={show}
        handleClose={handleClose}
        onSaveAddress={setSelectedAddress}
        currentSelectedAddress={selectedAddress}
      />
    </>
  );
};
export default CheckOut;
