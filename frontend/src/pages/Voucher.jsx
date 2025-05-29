import "../assets/css/voucher.css";
import Coupon from "../components/Coupon";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchVouhcer } from "../slices/voucherSlice";
import Loading from "../components/Loading";

const Voucher = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { vouchers, loading } = useSelector((state) => state.voucher);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 6;
  const totalPages = Math.ceil((vouchers?.length || 0) / vouchersPerPage);

  useEffect(() => {
    dispatch(fetchVouhcer());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [vouchers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedVouchers = vouchers
    ? vouchers.slice(
        (currentPage - 1) * vouchersPerPage,
        currentPage * vouchersPerPage
      )
    : [];

  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbVoucher.breadcrumbHeader")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbVoucher.breadcrumbHeader")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <section className="container-fluid">
        <div className="voucher_margin">
          <div className="row">
            {paginatedVouchers.map((voucher) => (
              <Coupon
                key={voucher.voucher_id}
                voucher={voucher}
                isMyVoucher={true}
              />
            ))}
          </div>
          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center my-4">
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item${
                      currentPage === 1 ? " disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item${
                        currentPage === i + 1 ? " active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item${
                      currentPage === totalPages ? " disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
export default Voucher;
