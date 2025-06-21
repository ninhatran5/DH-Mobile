// components/ReturnRequestModal.jsx
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail } from "../slices/orderSlice";
import numberFormat from "../../utils/numberFormat";
import Swal from "sweetalert2";

const ReturnRequestModal = ({ show, handleClose, orderId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch();
  const { orderDetail } = useSelector((state) => state.order);

  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchOrderDetail(orderId));

    const interval = setInterval(() => {
      dispatch(fetchOrderDetail(orderId));
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, dispatch]);

  const handleSubmit = () => {
    const data = {
      orderId,
      product: orderDetail?.products?.[0]?.product_name,
      color:
        orderDetail?.products?.[0]?.variant_attributes?.find(
          (attr) => attr.attribute_name.toLowerCase() === "màu sắc"
        )?.attribute_value || "Không rõ",
      quantity: orderDetail?.products?.[0]?.quantity || 0,
      price: numberFormat(orderDetail?.products?.[0]?.price || 0),
      refund: numberFormat(orderDetail?.total_amount || 0),
      reason,
      description,
      email: "Tunglnph49038@Gmail.com",
    };

    console.log("Yêu cầu trả hàng:", data);

    Swal.fire({
      icon: "success",
      title: "Đã gửi yêu cầu",
      text: "Chúng tôi sẽ xử lý trong thời gian sớm nhất.",
      confirmButtonText: "Đóng",
    });

    handleClose(); // đóng modal sau khi gửi
    setReason(""); // reset form
    setDescription("");
  };

  return (
    <Modal size="lg" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h4 className="modal_change_address_title">
            Yêu cầu Trả hàng/Hoàn tiền
          </h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          <div className="d-flex mt-3">
            <div className="border_image_return">
              <img
                className="image_return"
                src={orderDetail?.products?.[0]?.product_image || ""}
                alt=""
              />
            </div>
            <div>
              <p className="title_return_product">
                {orderDetail?.products?.[0]?.product_name || ""}
              </p>
              <div className="d-flex color_return_product">
                <p className="desc_return_product">
                  {orderDetail?.products?.[0]?.variant_attributes?.find(
                    (attr) => attr.attribute_name.toLowerCase() === "màu sắc"
                  )?.attribute_value || "Không rõ"}
                </p>
                <p className="quantity_return_product">
                  x{orderDetail?.products?.[0]?.quantity || ""}
                </p>
              </div>
              <p className="price_return_product">
                {numberFormat(orderDetail?.products?.[0]?.price || 0)}
              </p>
            </div>
          </div>

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
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">-- Chọn lý do --</option>
                <option value="damaged">Sản phẩm bị hư hỏng</option>
                <option value="wrongItem">Sản phẩm sai mẫu</option>
                <option value="missingItem">Thiếu sản phẩm</option>
                <option value="other">Lý do khác</option>
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
            <label htmlFor="additionalInfo" className="return-label form-label">
              Mô tả
            </label>
            <textarea
              id="additionalInfo"
              className="return-textarea form-control"
              rows="3"
              placeholder="Vui lòng cung cấp thêm thông tin về sự cố."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="email_return">Email</p>
            <p className="email_address_return">Tunglnph49038@Gmail.com</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!reason || !description}
        >
          Gửi yêu cầu
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReturnRequestModal;
