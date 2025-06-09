import "../assets/css/voucher.css";
import Coupon from "../components/Coupon";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchVouhcer } from "../slices/voucherSlice";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";

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
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>
    </>
  );
};
export default Voucher;
