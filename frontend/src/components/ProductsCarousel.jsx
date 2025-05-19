import { useNavigate } from "react-router-dom";

const ProductsCarousel = ({ item, discountPercent }) => {
  const navigate = useNavigate();
  const nextProductDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };
  return (
    <>
      <div
        className="card mb-3 p-3 rounded-4 shadow border-0"
        style={{ cursor: "pointer" }}
        onClick={() => nextProductDetail(item.id)}
      >
        {discountPercent !== null && (
          <span className="badge bg-success position-absolute mt-1">
            -{discountPercent}%
          </span>
        )}
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={item.image}
              className="img-fluid rounded"
              alt={item.title}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body py-0">
              <h5 className="card-title">{item.title}</h5>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <h6
                  style={{
                    color: "#e40303",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  className="mb-0"
                >
                  {item.price}
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
                  {item.priceOriginal}
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
