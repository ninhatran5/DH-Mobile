import { MdOutlineNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import numberFomat from "../../utils/numberFormat";
import { useNavigate } from "react-router-dom";

const TableShoppingCart = ({
  item,
  handleSelectItem,
  handleIncrease,
  handleDecrease,
  handleChangeQuantity,
}) => {
  const navigate = useNavigate();
  const handleNextPageDetail = () => {
    navigate(`/product-detail/${item?.variant?.product_id}`);
  };
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => handleSelectItem(item.variant_id)}
        />
      </td>
      <td onClick={handleNextPageDetail} className="product__cart__item">
        <div className="product__cart__item__pic" style={{ cursor: "pointer" }}>
          <img src={item?.variant?.image_url} alt="product" />
        </div>
        <div className="product__cart__item__text">
          <h5 style={{ cursor: "pointer" }}>{item?.variant?.product?.name}</h5>
          <h6>{numberFomat(item?.variant?.price)}</h6>
        </div>
      </td>
      <td className="quantity__item">
        <div className="quantity d-flex justify-content-center">
          <div className="pro-qty-2 d-flex">
            <GrFormPrevious
              style={{ cursor: "pointer" }}
              onClick={() => handleDecrease(item.cart_item_id)}
            />
            <input
              type="text"
              value={item.quantity}
              onChange={(e) =>
                handleChangeQuantity(item.cart_item_id, e.target.value)
              }
              style={{ width: 40, textAlign: "center" }}
            />
            <MdOutlineNavigateNext
              style={{ cursor: "pointer" }}
              onClick={() => handleIncrease(item.cart_item_id)}
            />
          </div>
        </div>
      </td>
      <td className="cart__price text-center ">
        {item?.variant?.attribute_values?.[0]?.value}
      </td>
      <td className="cart__price text-center">
        {item?.variant?.attribute_values?.[1]?.value}
      </td>
      <td className="cart__price text-end">
        {numberFomat(item?.quantity * item?.variant?.price)}
      </td>
      <td className="cart__close" style={{ cursor: "pointer" }}>
        <i style={{ marginLeft: 27 }}></i>
      </td>
    </tr>
  );
};

export default TableShoppingCart;
