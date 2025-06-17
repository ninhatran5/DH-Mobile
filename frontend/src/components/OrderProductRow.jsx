import { useNavigate } from "react-router-dom";
import numberFormat from "../../utils/numberFormat";

const OrderProductRow = ({ product }) => {
  console.log("🚀 ~ OrderProductRow ~ product:", product)
  const navigate = useNavigate();
  const handleNextProduct = () => {
    navigate(`/product-detail/${product.product_id}`);
  };

  const color =
    product.variant_attributes?.find(
      (attr) => attr.attribute_name === "Màu sắc"
    )?.attribute_value || "";
  const version =
    product.variant_attributes?.find((attr) => attr.attribute_name === "Bộ nhớ")
      ?.attribute_value || "";

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <img
            onClick={handleNextProduct}
            src={product.product_image}
            alt={product.product_name}
            className="me-2"
            style={{
              width: 70,
              height: 70,
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        </div>
      </td>
      <td>
        <div
          onClick={handleNextProduct}
          className="align-middle"
          style={{ cursor: "pointer" }}
        >
          {product.product_name}
        </div>
      </td>
      <td className="align-middle">{product.quantity}</td>
      <td className="align-middle">{color}</td>
      <td className="align-middle">{version}</td>
      <td className="align-middle">{numberFormat(product.price)}</td>
      <td className="align-middle fw-bold">{numberFormat(product.subtotal)}</td>
    </tr>
  );
};

export default OrderProductRow;
