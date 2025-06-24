import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchVoucerForUser } from "../slices/voucherSlice";
import Breadcrumb from "../components/Breadcrumb";
import Coupon from "../components/Coupon";
import Loading from "../components/Loading";

export default function MyDiscountCode() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { vouchers, loading } = useSelector((state) => state.voucher);
  useEffect(() => {
    dispatch(fetchVoucerForUser());
    const handleFocus = () => {
      dispatch(fetchVoucerForUser());
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);
  return (
    <>
      {loading && <Loading />}
      <Breadcrumb
        title={t("breadcrumbVoucher.breadcrumbHeaderForMe")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbVoucher.breadcrumbHeaderForMe")}
        linkMainItem={"/"}
        showMainItem2={false}
      />
      <section className="container-fluid">
        <div className="voucher_margin">
          <div className="row">
            {vouchers.map((item) => (
              <Coupon
                key={
                  item.voucher_id ||
                  item.voucher?.voucher_id ||
                  item.user_voucher_id
                }
                voucher={item.voucher ? item.voucher : item}
                isMyVoucher={false}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
