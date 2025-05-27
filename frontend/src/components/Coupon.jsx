import { RiShoppingBag3Fill } from "react-icons/ri";
import { FaCopy } from "react-icons/fa6";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { HiSave } from "react-icons/hi";
import dayjs from "dayjs";

const Coupon = ({ voucher, isMyVoucher }) => {
  const inputRef = useRef(null);
  const { t } = useTranslation();
  const handleCopyVoucher = () => {
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, 99999);

    navigator.clipboard
      .writeText(inputRef.current.value)
      .then(() => toast.success(t("breadcrumbVoucher.success")))
      .catch((err) => console.error(t("breadcrumbVoucher.err"), err));
  };

  const handleSaveVoucher = () => {
    toast.success(t("voucher.saveSuccess"));
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="voucher-card d-flex rounded shadow-sm p-3">
        <div className="voucher-date text-center position-relative">
          <div className="voucher-circle top-circle"></div>
          <div className="voucher-date-inner">
            <span className="voucher-day">
              <RiShoppingBag3Fill />
            </span>
          </div>
          <div className="voucher-circle bottom-circle"></div>
        </div>

        <div className="voucher-content pl-4">
          <div className="btn_copy_voucher">
            {isMyVoucher ? (
              <>
                <HiSave
                  onClick={handleSaveVoucher}
                  style={{ cursor: "pointer", width: 28 }}
                />
                <span className="tooltip">{t("voucher.iconSave")}</span>
              </>
            ) : (
              <>
                <FaCopy
                  onClick={handleCopyVoucher}
                  style={{ cursor: "pointer" }}
                />
                <span className="tooltip">{t("voucher.iconCopy")}</span>
              </>
            )}
          </div>

          <small className="fw-bold">{voucher.code}</small>
          <input
            ref={inputRef}
            value={voucher.code}
            readOnly
            style={{ position: "absolute", left: "-9999px" }}
          />

          <h5 className="voucher-heading">{voucher.title}</h5>
          <div className="voucher-info">
            <span>
              {dayjs(voucher.start_date).format("HH:mm | DD.MM.YYYY")} -{" "}
              {dayjs(voucher.end_date).format("HH:mm | DD.MM.YYYY")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
