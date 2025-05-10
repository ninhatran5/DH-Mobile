import { RiShoppingBag3Fill } from "react-icons/ri";
import { FaCopy } from "react-icons/fa6";
import { useRef } from "react";
import { toast } from "react-toastify";

const Coupon = ({ voucher }) => {
  const inputRef = useRef(null);

  const handleCopyVoucher = () => {
    inputRef.current.select();
    inputRef.current.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard
      .writeText(inputRef.current.value)
      .then(() => toast.success("Đã sao chép mã voucher!"))
      .catch((err) => console.error("Lỗi khi sao chép:", err));
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="voucher-card d-flex rounded shadow-sm p-3">
        <div className="voucher-date text-center position-relative">
          <div className="voucher-circle top-circle"></div>
          <div className="voucher-date-inner">
            <span className="voucher-day">
              <RiShoppingBag3Fill />
            </span>
          </div>
          <div className="voucher-circle bottom-circle"></div>
        </div>

        <div className="voucher-content pl-4">
          {/* Nút sao chép */}
          <div className="btn_copy_voucher">
            <FaCopy onClick={handleCopyVoucher} style={{ cursor: "pointer" }} />
            <span className="tooltip">Copy</span>
          </div>

          {/* Hiển thị mã + input ẩn để copy */}
          <small className="fw-bold">{voucher.code}</small>
          <input
            ref={inputRef}
            value={voucher.code}
            readOnly
            style={{ position: "absolute", left: "-9999px" }} // ẩn đi
          />

          <h5 className="voucher-heading">{voucher.title}</h5>
          <div className="voucher-info">
            <span>Copy mã và sử dụng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
