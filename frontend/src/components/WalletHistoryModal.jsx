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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số item mỗi trang

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

  // Reset về trang 1 khi modal mở
  useEffect(() => {
    if (show) {
      setCurrentPage(1);
    }
  }, [show]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 300);
  };

  // Tính toán phân trang
  const totalItems = balanceFluctuation.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = balanceFluctuation.slice(startIndex, endIndex);

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tạo danh sách các trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
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
              <>
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
                    {currentItems.map((transaction, idx) => {
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

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="wallet-pagination">
                    <div className="wallet-pagination-info">
                      {t("walletHistory.pagination.showing", {
                        start: startIndex + 1,
                        end: Math.min(endIndex, totalItems),
                        total: totalItems,
                      })}
                    </div>
                    <div className="wallet-pagination-controls">
                      <button
                        className="wallet-pagination-btn wallet-pagination-prev"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title={t("walletHistory.pagination.previous")}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                      </button>

                      {currentPage > 3 && (
                        <>
                          <button
                            className="wallet-pagination-btn"
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="wallet-pagination-dots">...</span>
                          )}
                        </>
                      )}

                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          className={`wallet-pagination-btn ${
                            page === currentPage ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="wallet-pagination-dots">...</span>
                          )}
                          <button
                            className="wallet-pagination-btn"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        className="wallet-pagination-btn wallet-pagination-next"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title={t("walletHistory.pagination.next")}
                      >
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
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletHistoryModal;
