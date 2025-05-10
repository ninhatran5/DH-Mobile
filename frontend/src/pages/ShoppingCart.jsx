import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import TableShoppingCart from "../components/TableShoppingCart";

const ShoppingCart = () => {
  return (
    <>
      <section className="breadcrumb-option">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="breadcrumb__text">
                <h4>Giỏ Hàng</h4>
                <div className="breadcrumb__links">
                  <Link style={{ textDecoration: "none" }} to={"/"}>
                    Trang chủ
                  </Link>
                  <Link style={{ textDecoration: "none" }} to={"/products"}>
                    Sản phẩm
                  </Link>
                  <span>Giỏ hàng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6">
                  <div className="continue__btn update__btn">
                    <button type="button">
                      <FaTrash />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="cart__discount">
                <h6>Mã giảm giá</h6>
                <form action="#">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá của bạn..."
                  />
                  <button type="submit">Áp dụng</button>
                </form>
              </div>
              <div className="cart__total">
                <h6>Tổng giỏ hàng</h6>
                <ul style={{ marginLeft: -30 }}>
                  <li>
                    Mã giảm giá <span>- 0đ</span>
                  </li>
                  <li>
                    Tổng tiền: <span>10đ</span>
                  </li>
                </ul>
                <Link
                  to={"/checkout"}
                  style={{ textDecoration: "none" }}
                  className="primary-btn"
                >
                  Tiến hành thanh toán
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
