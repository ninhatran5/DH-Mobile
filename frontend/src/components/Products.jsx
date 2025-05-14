import { FaRegHeart, FaShippingFast } from "react-icons/fa";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowDownShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import "../assets/css/products.css";
import { toast } from "react-toastify";

export default function Products({
  title,
  showHeader = true,
  padding,
  filter = true,
}) {
  const navigate = useNavigate();
  const nextProductDetail = () => {
    navigate("/product-detail/:id");
  };
  const addToFavorites = () => {
    console.log("added");
    toast.success("Đã thêm vào yêu thích");
  };

  const addToShoppingCart = () => {
    console.log("added");
    toast.success("Đã thêm vào giỏ hàng");
    navigate("/shopping-cart");
  };
  const products = [
    {
      name: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      price: "27.890.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
    {
      name: "Samsung Galaxy S22 Ultra 512GB",
      price: "29.990.000đ",
      image: iphone,
    },
  ];
  return (
    <>
      <section className={padding}>
        <div className="container-fluid">
          {filter && (
            <div className="filter-bar-wrapper">
              <div className="filter-extended">
                <div className="filter-group">
                  <label>Thương hiệu:</label>
                  <select>
                    <option value="">Tất cả</option>
                    <option value="iphone">iPhone</option>
                    <option value="samsung">Samsung</option>
                    <option value="xiaomi">Xiaomi</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Khoảng giá:</label>
                  <select>
                    <option value="">Tất cả</option>
                    <option value="duoi-10tr">Dưới 10 triệu</option>
                    <option value="10-20tr">10 - 20 triệu</option>
                    <option value="tren-20tr">Trên 20 triệu</option>
                  </select>
                </div>
              </div>
              <div className="filter-buttons">
                <button>
                  <span>
                    <FaArrowUpWideShort />
                  </span>
                  Giá Thấp - Cao
                </button>
                <button>
                  <span>
                    <FaArrowDownShortWide />
                  </span>
                  Giá Cao - Thấp
                </button>
                <button>
                  <span>
                    <FaShippingFast />
                  </span>
                  Sẵn hàng
                </button>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-md-12">
              <div className="bootstrap-tabs product-tabs">
                {showHeader && (
                  <div className="tabs-header d-flex justify-content-between border-bottom my-5">
                    <h3>{title}</h3>
                    <nav>
                      <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <Link
                          to={"/products"}
                          className="nav-link text-uppercase fs-6 active"
                        >
                          Đi đến shop →
                        </Link>
                      </div>
                    </nav>
                  </div>
                )}
                <div className="tab-content" id="nav-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="nav-all"
                    role="tabpanel"
                    aria-labelledby="nav-all-tab"
                  >
                    <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                      {products.map((product, index) => (
                        <div className="col" key={index}>
                          <div className="product-item">
                            <a
                              onClick={addToFavorites}
                              style={{ cursor: "pointer" }}
                              className="btn-wishlist"
                            >
                              <FaRegHeart style={{ fontSize: 20 }} />
                            </a>
                            <figure>
                              <Link
                                to={"/product-detail/:id"}
                                title={product.name}
                              >
                                <img
                                  src={product.image}
                                  className="tab-image"
                                />
                              </Link>
                            </figure>
                            <h3
                              onClick={nextProductDetail}
                              style={{ cursor: "pointer" }}
                            >
                              {product.name}
                            </h3>
                            <span className="price">{product.price}</span>
                            <div className="d-flex align-items-center justify-content-between">
                              <a
                                onClick={addToShoppingCart}
                                style={{ cursor: "pointer" }}
                                className="nav-link"
                              >
                                Add to Cart
                                <iconify-icon icon="uil:shopping-cart" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
