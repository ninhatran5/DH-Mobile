import Modal from "react-bootstrap/Modal";
import { PiImageBroken } from "react-icons/pi";
import { SlSocialDropbox } from "react-icons/sl";

const ReturnReasonModal = ({ show, handleClose, handleOpenSubModal }) => {
  return (
    <Modal size="l" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <h4 className="modal_change_address_title">
            Tình huống bạn đang gặp?
          </h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-fluid">
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={handleOpenSubModal}
            style={{ cursor: "pointer" }}
          >
            <div className="icon_return">
              <PiImageBroken />
            </div>
            <div>
              <p className="title_return">
                Tôi đã nhận được hàng nhưng hàng có vấn đề (bể vỡ, sai mẫu, hàng
                lỗi, khác mô tả...) - Miễn ship hoàn về
              </p>
              <p className="title_description">
                Lưu ý: Trường hợp yêu cầu Trả hàng/Hoàn tiền của bạn được chấp
                nhận, Voucher có thể sẽ không được hoàn lại
              </p>
            </div>
          </div>
          <hr className="hr_return" />
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={handleOpenSubModal}
            style={{ cursor: "pointer" }}
          >
            <div className="icon_return_2">
              <SlSocialDropbox />
            </div>
            <div>
              <p className="title_return_2">
                Tôi chưa nhận hàng/nhận thiếu hàng
              </p>
              <p className="title_description2">
                Lưu ý: Trường hợp yêu cầu Trả hàng/Hoàn tiền của bạn được chấp
                nhận, Voucher, phí vận chuyển có thể sẽ không được hoàn lại
              </p>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReturnReasonModal;
