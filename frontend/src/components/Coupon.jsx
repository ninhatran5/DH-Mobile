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
    <div className="col-lg-3 mb-4">
      <div className="userVoucher-card">
        <div className="userVoucher-leftSide">
          <RiShoppingBag3Fill className="userVoucher-icon-bag" />
        </div>
        
        <div className="userVoucher-dashedLine">
          <div className="userVoucher-circle userVoucher-topCircle"></div>
          <div className="userVoucher-circle userVoucher-bottomCircle"></div>
        </div>

        <div className="userVoucher-content">
          <div className="userVoucher-copyBtn">
            {isMyVoucher ? (
              <>
                <HiSave
                  onClick={handleSaveVoucher}
                  className="userVoucher-icon"
                />
                <span className="userVoucher-tooltip">{t("voucher.iconSave")}</span>
              </>
            ) : (
              <>
                <FaCopy
                  onClick={handleCopyVoucher}
                  className="userVoucher-icon"
                />
                <span className="userVoucher-tooltip">{t("voucher.iconCopy")}</span>
              </>
            )}
          </div>

          <div className="userVoucher-code">{voucher.code}</div>
          <input
            ref={inputRef}
            value={voucher.code}
            readOnly
            style={{ position: "absolute", left: "-9999px" }}
          />

          <h5 className="userVoucher-title">{voucher.title}</h5>
          <div className="userVoucher-date">
            {dayjs(voucher.start_date).format("HH:mm")} | {dayjs(voucher.start_date).format("DD.MM.YYYY")} - {dayjs(voucher.end_date).format("HH:mm")} | {dayjs(voucher.end_date).format("DD.MM.YYYY")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
