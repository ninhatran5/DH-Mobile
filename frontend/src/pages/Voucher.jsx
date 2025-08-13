/* eslint-disable react-hooks/exhaustive-deps */
import "../assets/css/voucher.css";
import Coupon from "../components/Coupon";
import dayjs from "dayjs";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchVoucher } from "../slices/voucherSlice";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router-dom";

const Voucher = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { vouchers, loading, meta } = useSelector((state) => state.voucher);
  console.log("🚀 ~ Voucher ~ vouchers:", vouchers)
  const perPage = meta?.per_page || 10;
  const totalPages =
    meta?.last_page || Math.ceil((vouchers?.length || 0) / perPage);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageParam);
  useEffect(() => {
    dispatch(fetchVoucher());
  }, [dispatch]);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(1);
  }, [vouchers, totalPages]);
  useEffect(() => {
    setSearchParams((params) => {
      params.set("page", currentPage);
      return params;
    });
  }, [currentPage, setSearchParams]);
  useEffect(() => {
    if (currentPage !== pageParam) setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const paginatedVouchers = vouchers
    ? vouchers.slice((currentPage - 1) * perPage, currentPage * perPage)
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
        <div className="userVoucher-margin">
          <div className="row">
            {paginatedVouchers?.map((voucher) => {
              const isActive = voucher?.is_active === 1;
              const isExpired = voucher?.end_date && dayjs(voucher.end_date).isBefore(dayjs());
              if (isActive && !isExpired) {
                return (
                  <Coupon
                    key={voucher?.voucher_id}
                    voucher={voucher}
                    isMyVoucher={true}
                  />
                );
              }
              return null;
            })}
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
