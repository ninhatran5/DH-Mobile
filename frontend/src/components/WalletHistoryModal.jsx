import { useTranslation } from "react-i18next";
import "../assets/css/wallet-modal.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchBalanceFluctuation, fetchWallet } from "../slices/walletSlice";
import numberFormat from "../../utils/numberFormat";
import Loading from "./Loading";
import dayjs from "dayjs";

const WalletHistoryModal = ({ show, onClose }) => {
  const [closing, setClosing] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { wallets, balanceFluctuation, loading } = useSelector(
    (state) => state.wallet
  );

  useEffect(() => {
    if (!wallets?.wallet_id) {
      dispatch(fetchWallet());
    } else {
      dispatch(fetchBalanceFluctuation(wallets.wallet_id));
    }
  }, [dispatch, wallets?.wallet_id]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 300);
  };

  if (!show && !closing) return null;

  const getSignByType = (type) => {
    const normalized = type?.toLowerCase();
    if (normalized === "hoàn tiền") return "+ ";
    if (normalized === "trả tiền" || normalized === "tiêu tiền") return "- ";
    return "";
  };

  const getColorByType = (type) => {
    const normalized = type?.toLowerCase();
    return normalized === "trả tiền" || normalized === "tiêu tiền"
      ? "#dc2626"
      : "#16a34a";
  };

  return (
    <>
      {loading && <Loading />}
      <div className="wallet-modal-overlay">
        <div
          className={`wallet-modal-content${
            closing ? " wallet-modal-closing" : ""
          }`}
        >
          <div className="wallet-modal-header">
            <h4>{t("walletHistory.title")}</h4>
            <button className="wallet-modal-close" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="wallet-modal-body">
            {balanceFluctuation.length === 0 ? (
              <div className="wallet-modal-empty">
                {t("walletHistory.empty")}
              </div>
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
                  {balanceFluctuation.map((transaction, idx) => {
                    const sign = getSignByType(transaction?.type);
                    const color = getColorByType(transaction?.type);
                    const amount = numberFormat(
                      Math.abs(Number(transaction?.amount))
                    );

                    return (
                      <tr key={idx}>
                        <td>
                          {dayjs(transaction?.created_at).format(
                            "HH:mm - DD/MM/YYYY"
                          )}
                        </td>
                        <td>{transaction?.type}</td>
                        <td style={{ color, fontWeight: 600 }}>
                          {sign}
                          {amount}
                        </td>
                        <td>{transaction?.note || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletHistoryModal;
