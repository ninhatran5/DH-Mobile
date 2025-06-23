// components/ReturnRequestModal.jsx
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail, refundOrder } from "../slices/orderSlice";
import numberFormat from "../../utils/numberFormat";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ReturnRequestModal = ({ show, handleClose, orderId, caseType = 1 }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const maxChars = 2000;
  const dispatch = useDispatch();
  const { orderDetail } = useSelector((state) => state.order);
  const navigate = useNavigate();
  const handleNextPageOrderDetail = (id) => {
    handleClose();
    navigate(`/product-detail/${id}`);
  };

  const returnReasonsCase1 = [
    { value: "", label: "Chọn lý do" },
    { value: "Hàng bể vỡ", label: "Hàng bể vỡ" },
    { value: "Hàng lỗi, không hoạt động", label: "Hàng lỗi, không hoạt động" },
    { value: "Hàng giả, nhái", label: "Hàng giả, nhái" },
    { value: "Hàng khác với mô tả", label: "Hàng khác với mô tả" },
    { value: "Hàng đã qua sử dụng", label: "Hàng đã qua sử dụng" },
    { value: "Lý do khác", label: "Lý do khác" },
  ];
  const returnReasonsCase2 = [
    { value: "", label: "Chọn lý do" },
    { value: "Thiếu hàng", label: "Thiếu hàng" },
    { value: "Người bán gửi sai hàng", label: "Người bán gửi sai hàng" },
    { value: "Lý do khác", label: "Lý do khác" },
  ];

  const returnReasons =
    caseType === 1 ? returnReasonsCase1 : returnReasonsCase2;

  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchOrderDetail(orderId));
  }, [orderId, dispatch]);

  const handleSubmit = async () => {
    try {
      await dispatch(
        refundOrder({
          id: orderId,
          reason,
          reasonOther: description,
        })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Đã gửi yêu cầu",
        text: "Chúng tôi sẽ xử lý trong thời gian sớm nhất.",
        confirmButtonText: "Đóng",
      });

      handleClose();
      setReason("");
      setDescription("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error || "Gửi yêu cầu thất bại",
      });
    }
  };

  const handleCloseWithConfirm = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đóng?",
      text: "Thông tin bạn nhập sẽ không được lưu.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đóng",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      handleClose();
    }
  };

  return (
    <>
      <Modal size="lg" show={show} onHide={handleCloseWithConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="modal_change_address_title">
              Yêu cầu Trả hàng/Hoàn tiền
            </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            {orderDetail?.products?.map((product, index) => (
              <div className="d-flex mt-3" key={index}>
                <div className="border_image_return">
                  <img
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleNextPageOrderDetail(product.product_id)
                    }
                    className="image_return"
                    src={product.product_image || ""}
                    alt={product.product_name}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleNextPageOrderDetail(product.product_id)
                    }
                    className="title_return_product"
                  >
                    {product.product_name}
                  </p>
                  <div className="color_return_product">
                    <p className="desc_return_product">
                      {product.variant_attributes?.find(
                        (attr) =>
                          attr.attribute_name.toLowerCase() === "màu sắc"
                      )?.attribute_value || "Không rõ"}
                    </p>
                    <p className="quantity_return_product">
                      x{product.quantity}
                    </p>
                  </div>
                  <p className="price_return_product">
                    {numberFormat(product.price || 0)}
                  </p>
                </div>
              </div>
            ))}

            <hr className="hr_return" />
            <div className="return-reason-group d-flex align-items-center mb-3">
              <label
                htmlFor="reasonSelect"
                className="return-label me-2 mb-0"
                style={{ minWidth: "80px" }}
              >
                Lý do
              </label>
              <div className="flex-grow-1">
                <select
                  id="reasonSelect"
                  className="return-select form-select w-100"
                  value={reason}
                  style={{ fontSize: "15px" }}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {returnReasons.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="hr_return" />
            <div>
              <p className="refund_amount">Số tiền hoàn lại</p>
              <p className="refund_price">
                {numberFormat(orderDetail?.total_amount || 0)}
              </p>
            </div>

            <hr className="hr_return" />
            <div className="return-description mb-3">
              <label
                htmlFor="additionalInfo"
                className="return-label form-label"
              >
                Mô tả
              </label>
              <textarea
                id="additionalInfo"
                className="return-textarea form-control"
                rows="4"
                placeholder="Ghi chú thêm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={maxChars}
              ></textarea>
              <p
                className="text-end text-muted mt-1"
                style={{ fontSize: "13px" }}
              >
                {description.length}/{maxChars} ký tự
              </p>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="email_return">Email</p>
              <p className="email_address_return">{orderDetail?.email || ""}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWithConfirm}>
            Đóng
          </Button>
          <Button
            className="btn_save_address"
            onClick={handleSubmit}
            disabled={!description}
          >
            Gửi yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReturnRequestModal;
