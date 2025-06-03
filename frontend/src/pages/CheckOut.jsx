import { Link } from "react-router-dom";
import { TbExchange } from "react-icons/tb";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProfile } from "../slices/profileSlice";
import Loading from "../components/Loading";
import { fetchCart } from "../slices/cartSlice";
import numberFormat from "../../utils/numberFormat";

const CheckOut = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);

  const { carts } = useSelector((state) => state.cart);
  console.log("🚀 ~ ShoppingCart ~ carts:", carts);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCart());
  }, [dispatch]);
  const totalPrice = carts.reduce(
    (sum, item) => sum + item.quantity * item.price_snapshot,
    0
  );
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
                          value={profile?.user?.full_name ?? "Chưa cập nhật"}
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
                          value={profile?.user?.phone ?? "Chưa cập nhật"}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.ward")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={profile?.user?.ward ?? "Chưa cập nhật"}
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
                      value={profile?.user?.district ?? "Chưa cập nhật"}
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
                      value={profile?.user?.city ?? "Chưa cập nhật"}
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
                      value={profile?.user?.address ?? "Chưa cập nhật"}
                    />
                  </div>
                  <div className="checkout_change_address">
                    <Link
                      to={"/change-checkout"}
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
                  <div style={{ marginTop: -30, width: "60%" }}>
                    <div className="checkout__input__checkbox">
                      <label htmlFor="acc">
                        <h4 className="checkout-text">
                          {t("checkout.payOnDelivery")}
                        </h4>
                        <input type="radio" name="checkout" id="acc" />
                        <span className="checkmark" />
                      </label>
                    </div>
                    <div className="checkout__input__checkbox">
                      <label htmlFor="vnpay">
                        <h4 className="checkout-text">
                          {t("checkout.payViaVNPAY")}
                        </h4>
                        <input type="radio" name="checkout" id="vnpay" />
                        <span className="checkmark" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
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
                    {carts.map((item) => (
                      <ul
                        key={item.cart_item_id}
                        className="checkout__total__products"
                        style={{ padding: 0, marginBottom: 12 }}
                      >
                        <li>
                          <div
                            className="checkout_card"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              border: "1px solid #eee",
                              borderRadius: 12,
                              padding: 12,
                              background: "#fafbfc",
                            }}
                          >
                            <div
                              className="checkout_card_image"
                              style={{
                                width: 64,
                                height: 64,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#fff",
                                border: "1px solid #eee",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={item?.variant?.image_url}
                                alt={item?.variant?.product?.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                className="checkout_card_name"
                                style={{
                                  fontWeight: 700,
                                  fontSize: 17,
                                  margin: 0,
                                  color: "#222",
                                  marginBottom: 6,
                                  lineHeight: 1.3,
                                  wordBreak: "break-word",
                                }}
                              >
                                {item?.variant?.product?.name}
                              </p>
                              <div
                                style={{
                                  marginBottom: 8,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                }}
                              >
                                {item?.variant?.attribute_values?.map(
                                  (attr) => (
                                    <span
                                      key={attr.value_id}
                                      style={{
                                        display: "inline-block",
                                        background: "#f3f6fd",
                                        color: "#1976d2",
                                        borderRadius: 8,
                                        padding: "3px 12px",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        border: "1.5px solid #90caf9",
                                        marginBottom: 2,
                                        boxShadow:
                                          "0 1px 2px rgba(25, 118, 210, 0.07)",
                                      }}
                                    >
                                      {attr.value}
                                    </span>
                                  )
                                )}
                              </div>
                              <p
                                className="checkout_card_price"
                                style={{
                                  color: "#e74c3c",
                                  fontWeight: 700,
                                  fontSize: 15,
                                  margin: 0,
                                  letterSpacing: 0.5,
                                }}
                              >
                                {numberFormat(item?.variant?.product?.price)}
                              </p>
                            </div>
                            <div style={{ textAlign: "center", minWidth: 60 }}>
                              <div
                                className="checkout_card_quantity"
                                style={{
                                  fontWeight: 500,
                                  fontSize: 15,
                                  marginBottom: 4,
                                  color: "#444",
                                }}
                              >
                                x{item?.quantity}
                              </div>
                              <span
                                className="checkout_card_total"
                                style={{
                                  color: "#27ae60",
                                  fontWeight: 700,
                                  fontSize: 15,
                                  display: "block",
                                }}
                              >
                                {numberFormat(
                                  item?.quantity * item?.price_snapshot
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    ))}
                    <ul className="checkout__total__all">
                      <li>
                        {t("checkout.discount")}: <span>- 0đ</span>
                      </li>
                      <li>
                        {t("checkout.totalMoney")}:{" "}
                        <span>{numberFormat(totalPrice)}</span>
                      </li>
                    </ul>
                    <Link to={"/thank-you"}>
                      <button className="site-btn">
                        {t("checkout.payNow")}
                      </button>
                    </Link>
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
export default CheckOut;
