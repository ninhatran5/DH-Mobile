import numberFormat from "../../utils/numberFormat";
import "../assets/css/voucherDropDown.css";
import { TbTicket } from "react-icons/tb";
import { useTranslation } from "react-i18next";

export default function VoucherDropdown({ voucher, handleSelectVoucher }) {
  const voucherData = voucher.voucher;
  const { t } = useTranslation();

  return (
    <div
      onClick={() => handleSelectVoucher(voucher)}
      className="checkout-voucher-apply-item"
    >
      <div className="voucher-icon">
        <TbTicket size={20} />
      </div>

      <div className="voucher-content">
        <div className="voucher-header">
          <div className="checkout-voucher-apply-code">{voucherData?.code}</div>
          <div className="voucher-badge">{t("voucher.sale")}</div>
        </div>

        <div className="checkout-voucher-apply-title">{voucherData?.title}</div>

        <div className="checkout-voucher-apply-details">
          {t("voucher.discount")}{" "}
          <span className="discount-value">
            {voucherData?.discount_type === "percent"
              ? `${parseFloat(voucherData?.discount_amount)}%`
              : `${numberFormat(voucherData?.discount_amount)}`}
          </span>{" "}
          {t("voucher.forOrdersFrom")}{" "}
          <span className="minimum-value">
            {numberFormat(voucherData?.min_order_value)}
          </span>
        </div>
      </div>

      <div className="voucher-arrow">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </div>
    </div>
  );
}
