import { HiWallet } from "react-icons/hi2";
import numberFormat from "../../utils/numberFormat";
import "./InsufficientFundsModal.css";
import { useTranslation } from "react-i18next";

const InsufficientFundsModal = ({
  show,
  walletBalance,
  priceAfterDiscounts,
  handleCancelWalletUse,
  handleProceedWithVNPay,
}) => {
  const { t } = useTranslation();
  if (!show) return null;
  return (
    <div className="insufficient-modal-overlay" onClick={handleCancelWalletUse}>
      <div className="insufficient-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="insufficient-modal-header">
          <button
            type="button"
            className="insufficient-modal-close"
            onClick={handleCancelWalletUse}
          >
            ×
          </button>
          <div className="insufficient-modal-header-content">
            <div className="insufficient-modal-wallet-icon">
              <HiWallet size={28} style={{ color: "white" }} />
            </div>
            <h4 className="insufficient-modal-title">{t("modal.walletInsufficientTitle")}</h4>
            <p className="insufficient-modal-desc">{t("modal.walletInsufficientDesc")}</p>
          </div>
        </div>
        <div className="insufficient-modal-body">
          <div className="insufficient-modal-info-box">
            <div className="insufficient-modal-info-row">
              <span>{t("modal.walletCurrentBalance")}</span>
              <span className="insufficient-modal-green">{numberFormat(walletBalance)}</span>
            </div>
            <div className="insufficient-modal-info-row">
              <span>{t("modal.walletTotalRequired")}</span>
              <span className="insufficient-modal-yellow">{numberFormat(priceAfterDiscounts)}</span>
            </div>
            <hr className="insufficient-modal-divider" />
            <div className="insufficient-modal-info-row">
              <span>{t("modal.walletShortAmount")}</span>
              <span className="insufficient-modal-red">{numberFormat(priceAfterDiscounts - walletBalance)}</span>
            </div>
          </div>
          <div className="insufficient-modal-tip-box">
            <div className="insufficient-modal-tip-icon">i</div>
            <p>
              {t("modal.walletTip", {
                wallet: numberFormat(walletBalance),
                short: numberFormat(priceAfterDiscounts - walletBalance),
              })}
            </p>
          </div>
          <div className="insufficient-modal-actions">
            <button type="button" className="insufficient-modal-cancel" onClick={handleCancelWalletUse}>
              {t("modal.cancel")}
            </button>
            <button type="button" className="insufficient-modal-vnpay" onClick={handleProceedWithVNPay}>
              {t("modal.payWithVNPay")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientFundsModal;
