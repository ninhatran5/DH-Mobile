import { useTranslation } from "react-i18next";
import "../assets/css/wallet-modal.css";

const WalletHistoryModal = ({ show, onClose, transactions = [] }) => {
  const { t } = useTranslation();
  if (!show) return null;

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal-content">
        <div className="wallet-modal-header">
          <h4>{t("walletHistory.title")}</h4>
          <button className="wallet-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="wallet-modal-body">
          {transactions.length === 0 ? (
            <div className="wallet-modal-empty">{t("walletHistory.empty")}</div>
          ) : (
            <table className="wallet-modal-table">
              <thead>
                <tr>
                  <th>{t("walletHistory.time")}</th>
                  <th>{t("walletHistory.type")}</th>
                  <th>{t("walletHistory.amount")}</th>
                  <th>{t("walletHistory.note")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.time}</td>
                    <td>{tx.type}</td>
                    <td
                      style={{
                        color: tx.amount > 0 ? "#16a34a" : "#dc2626",
                        fontWeight: 600,
                      }}
                    >
                      {tx.amount > 0 ? "+" : "-"}
                      {Math.abs(tx.amount).toLocaleString("vi-VN")}đ
                    </td>
                    <td>{tx.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletHistoryModal;
