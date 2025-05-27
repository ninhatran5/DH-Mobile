import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchVouhcer } from "../slices/voucherSlice";
import Breadcrumb from "../components/Breadcrumb";
import Coupon from "../components/Coupon";
import Loading from "../components/Loading";

export default function MyDiscountCode() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { vouchers, loading } = useSelector((state) => state.voucher);
  useEffect(() => {
    dispatch(fetchVouhcer());
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
            {vouchers.map((voucher) => (
              <Coupon
                key={voucher.voucher_id}
                voucher={voucher}
                isMyVoucher={false}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
