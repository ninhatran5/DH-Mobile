import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import TableShoppingCart from "../components/TableShoppingCart";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";

const ShoppingCart = () => {
  const { t } = useTranslation();

  return (
    <>
      <Breadcrumb
        title={t("shoppingCart.title")}
        mainItem={t("breadcrumbProductDetail.breadcrumbTitleHome")}
        mainItem2={t("breadcrumbProductDetail.breadcrumbTitleProduct")}
        secondaryItem={t("shoppingCart.title")}
        linkMainItem={"/"}
        linkMainItem2={"/products"}
      />

      <section className="shopping-cart spad-cart">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-9">
              <div className="shopping__cart__table">
                <div className="shopping__cart__table__responsive">
                  <TableShoppingCart />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6">
                  <div className="continue__btn">
                    <Link style={{ textDecoration: "none" }} to={"/products"}>
                      {t("shoppingCart.continueShopping")}
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6">
                  <div className="continue__btn update__btn">
                    <button type="button">
                      <FaTrash />
                      {t("shoppingCart.delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="cart__discount">
                <h6>{t("shoppingCart.discountCode")}</h6>
                <form action="#">
                  <input
                    type="text"
                    placeholder={t("shoppingCart.discountPlaceholder")}
                  />
                  <button type="submit">{t("shoppingCart.apply")}</button>
                </form>
              </div>
              <div className="cart__total">
                <h6>{t("shoppingCart.cartTotal")}</h6>
                <ul style={{ marginLeft: -30 }}>
                  <li>
                    {t("shoppingCart.discount")} <span>- 0đ</span>
                  </li>
                  <li>
                    {t("shoppingCart.totalPrice")}: <span>10đ</span>
                  </li>
                </ul>
                <Link
                  to={"/checkout"}
                  style={{ textDecoration: "none" }}
                  className="primary-btn"
                >
                  {t("shoppingCart.checkout")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ShoppingCart;
