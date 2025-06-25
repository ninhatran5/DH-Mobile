import Swal from "sweetalert2";
import { Modal, Button } from "react-bootstrap";
import UpdateAddressForm from "./UpdateAddressForm";
import { useRef } from "react";

export default function UpdateAddressModal({
  show,
  onHide,
  onUpdateAddress,
  defaultValues,
}) {
  const formRef = useRef();
  const handleClose = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đóng?",
      text: "Các thay đổi chưa được lưu sẽ bị mất.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đóng",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      onHide();
    }
  };
  const handleComplete = async () => {
    const result = await Swal.fire({
      title: "Xác nhận cập nhật",
      text: "Bạn có chắc chắn muốn cập nhật địa chỉ này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });
    if (result.isConfirmed && formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <Modal size="xl" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <h4 className="modal_change_address_title">Cập nhật địa chỉ</h4>
      </Modal.Header>
      <Modal.Body>
        <UpdateAddressForm
          ref={formRef}
          onSubmitExternal={onUpdateAddress}
          defaultValues={defaultValues}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn_save_address" onClick={handleComplete}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
