import "../assets/css/voucher.css";
import Coupon from "../components/Coupon";
import Breadcrumb from "../components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchVouhcer } from "../slices/voucherSlice";
import Loading from "../components/Loading";

const Voucher = () => {
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
        title={t("breadcrumbVoucher.breadcrumbHeader")}
        mainItem={t("breadcrumbVoucher.breadcrumbTitleHome")}
        secondaryItem={t("breadcrumbVoucher.breadcrumbHeader")}
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
                isMyVoucher={true}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
export default Voucher;
