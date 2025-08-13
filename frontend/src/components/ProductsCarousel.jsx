import { useNavigate } from "react-router-dom";
import numberFormat from "../../utils/numberFormat";
import { useDispatch, useSelector } from "react-redux";
import { addViewProducts } from "../slices/viewProductSlice";
const ProductsCarousel = ({ item, discountPercent }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { viewProducts: _ } = useSelector((state) => state.viewProduct);

  return (
    <>
      <div
        className="card mb-3 p-3 rounded-4 shadow border-0"
        style={{ cursor: "pointer" }}
        onClick={() => {
          dispatch(
            addViewProducts({
              productId: item?.product?.product_id,
              userId: item?.user_id,
            })
          );
          navigate(`/product-detail/${item?.product.product_id}`);
        }}
      >
        {discountPercent !== null && (
          <span className="badge bg-success position-absolute mt-1">
            -{discountPercent}%
          </span>
        )}
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={item?.product?.image_url}
              className="img-fluid rounded"
              alt={item?.product?.name}
              style={{
                height: "120px",
                width: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body py-0">
              <h5
                className="card-title"
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "black",
                  display: "-webkit-box",
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minHeight: "52px",
                  marginBottom: 20,
                  marginTop: 10
                }}
              >
                {item?.product?.name}
              </h5>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: "-15px" }}>
                <h6
                  style={{
                    color: "#e40303",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  className="mb-0"
                >
                  {numberFormat(item?.product?.price)}
                </h6>
                <h6
                  style={{
                    color: "#e40303",
                    fontSize: 13,
                    textDecoration: "line-through",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  className="mb-0"
                >
                  {numberFormat(item?.product?.price_original)}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ProductsCarousel;
