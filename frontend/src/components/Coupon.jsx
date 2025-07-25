/* eslint-disable no-unused-vars */
import { RiShoppingBag3Fill } from "react-icons/ri";
import { FaCopy } from "react-icons/fa6";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { HiSave } from "react-icons/hi";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { fetchVoucher, saveVoucher } from "../slices/voucherSlice";
import Swal from "sweetalert2";
import numberFormat from "../../utils/numberFormat";
import { LuSaveOff } from "react-icons/lu";
import { MdBlockFlipped } from "react-icons/md";

const Coupon = ({ voucher, isMyVoucher, item, showItemQuantity }) => {
  const inputRef = useRef(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const checkQuantityVoucher = voucher?.quantity;
  const handleCopyVoucher = () => {
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, 99999);

    navigator.clipboard
      .writeText(inputRef.current.value)
      .then(() => toast.success(t("breadcrumbVoucher.success")))
      .catch((err) => console.error(t("breadcrumbVoucher.err"), err));
  };

  const handleSaveVoucher = async () => {
    try {
      const result = await dispatch(saveVoucher(voucher.voucher_id));
      if (result.meta && result.meta.requestStatus === "fulfilled") {
        Swal.fire({
          icon: "success",
          title: t("voucher.saveSuccess"),
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: "swal2-padding-custom",
          },
        });
        dispatch(fetchVoucher());
      } else {
        throw new Error(result.error?.message || t("voucher.saveError"));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("voucher.saveError"),
        showConfirmButton: false,
        timer: 1800,
        customClass: {
          popup: "swal2-padding-custom",
        },
      });
    }
  };

  return (
    <div className="col-lg-4 mb-5">
      <div className="userVoucher-card">
        <div className="userVoucher-leftSide">
          <RiShoppingBag3Fill className="userVoucher-icon-bag" />
        </div>

        <div className="userVoucher-dashedLine">
          <div className="userVoucher-circle userVoucher-topCircle"></div>
          <div className="userVoucher-circle userVoucher-bottomCircle"></div>
        </div>

        <div className="userVoucher-content">
          <div className="userVoucher-copyBtn">
            <div className="userVoucher-quantity">
              {showItemQuantity ? (
                <span>{item.quantity}</span>
              ) : (
                <span>{voucher.quantity}</span>
              )}
            </div>
            {isMyVoucher ? (
              voucher.is_active === 1 ? (
                <div className="userVoucher-icon-wrapper">
                 <MdBlockFlipped  className="userVoucher-icon"/>

                  <span className="userVoucher-tooltip">
                    {t("voucher.iconSaveClose")}
                  </span>
                </div>
              ) : checkQuantityVoucher > 0 ? (
                <div className="userVoucher-icon-wrapper">
                  <HiSave
                    onClick={handleSaveVoucher}
                    className="userVoucher-icon"
                  />
                  <span className="userVoucher-tooltip">
                    {t("voucher.iconSave")}
                  </span>
                </div>
              ) : (
                <div className="userVoucher-out-of-stock">
                  <span>Đã hết mã</span>
                </div>
              )
            ) : (
              <div className="userVoucher-icon-wrapper">
                <FaCopy
                  onClick={handleCopyVoucher}
                  className="userVoucher-icon"
                />
                <span className="userVoucher-tooltip">
                  {t("voucher.iconCopy")}
                </span>
              </div>
            )}
          </div>

          <div className="userVoucher-code">{voucher.code}</div>
          <input
            ref={inputRef}
            value={voucher.code}
            readOnly
            style={{ position: "absolute", left: "-9999px" }}
          />

          <h5 className="userVoucher-title">{voucher.title}</h5>
          <div className="userVoucher-date-right">
            {t("voucher.expiry")}:{" "}
            {dayjs(voucher.end_date).format("DD/MM/YYYY")}
          </div>
          <div>
            <p className="userVoucher-info-item">
              {t("voucher.minOrder")}:{" "}
              <span>{numberFormat(voucher.min_order_value)}</span>
            </p>
            <p className="userVoucher-info-item2">
              {t("voucher.discountAmount")}:{" "}
              <span>{numberFormat(voucher.discount_amount)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
