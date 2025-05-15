import { Link } from "react-router-dom";
import "../assets/css/order_detail.css";
import iphone from "../assets/images/iphone-16-pro-max.webp";
import Breadcrumb from "./Breadcrumb";
import { useTranslation } from "react-i18next";
import { RiArrowGoBackFill } from "react-icons/ri";

const OrderDetail = () => {
  const { t } = useTranslation();

  const statusSteps = [
    { label: t("orderDetail.status.pending"), active: true },
    { label: t("orderDetail.status.confirmed"), active: true },
    { label: t("orderDetail.status.waitingPickup"), active: true },
    { label: t("orderDetail.status.delivering"), active: false },
    { label: t("orderDetail.status.delivered"), active: false },
  ];

  const orderInfo = [
    { label: t("orderDetail.receiver"), value: "Nguyễn Văn A" },
    { label: t("orderDetail.phone"), value: "0123456789" },
    {
      label: t("orderDetail.address"),
      value: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    },
    {
      label: t("orderDetail.paymentMethod"),
      value: t("orderDetail.cod"),
    },
    { label: t("orderDetail.note"), value: "Giao hàng giờ hành chính" },
  ];

  const products = [
    {
      name: "iPhone 14 Pro Max",
      image: iphone,
      quantity: 2,
      color: "Tím",
      version: "256GB",
      unitPrice: "27.990.000₫",
      totalPrice: "55.980.000₫",
    },
  ];

  const totalAmount = "56.010.000₫";

  return (
    <>
      <Breadcrumb
        title={t("orderDetail.title")}
        mainItem={t("orderDetail.home")}
        mainItem2={t("orderDetail.orderList")}
        secondaryItem={t("orderDetail.title")}
        linkMainItem={"/"}
        linkMainItem2={"/order-history"}
      />
      <div className="card_order_detail container-fluid px-1 px-md-4 py-5 mx-auto">
        <div className="row d-flex justify-content-between px-3">
          <div className="d-flex">
            <h5>
              {t("orderDetail.order")}:
              <span
                className="text-primary font-weight-bold"
                style={{ marginLeft: 8 }}
              >
                #Y34XDHR
              </span>
            </h5>
          </div>
          <div className="d-flex flex-column text-sm-right">
            <p className="mb-0">
              {t("orderDetail.orderDate")}: <span>01/12/19</span>
            </p>
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div className="col-12">
            <ul id="progressbar">
              {statusSteps.map((step, index) => (
                <li
                  key={index}
                  className={`step0 ${step.active ? "active" : ""}`}
                >
                  <span className="step-label">{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="row px-3 mt-4">
          <div className="col-12">
            <div className="order-info-table">
              <h5 className="mb-3">{t("orderDetail.info")}</h5>
              <table className="table table-bordered">
                <tbody>
                  {orderInfo.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold" style={{ width: "30%" }}>
                        {item.label}
                      </td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row px-3 mt-4">
          <div className="col-12">
            <div className="product-table">
              <h5 className="mb-3">{t("orderDetail.productDetail")}</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="bg-light">
                    <tr>
                      <th>{t("orderDetail.image")}</th>
                      <th>{t("orderDetail.product")}</th>
                      <th>{t("orderDetail.quantity")}</th>
                      <th>{t("orderDetail.color")}</th>
                      <th>{t("orderDetail.version")}</th>
                      <th>{t("orderDetail.unitPrice")}</th>
                      <th>{t("orderDetail.totalPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="me-2"
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold">{p.name}</div>
                        </td>
                        <td className="align-middle">{p.quantity}</td>
                        <td className="align-middle">{p.color}</td>
                        <td className="align-middle">{p.version}</td>
                        <td className="align-middle">{p.unitPrice}</td>
                        <td className="align-middle fw-bold">{p.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="6" className="text-end fw-bold">
                        {t("orderDetail.total")}
                      </td>
                      <td className="fw-bold text-primary">{totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>

                <Link to={"/order-history"} className="btn btn-secondary mt-3">
                  <RiArrowGoBackFill />
                  <span style={{ marginLeft: 5 }}>{t("orderDetail.back")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;
