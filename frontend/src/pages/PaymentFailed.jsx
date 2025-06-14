import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaCircleXmark } from "react-icons/fa6";

const PaymentFailed = () => {
  const { t } = useTranslation();

  return (
    <div className="container-fluid d-flex justify-content-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          marginTop: 20,
          marginBottom: 50,
          border: "none",
        }}
      >
        {/* Icon thất bại */}
        <motion.div
          className="mb-4 text-center"
          initial={{ scale: 0 }}
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ display: "inline-block" }}
          >
            <FaCircleXmark style={{ fontSize: 90, color: "red" }} />
          </motion.div>
        </motion.div>

        {/* Nội dung */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t("paymentfailed.paymentErrorr")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t("paymentfailed.thankYouMessage")}
            <br />
            {t("paymentfailed.thankYouMessage2")}
          </motion.p>

          <motion.div
            className="d-flex justify-content-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link to={"/"}>
              <button className="btn btn-outline-danger mt-3">
                {t("paymentfailed.backToHome")}
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
