import { useState } from "react";
import { toast } from "react-toastify";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { FaDeleteLeft } from "react-icons/fa6";

const TableShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      quantity: 1,
      unitPrice: 10,
      color: "Titan Tự Nhiên",
      version: "512GB",
      selected: false,
    },
    {
      id: 2,
      name: "iPhone 16 Pro Max 512GB | Chính hãng VN/A",
      quantity: 1,
      unitPrice: 10,
      color: "Titan Trắng",
      version: "512GB",
      selected: false,
    },
    {
      id: 3,
      name: "iPhone 16 Pro Max 1TB | Chính hãng VN/A",
      quantity: 1,
      unitPrice: 10,
      color: "Titan Đen",
      version: "512GB",
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const { t } = useTranslation();

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    const updated = cartItems.map((item) => ({
      ...item,
      selected: newValue,
    }));
    setCartItems(updated);
  };

  const handleSelectItem = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setCartItems(updated);
    // Check if all items are selected to update 'selectAll' state
    const allSelected = updated.every((item) => item.selected);
    setSelectAll(allSelected);
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

  return (
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
          <th className="text-center">{t("tableHeaders.quantity")}</th>
          <th className="text-center">{t("tableHeaders.color")}</th>
          <th className="text-end">{t("tableHeaders.version")}</th>
          <th className="text-end">{t("tableHeaders.totalPrice")}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {cartItems.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => handleSelectItem(item.id)}
              />
            </td>
            <td className="product__cart__item">
              <div className="product__cart__item__pic">
                <img src={iphone} alt="product" />
              </div>
              <div className="product__cart__item__text">
                <h6>{item.name}</h6>
                <h5>{item.unitPrice}đ</h5>
              </div>
            </td>
            <td className="quantity__item">
              <div className="quantity d-flex justify-content-center">
                <div className="pro-qty-2 d-flex">
                  <GrFormPrevious
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDecrease(item.id)}
                  />
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChangeQuantity(item.id, e.target.value)
                    }
                    style={{ width: 40, textAlign: "center" }}
                  />
                  <MdOutlineNavigateNext
                    style={{ cursor: "pointer" }}
                    onClick={() => handleIncrease(item.id)}
                  />
                </div>
              </div>
            </td>
            <td className="cart__price ">{item.color}</td>
            <td className="cart__price text-end">{item.version}</td>
            <td className="cart__price text-end">
              {item.quantity * item.unitPrice}đ
            </td>
            <td className="cart__close" style={{ cursor: "pointer" }}>
              <i style={{ marginLeft: 27 }}></i>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableShoppingCart;
