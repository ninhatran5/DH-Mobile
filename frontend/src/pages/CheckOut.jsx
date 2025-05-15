import { Link } from "react-router-dom";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { TbExchange } from "react-icons/tb";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";

const CheckOut = () => {
  const { t } = useTranslation();

  const purchaseInformation = [
    {
      id: 1,
      name: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      image: iphone,
      quantity: 1,
      total: "27.890.000đ",
    },
    {
      id: 2,
      name: "iPhone 15 Pro Max 64GB | Chính hãng US/A",
      image: iphone,
      quantity: 2,
      total: "14.890.000đ",
    },
  ];

  return (
    <>
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
                        <input type="text" value={"Lê Nguyên Tùng"} disabled />
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
                          min={0}
                          value={"0396180619"}
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
                    <input type="text" value={"Thị Trấn Thiệu Hóa"} disabled />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.district")}
                      <span>*</span>
                    </p>
                    <input type="text" value={"Thiệu Hóa"} disabled />
                  </div>
                  <div className="checkout__input">
                    <p>
                      {t("checkout.city")}
                      <span>*</span>
                    </p>
                    <input type="text" value={"Thanh Hóa"} disabled />
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
                        "Khu phố 8, Thị trấn thiệu hóa, Huyện thiệu hóa, Tỉnh Thanh Hóa"
                      }
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
                    {purchaseInformation.map((item) => (
                      <ul key={item.id} className="checkout__total__products">
                        <li>
                          <div className="checkout_card">
                            <div className="checkout_card_image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <p className="checkout_card_name">{item.name}</p>
                            <p className="checkout_card_quantity">
                              {item.quantity}
                            </p>
                            <span className="checkout_card_total">
                              {item.total}
                            </span>
                          </div>
                        </li>
                      </ul>
                    ))}
                    <ul className="checkout__total__all">
                      <li>
                        {t("checkout.discount")}: <span>- 750đ</span>
                      </li>
                      <li>
                        {t("checkout.totalMoney")}: <span>1000000đ</span>
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
