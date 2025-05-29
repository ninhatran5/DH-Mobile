import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import TableShoppingCart from "../components/TableShoppingCart";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCart } from "../slices/cartSlice";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

const ShoppingCart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { carts, loading } = useSelector((state) => state.cart);
  console.log("🚀 ~ ShoppingCart ~ carts:", carts);

  const [selectAll, setSelectAll] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Khi carts thay đổi (từ redux), cập nhật cartItems
  useEffect(() => {
    if (carts && carts.length > 0) {
      setCartItems(
        carts.map((item) => ({
          ...item,
          selected: false,
        }))
      );
      setSelectAll(false);
    }
  }, [carts]);

  // Sửa lại handleSelectAll
  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setCartItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: newValue,
      }))
    );
  };

  // Sửa lại handleSelectItem
  const handleSelectItem = (id) => {
    const updated = cartItems.map((item) =>
      item.cart_item_id === id ? { ...item, selected: !item.selected } : item
    );
    setCartItems(updated);
    setSelectAll(updated.every((item) => item.selected));
  };

  const handleIncrease = (id) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + 1;
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updated);
  };

  const handleDecrease = (id) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        } else {
          toast.warn("Tối thiểu là 1 sản phẩm");
        }
      }
      return item;
    });
    setCartItems(updated);
  };

  const handleChangeQuantity = (id, value) => {
    const newQuantity = Number(value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      const updated = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);
    } else {
      toast.warn("Số lượng không hợp lệ");
    }
  };

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return (
    <>
      {loading && <Loading />}
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
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>{t("tableHeaders.product")}</th>
                        <th className="text-center">
                          {t("tableHeaders.quantity")}
                        </th>
                        <th className="text-center">
                          {t("tableHeaders.color")}
                        </th>
                        <th className="text-end">
                          {t("tableHeaders.version")}
                        </th>
                        <th className="text-end">
                          {t("tableHeaders.totalPrice")}
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <TableShoppingCart
                          key={item.cart_item_id}
                          item={item}
                          selectAll={selectAll}
                          handleSelectItem={handleSelectItem}
                          handleIncrease={handleIncrease}
                          handleDecrease={handleDecrease}
                          handleChangeQuantity={handleChangeQuantity}
                          isSelected={item.selected}
                        />
                      ))}
                    </tbody>
                  </table>
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
