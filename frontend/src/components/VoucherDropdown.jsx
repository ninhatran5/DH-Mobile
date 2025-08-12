import numberFormat from "../../utils/numberFormat";
import "../assets/css/voucherDropDown.css"
export default function VoucherDropdown({ voucher, handleSelectVoucher }) {
  const voucherData = voucher.voucher;

  return (
    <div
      onClick={() => handleSelectVoucher(voucher)}
      className="checkout-voucher-apply-item"
    >
      <div className="checkout-voucher-apply-code">{voucherData?.code}</div>
      <div className="checkout-voucher-apply-title">{voucherData?.title}</div>
      <div className="checkout-voucher-apply-details">
        Giảm: {numberFormat(voucherData?.discount_amount)} - Tối thiểu:{" "}
        {numberFormat(voucherData?.min_order_value)}
      </div>
    </div>
  );
}
