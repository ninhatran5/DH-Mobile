import { useTranslation } from "react-i18next";
import "../assets/css/wallet-modal.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchBalanceFluctuation, fetchWallet } from "../slices/walletSlice";
import numberFormat from "../../utils/numberFormat";
import Loading from "./Loading";
import dayjs from "dayjs";

const WalletHistoryModal = ({ show, onClose }) => {
  const [closing, setClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

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

  useEffect(() => {
    if (show) {
      setCurrentPage(1);
      setSearchTerm("");
      setSelectedType("");
    }
  }, [show]);

  const transactionTypes = useMemo(() => {
    const types = [...new Set(balanceFluctuation.map((item) => item.type))];
    return types.filter((type) => type);
  }, [balanceFluctuation]);

  const filteredData = useMemo(() => {
    let filtered = balanceFluctuation;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.type?.toLowerCase().includes(searchLower) ||
          item.note?.toLowerCase().includes(searchLower) ||
          item.amount?.toString().includes(searchTerm)
      );
    }

    if (selectedType) {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    return filtered;
  }, [balanceFluctuation, searchTerm, selectedType]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 300);
  };

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

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
    if (normalized === "rút tiền" || normalized === "tiêu tiền") return "- ";
    return "";
  };

  const getColorByType = (type) => {
    const normalized = type?.toLowerCase();
    return normalized === "trả tiền" ||
      normalized === "rút tiền" ||
      normalized === "tiêu tiền"
      ? "#dc2626"
      : "#16a34a";
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
  };
  const typeLabelMap = {
    "rút tiền": "Rút tiền",
    "tiêu tiền": "Tiêu tiền",
    "hoàn tiền": "Hoàn tiền",
  };

  const getTypeLabel = (type) => {
    if (!type) return "-";
    const key = type.toLowerCase();
    return typeLabelMap[key] ?? type;
  };

  const getNoteStyle = (note) => {
    if (note && note.toLowerCase().includes("rút tiền thành công")) {
      return { color: "#d32f2f", fontWeight: 600 };
    }
    if (
      note &&
      note.toLowerCase().includes("yêu cầu rút tiền đang chờ xử lý")
    ) {
      return { color: "#e0a514", fontWeight: 500 };
    }
    return {};
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

          <div className="wallet-modal-filters">
            <div className="wallet-filter-row">
              <div className="wallet-search-box">
                <input
                  type="text"
                  placeholder={t("walletHistory.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="wallet-search-input"
                />
                <svg
                  className="wallet-search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>

              <div className="wallet-type-filter">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="wallet-type-select"
                >
                  <option value="">
                    {t("walletHistory.filter.allTypes") || "Tất cả loại"}
                  </option>
                  {transactionTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedType) && (
                <button
                  onClick={handleClearFilters}
                  className="wallet-clear-filters-btn"
                  title={t("walletHistory.filter.clear") || "Xóa bộ lọc"}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {(searchTerm || selectedType) && (
              <div className="wallet-filter-results">
                {t("walletHistory.filter.results", { count: totalItems })}
                {selectedType && (
                  <span className="wallet-filter-tag">
                    {t("walletHistory.filter.type")} {selectedType}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="wallet-modal-body">
            {filteredData.length === 0 ? (
              <div className="wallet-modal-empty">
                {searchTerm || selectedType
                  ? t("walletHistory.noResults") ||
                    "Không tìm thấy giao dịch nào phù hợp"
                  : t("walletHistory.emptyTransaction") ||
                    "Chưa có giao dịch nào"}
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
                          <td>{getTypeLabel(transaction?.type)}</td>
                          <td style={{ color, fontWeight: 600 }}>
                            {sign}
                            {amount}
                          </td>
                          <td style={getNoteStyle(transaction?.note)}>
                            {transaction?.note || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

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
