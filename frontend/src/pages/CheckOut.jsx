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

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCart());
  }, [dispatch]);
  const totalPrice = carts.reduce(
    (sum, item) => sum + item.quantity * item?.variant?.product?.price,
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
                      {t("checkout.email")}
                      <span>*</span>
                    </p>
                    <input
                      type="text"
                      value={profile?.user?.email ?? "Chưa cập nhật"}
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
                  <div className="cart__discount" style={{ marginBottom: 30 }}>
                    <h6>{t("shoppingCart.discountCode")}</h6>
                    <form action="#">
                      <input
                        type="text"
                        placeholder={t("shoppingCart.discountPlaceholder")}
                      />
                      <button type="submit">{t("shoppingCart.apply")}</button>
                    </form>
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
                    {carts.map((item) => (
                      <ul
                        key={item.cart_item_id}
                        className="checkout__total__products"
                        style={{ padding: 0, marginBottom: 12 }}
                      >
                        <li>
                          <div className="checkout_card">
                            <div className="checkout_card_image">
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
                            <div className="checkout_card_info">
                              <p className="checkout_card_name">
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
                                {numberFormat(item?.variant?.product?.price)}
                              </p>
                            </div>
                            <div className="checkout_card_right">
                              <div className="checkout_card_quantity">
                                x{item?.quantity}
                              </div>
                              <span className="checkout_card_total">
                                {numberFormat(
                                  item?.quantity * item?.variant?.product?.price
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
