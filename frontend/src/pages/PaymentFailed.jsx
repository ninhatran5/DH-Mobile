import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCircleXmark } from "react-icons/fa6";

const PaymentFailed = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="container-fluid">
        <div
          className=" col-md-4 bg-white shadow-md p-5"
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            border: "none",
            marginTop: 20,
            marginBottom: 50,
          }}
        >
          <div className="mb-4 text-center">
            <FaCircleXmark style={{ fontSize: 90, color: "red" }} />
          </div>
          <div className="text-center">
            <h1>{t("paymentfailed.paymentErrorr")}</h1>
            <p>
              {t("paymentfailed.thankYouMessage")}
              <br />
              {t("paymentfailed.thankYouMessage2")}
            </p>
            <Link to={"/"}>
              <button className="btn btn-outline-danger mt-2">
                {t("paymentfailed.backToHome")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
