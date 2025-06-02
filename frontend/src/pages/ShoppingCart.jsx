import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import TableShoppingCart from "../components/TableShoppingCart";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchCart,
  fetchUpdateCartQuantity,
  deleteProductCart,
} from "../slices/cartSlice";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import numberFormat from "../../utils/numberFormat";

const ShoppingCart = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { carts, loading } = useSelector((state) => state.cart);
  console.log("🚀 ~ ShoppingCart ~ carts:", carts);

  const [selectAll, setSelectAll] = useState(false);
  const [cartItems, setCartItems] = useState([]);

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

  const handleSelectItem = (id) => {
    const updated = cartItems.map((item) =>
      item.variant_id === id ? { ...item, selected: !item.selected } : item
    );
    setCartItems(updated);
    setSelectAll(updated.every((item) => item.selected));
  };

  const handleIncrease = (id) => {
    const item = cartItems.find((item) => item.variant_id === id);
    console.log("🚀 ~ handleIncrease ~ cartItems:", cartItems);
    if (item) {
      const newQuantity = item.quantity + 1;
      dispatch(
        fetchUpdateCartQuantity({ variant_id: id, quantity: newQuantity })
      )
        .unwrap()
        .then(() => {
          dispatch(fetchCart());
        })
        .catch(() => {
          toast.error("Không thể cập nhật số lượng!");
        });
    }
  };

  const handleDecrease = (id) => {
    const item = cartItems.find((item) => item.variant_id === id);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      dispatch(
        fetchUpdateCartQuantity({ variant_id: id, quantity: newQuantity })
      )
        .unwrap()
        .then(() => {
          dispatch(fetchCart());
        })
        .catch(() => {
          toast.error("Không thể cập nhật số lượng!");
        });
    } else {
      toast.warn("Tối thiểu là 1 sản phẩm");
    }
  };

  const handleChangeQuantity = (id, value) => {
    const newQuantity = Number(value);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      const item = cartItems.find((item) => item.variant_id === id);
      if (item) {
        dispatch(
          fetchUpdateCartQuantity({ variant_id: id, quantity: newQuantity })
        )
          .unwrap()
          .then(() => {
            dispatch(fetchCart());
          })
          .catch(() => {
            toast.error("Không thể cập nhật số lượng!");
          });
      }
    } else {
      toast.warn("Số lượng không hợp lệ");
    }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = cartItems
      .filter((item) => item.selected)
      .map((item) => item.variant_id);
    if (selectedIds.length === 0) {
      toast.warn("Vui lòng chọn sản phẩm để xóa!");
      return;
    }
    for (const id of selectedIds) {
      await dispatch(deleteProductCart(id));
    }
    dispatch(fetchCart());
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price_snapshot,
    0
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, []);
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
                          key={item.variant_id}
                          item={item}
                          selectAll={selectAll}
                          handleSelectItem={handleSelectItem}
                          handleIncrease={() => handleIncrease(item.variant_id)}
                          handleDecrease={() => handleDecrease(item.variant_id)}
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
                    <button type="button" onClick={handleDeleteSelected}>
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
                    {t("shoppingCart.totalPrice")}:{" "}
                    <span>{numberFormat(totalPrice)}</span>
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
